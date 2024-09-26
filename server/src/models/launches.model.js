const axios = require("axios");
const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

// const launches = new Map();

let DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function saveLaunches(launch) {
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
	flightNumber: 100, //flight_number
	mission: "Kepler Exploration X", //name
	rocket: "Explorer IS1", //rocket.name
	launchDate: new Date("December 27, 2030"), //date_local
	target: "Kepler-442 b", //not applicable
	customers: ["NASA", "WORK"], //payload.customers for each payload
	upcoming: true, //upcoming
	success: true, //success
};

saveLaunches(launch);
// launches.set(launch.flightNumber, launch);

async function findLaunch(filter) {
	await launches.findOne(filter);
}
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
	const planet = await planets.findOne({
		keplerName: launch.target,
	});

	if (!planet) {
		throw new Error("No matching planet found");
	}

	const newFlightNumber = (await getLatestFlightNumber()) + 1;
	const newLaunch = Object.assign(launch, {
		success: true,
		upcoming: true,
		customers: ["ZTM, NASA, WORK"],
		flightNumber: newFlightNumber,
	});

	await saveLaunches(newLaunch);
}
async function populateLaunches() {
	console.log("Downloading launches data...");
	const response = await axios.post(SPACEX_API_URL, {
		query: {},
		options: {
			pagination: false,
			populate: [
				{
					path: "rocket",
					select: {
						name: 1,
					},
				},
				{
					path: "payloads",
					select: {
						customers: 1,
					},
				},
			],
		},
	});

	if (response.status !== 200) {
		console.log("Problem downloading launch data");
		throw new Error("Launch data download failed");
	}

	const launchDocs = response.data.docs;

	for (const launchDoc of launchDocs) {
		const payloads = launchDoc["payloads"];
		const customers = payloads.flatMap((payload) => {
			return payload["customers"];
		});
		// console.log(customers);
		const launch = {
			flightNumber: launchDoc["flight_number"],
			mission: launchDoc["name"],
			rocket: launchDoc["rocket"]["name"],
			launchDate: launchDoc["date_local"],
			upcoming: launchDoc["upcoming"],
			success: launchDoc["success"],
			customers,
		};

		console.log(`${launch.flightNumber} ${launch.mission}`);

		await saveLaunches(launch);
	}
}
async function loadLaunchData() {
	const firstLaunch = await findLaunch({
		flightNumber: 1,
		rocket: "Falcon 1",
		mission: "FalconSat",
	});

	if (firstLaunch) {
		console.log("Launch data already loaded!");
		return;
	} else {
		await populateLaunches();
	}
}

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
	loadLaunchData,
	scheduleNewLaunch,
	existsLaunchWithId,
	abortLaunchById,
};
