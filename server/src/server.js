const http = require("http");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT || 8000;

const app = require("./app");

const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");

const MONGO_URL = process.env.MONGO_URL;

const server = http.createServer(app);

mongoose.connection.once("open", () => {
	console.log("MongoDB connection ready!");
});

mongoose.connection.on("error", (err) => {
	console.error(err);
});
async function startServer() {
	await mongoose.connect(MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	await loadPlanetsData();
	await loadLaunchData();
	server.listen(PORT, () => {
		console.log(`Listening at port ${PORT}...`);
	});
}

startServer();
