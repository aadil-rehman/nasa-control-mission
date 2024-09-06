const {
	getAllLaunches,
	addNewLaunch,
	existsLaunchWithId,
	abortLaunchById,
} = require("../../models/launches.model");

function httpGetAllLaunches(req, res) {
	return res.status(200).json(getAllLaunches());
}

function httpAddNewLaunch(req, res) {
	const launch = req.body;

	if (
		!launch.mission ||
		!launch.rocket ||
		!launch.launchDate ||
		!launch.target
	) {
		return res.status(400).json({
			error: "Missing required launch property",
		});
	}

	launch.launchDate = new Date(launch.launchDate);

	if (isNaN(launch.launchDate)) {
		return res.status(400).json({
			error: "Invalid launch date",
		});
	}

	addNewLaunch(launch);
	return res.status(201).json(launch);
}

function httpAbortLaunch(req, res) {
	const launchId = Number(req.body.id);
	console.log("idFromhttpABordt", launchId);
	console.log("re.body.id", req.body.id);
	console.log("re.body", req.body);

	//if launch doesn't exist
	if (!existsLaunchWithId(launchId)) {
		res.status(404).json({
			error: "Launch not found",
		});
	}

	const aborted = abortLaunchById(launchId);
	//if launch does exist
	res.status(200).json(aborted);
}
module.exports = {
	httpGetAllLaunches,
	httpAddNewLaunch,
	httpAbortLaunch,
};
