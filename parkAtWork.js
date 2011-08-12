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
}

//------------------------------------------------------------------------------
// Determines the parking floor index.
//------------------------------------------------------------------------------
function getFloorIndex() {
	return (currentFloor < 3) ? currentFloor : Math.floor(currentFloor / 2.0 + 1);
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
	timeStamp = getTimeStamp();
	document.getElementById('timeStamp').innerText = timeStamp;	
	db.transaction(function(tx) {
		tx.executeSql('UPDATE ParkData SET parkFloor=?, parkLot=?, timeStamp=?',
			[parkFloor, parkLot, timeStamp]);
	}, null, function() {		
		alert("Parking location updated");
	});
}

//------------------------------------------------------------------------------
// Obtain a timestamp formatted thus: Day Mth Dte HH:MM
//------------------------------------------------------------------------------
function getTimeStamp() {
	var ts = '';
	var instant = new Date().toLocaleString().split(' ');
	var i = 0;
	for(; i < 3; i++)
		ts += (instant[i] + ' ');
	instant = instant[4].split(':');
	ts += (instant[0] + ':' + instant[1]);
	return ts;
}