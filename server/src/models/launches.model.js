const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

// const launches = new Map();

let DEFAULT_FLIGHT_NUMBER = 100;

async function saveLaunches(launch) {
	const planet = await planets.findOne({
		keplerName: launch.target,
	});

	if (!planet) {
		throw new Error("No matching planet found");
	}
	await launches.updateOne(
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
	target: "Kepler-442 b",
	customers: ["NASA", "WORK"],
	upcoming: true,
	success: true,
};

saveLaunches(launch);
// launches.set(launch.flightNumber, launch);

async function existsLaunchWithId(launchId) {
	return await launches.findOne({ flightNumber: launchId });
}

async function getLatestFlightNumber() {
	const latestLaunch = await launches.findOneAndUpdate().sort("-flightNumber");

	if (!latestLaunch) {
		return DEFAULT_FLIGHT_NUMBER;
	}

	return latestLaunch.flightNumber;
}

async function getAllLaunches() {
	return await launches.find(
		{},
		{
			_id: 0,
			__v: 0,
		}
	);
}

async function scheduleNewLaunch(launch) {
	const newFlightNumber = (await getLatestFlightNumber()) + 1;
	const newLaunch = Object.assign(launch, {
		success: true,
		upcoming: true,
		customers: ["ZTM, NASA, WORK"],
		flightNumber: newFlightNumber,
	});

	await saveLaunches(newLaunch);
}

// function addNewLaunch(launch) {
// 	latestFlightNumber++;

// 	launches.set(
// 		latestFlightNumber,
// 		Object.assign(launch, {
// 			success: true,
// 			upcoming: true,
// 			customers: ["NASA", "WORK"],
// 			flightNumber: latestFlightNumber,
// 		})
// 	);
// }

async function abortLaunchById(launchId) {
	const aborted = await launches.updateOne(
		{
			flightNumber: launchId,
		},
		{
			upcoming: false,
			success: false,
		}
	);

	return aborted.acknowledged === true && aborted.matchedCount === 1;
}

module.exports = {
	getAllLaunches,
	scheduleNewLaunch,
	existsLaunchWithId,
	abortLaunchById,
};
