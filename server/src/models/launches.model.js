const launchesDB = require("./launches.mongo");

const launches = new Map();

let latestFlightNumber = 100;

async function saveLaunches(launch) {
	launchesDB.updateOne(
		{
			flightNumber: launch.flightNumber,
		},
		launch,
		{
			upsert: true,
		}
	);
}

const launch = {
	flightNumber: 100,
	mission: "Kepler Exploration X",
	rocket: "Explorer IS1",
	launchDate: new Date("December 27, 2030"),
	target: "Kepler 442b",
	customers: ["NASA", "WORK"],
	upcoming: true,
	success: true,
};

saveLaunches(launch);
// launches.set(launch.flightNumber, launch);

function existsLaunchWithId(launchId) {
	return launches.has(launchId);
}

async function getAllLaunches() {
	return await launchesDB.find(
		{},
		{
			_id: 0,
			__v: 0,
		}
	);
}

function addNewLaunch(launch) {
	latestFlightNumber++;

	launches.set(
		latestFlightNumber,
		Object.assign(launch, {
			success: true,
			upcoming: true,
			customers: ["NASA", "WORK"],
			flightNumber: latestFlightNumber,
		})
	);
}

function abortLaunchById(launchId) {
	console.log(launchId);
	const aborted = launches.get(launchId);
	console.log(launches);
	console.log(aborted);
	aborted.upcoming = false;
	aborted.success = false;
	return aborted;
}

module.exports = {
	getAllLaunches,
	addNewLaunch,
	existsLaunchWithId,
	abortLaunchById,
};
