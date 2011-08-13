//------------------------------------------------------------------------------
// Park At Work 1.0.0
// (C) Ramón Jiménez
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
// Application state.
//------------------------------------------------------------------------------

var colors = ['orange', 'green', 'red', 'purple', 'yellow', 'brown'];
var minFloor = 1;
var maxFloor = 11;
var currentFloor = 1;

var parkFloor = 0;
var parkLot = 0;
var timeStamp = '';

//------------------------------------------------------------------------------
// Global database object.
//------------------------------------------------------------------------------
var db;

//------------------------------------------------------------------------------
// App initialization.
//------------------------------------------------------------------------------
function onLoad() {
	db = window.openDatabase('parkAtWork', '1.0', 'ParkAtWork Data', 1024, onDBCreate);
	db.readTransaction(function(tx) {
		tx.executeSql("SELECT * FROM ParkData", [], function(tx2, rs) {
			var dbRow = rs.rows.item(0);
			parkFloor = dbRow.parkFloor;
			parkLot = dbRow.parkLot;
			timeStamp = dbRow.timeStamp;
		})
	}, null, function() {
		moveSpotIntoLot(parkLot);
		if(parkFloor > 0)
			currentFloor = parkFloor;
		updateUI();
	});
}

//------------------------------------------------------------------------------
// Database creation callback.  Initialize DB.
//------------------------------------------------------------------------------
function onDBCreate(db) {
	db.transaction(function(tx) {
		tx.executeSql('CREATE TABLE ParkData(parkFloor INTEGER, parkLot INTEGER,'
			+ ' timeStamp TEXT)', [], function(tx, rs) {
				tx.executeSql("INSERT INTO ParkData(parkFloor, parkLot, timeStamp)"
					+ " VALUES (0, 0, '')");
			}
		)
	});
}

//------------------------------------------------------------------------------
// Updates the UI.
//------------------------------------------------------------------------------
function updateUI() {
	var floorIndex = getFloorIndex();
	var floorName = floorIndex + ((currentFloor % 2 == 0) ? 'A' : 'B');
	var floor = document.getElementById('floor');
	floor.style.backgroundColor = colors[floorIndex - 1];
	floor.innerText = floorName;
	if(timeStamp.length > 0)
		document.getElementById('timeStamp').innerText = timeStamp;
	document.getElementById('spot').style.display =
		(currentFloor == parkFloor) ? 'block' : 'none';

}

//------------------------------------------------------------------------------
// Determines the parking floor index.
//------------------------------------------------------------------------------
function getFloorIndex() {
	return (currentFloor < 3) ? currentFloor : Math.floor(currentFloor / 2.0 + 1);
}

//------------------------------------------------------------------------------
// Replaces an image with its hover version.
//------------------------------------------------------------------------------
function hover(id) {
	document.getElementById(id).src = id + '-hover.png';
}

//------------------------------------------------------------------------------
// Restores an image's non-hovered appearance.
//------------------------------------------------------------------------------
function hoverOff(id) {
	document.getElementById(id).src = id + '.png';
}

//------------------------------------------------------------------------------
// If possible, go up one floor.
//------------------------------------------------------------------------------
function upStairs() {
	if(currentFloor < maxFloor) {
		currentFloor++;
		updateUI();
	}
}

//------------------------------------------------------------------------------
// If possible, go down one floor.
//------------------------------------------------------------------------------
function downStairs() {
	if(currentFloor > minFloor) {
		currentFloor--;
		updateUI();
	}
}

//------------------------------------------------------------------------------
// Update parking location.
//------------------------------------------------------------------------------
function updateLocation(lotId) {
	parkFloor = currentFloor;
	parkLot = lotId;
	moveSpotIntoLot(lotId);
	timeStamp = getTimeStamp();
	updateUI();
	db.transaction(function(tx) {
		tx.executeSql('UPDATE ParkData SET parkFloor=?, parkLot=?, timeStamp=?',
			[parkFloor, parkLot, timeStamp]);
	}, null, function() {		
		alert("Parking location updated");
	});
}

//------------------------------------------------------------------------------
// Nests the spot DIV within the specified lot DIV.
//------------------------------------------------------------------------------
function moveSpotIntoLot(lotId) {
	var spot = document.getElementById('spot');
	spot.parentNode.removeChild(spot);
	var lot = document.getElementById('lot' + lotId);
	lot.appendChild(spot);
	document.getElementById('timeStamp').innerText = timeStamp;	
}

//------------------------------------------------------------------------------
// Obtain a timestamp formatted thus: Day Mth Dte HH:MM
//------------------------------------------------------------------------------
function getTimeStamp() {
	var ts = '';
	var instant = new Date();
	ts += (instant.getMonth() + 1);
	ts += '/';
	ts += instant.getDate();
	ts += ' @ ';
	var hour = instant.getHours();
	var amPm = (hour > 11) ? ' PM' : ' AM';
	if(hour > 12) 
		hour -= 12;
	if(hour == 0)
		hour = 12;
	ts += hour;
	ts += ':';
	var minutes = instant.getMinutes();
	if(minutes < 10)
		minutes = '0' + minutes;
	ts += minutes;
	ts += amPm;
	return ts;
}