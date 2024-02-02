import sequelize from "../config/connection.js";
import Users from "../models/users.js";
import Usernames from "../models/usernames.js";
import Weeks from "../models/weeks.js";
import Teams from "../models/teams.js";
import Picks from "../models/picks.js";
import Locations from "../models/locations.js";
import Games from "../models/games.js";
import userJSON from "./data/users.json" assert { type: "json" };
import teamJSON from "./data/teams.json" assert { type: "json" };
import historicalJSON2019 from "./data/historicalData2019.json" assert { type: "json" };
import historicalJSON2020 from "./data/historicalData2020.json" assert { type: "json" };
import historicalJSON2021 from "./data/historicalData2021.json" assert { type: "json" };
import historicalJSON2022 from "./data/historicalData2022.json" assert { type: "json" };
import historicalJSON2023 from "./data/historicalData2023.json" assert { type: "json" };

async function generateWeekData() {
	/* Generate Week Data */
	const years = [2019, 2020, 2021, 2022, 2023];
	let maxWeeks;
	const weekData = [];
	for (const year of years) {
		if (year == 2020) {
			maxWeeks = 9;
		} else {
			maxWeeks = 15;
		}
		for (let i = 1; i < maxWeeks + 1; i++) {
			weekData.push({ season: year, number: i });
		}
	}
	const weeksData = await Weeks.bulkCreate(weekData, {
		individualHooks: true,
		returning: true,
	});
	return weeksData.map((element) => element.get({ plain: true }));
}

async function generateUserData() {
	const modifiedUserData = [];
	const usernameData = [];
	for (const user of userJSON) {
		modifiedUserData.push({
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			password: user.password,
		});
		usernameData.push({
			first_name: user.first_name,
			last_name: user.last_name,
			usernames: user.usernames,
		});
	}
	const usersData = await Users.bulkCreate(modifiedUserData, {
		individualHooks: true,
		returning: true,
	});
	return usersData.map((element) => element.get({ plain: true }));
}

async function generateUsernameData() {
	const usernameData = [];
	for (const user of userJSON) {
		usernameData.push({
			first_name: user.first_name,
			last_name: user.last_name,
			usernames: user.usernames,
		});
	}
	const modifiedUsernameData = [];
	let userData;
	for (const user of usernameData) {
		userData = await Users.findOne({
			where: {
				first_name: user.first_name,
				last_name: user.last_name,
			},
		});
		for (let i = 0; i < user.usernames.length; i++) {
			modifiedUsernameData.push({
				name: user.usernames[i],
				user: userData.id,
			});
		}
	}
	const usernamesData = await Usernames.bulkCreate(modifiedUsernameData, {
		individualHooks: true,
		returning: true,
	});
	return usernamesData.map((element) => element.get({ plain: true }));
}

async function generateLocationsData(locationsData) {
	const locations = await Locations.bulkCreate(locationsData, {
		individualHooks: true,
		returning: true,
	});
	return locations.map((element) => element.get({ plain: true }));
}

async function generateTeamsData() {
	const modifiedTeamsData = [];
	const locationsData = [];
	for (const team of teamJSON) {
		locationsData.push({
			name: team.location.name,
			city: team.location.city,
			state: team.location.state,
			zip: team.location.zip,
			country_code: team.location.country_code,
			timezone: team.location.timezone,
			latitude: team.location.latitude,
			longitude: team.location.longitude,
			elevation: team.location.elevation,
			capacity: team.location.capacity,
			year_constructed: team.location.year_constructed,
			grass: team.location.grass,
			dome: team.location.dome,
		});
		modifiedTeamsData.push({
			school_name: team.school,
			mascot: team.mascot,
			abbreviation: team.abbreviation,
			alt_name1: team.alt_name1,
			alt_name2: team.alt_name2,
			alt_name3: team.alt_name3,
			conference: team.conference,
			classification: team.classification,
			color: team.color,
			alt_color: team.alt_color,
			logo: team.logos[0],
			alt_logo: team.logos[1],
			twitter_handle: team.twitter,
			location: { name: team.location.name, zip: team.location.zip },
		});
	}
	const locations = await generateLocationsData(locationsData);

	// Assign location IDs to TeamsData
	let locationData;
	for (let i = 0; i < modifiedTeamsData.length; i++) {
		locationData = await Locations.findOne({
			where: {
				name: modifiedTeamsData[i].location.name,
				zip: modifiedTeamsData[i].location.zip,
			},
		});
		modifiedTeamsData[i].location = locationData.id;
	}
	const teamsData = await Teams.bulkCreate(modifiedTeamsData, {
		individualHooks: true,
		returning: true,
	});
	const teams = teamsData.map((element) => element.get({ plain: true }));
	return [teams, locations];
}

async function generateGamesData() {}

async function generatePicksData() {}

const seedDatabase = async () => {
	await sequelize.sync({ force: true });
	const weeks = await generateWeekData();
	const users = await generateUserData();
	const usernames = await generateUsernameData();
	const [teams, locations] = await generateTeamsData();
	const games = await generateGamesData() {};

	process.exit(0);
};

seedDatabase();
