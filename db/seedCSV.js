import sequelize from "../config/connection.js";
import { Op } from "sequelize";
import fs from "fs";

import {
	Users,
	Usernames,
	Weeks,
	Teams,
	Picks,
	Locations,
	Games,
} from "../models/models.js";
import historicalJSON2019 from "./data/historicalData2019.json" assert { type: "json" };
import historicalJSON2020 from "./data/historicalData2020.json" assert { type: "json" };
import historicalJSON2021 from "./data/historicalData2021.json" assert { type: "json" };
import historicalJSON2022 from "./data/historicalData2022.json" assert { type: "json" };
import historicalJSON2023 from "./data/historicalData2023.json" assert { type: "json" };

const historicalData = [
	historicalJSON2019,
	historicalJSON2020,
	historicalJSON2021,
	historicalJSON2022,
	historicalJSON2023,
];
const years = [2019, 2020, 2021, 2022, 2023];

function getWeekData(year, weekNumber) {
	let gameType;
	let week;
	if (year === 2019 && weekNumber === 16) {
		gameType = "postseason";
		week = 1;
	} else if (weekNumber === 15 && year !== 2020) {
		gameType = "postseason";
		week = 1;
	} else {
		gameType = "regular";
		week = weekNumber;
	}
	return [gameType, week];
}

async function getWeekId(year, season, weekNum) {
	return await Weeks.findOne({
		attributes: ["id"],
		where: { year, season, number: weekNum },
		raw: true,
	});
}

async function getTeamName(abbreviation) {
	return await Teams.findOne({
		attributes: ["school_name"],
		where: {
			[Op.or]: [
				{ abbreviation },
				{ alt_name1: abbreviation },
				{ alt_name2: abbreviation },
				{ alt_name3: abbreviation },
				{ alt_name4: abbreviation },
			],
		},
		raw: true,
	});
}

async function getTeamId(name) {
	return await Teams.findOne({
		attributes: ["id"],
		where: { school_name: name },
		raw: true,
	});
}

async function generateWeekData() {
	/* Generate Week Data */
	let maxWeeks = 17;
	const weekData = [];
	for (const year of years) {
		if (year == 2019 || year == 2020) {
			// 2019 and 2020 had 16 regular season weeks, 1 postseason week
			for (let i = 1; i <= maxWeeks; i++) {
				weekData.push({
					year,
					season: i < maxWeeks ? "regular" : "postseason",
					number: i < maxWeeks ? i : 1,
				});
			}
		} else {
			// 2021 through 2023 had 15 regular season weeks, 1 postseason week
			for (let i = 1; i < maxWeeks; i++) {
				weekData.push({
					year,
					season: i < maxWeeks - 1 ? "regular" : "postseason",
					number: i < maxWeeks - 1 ? i : 1,
				});
			}
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

	const userCSV = fs.readFileSync("./db/data/users.csv", "utf8");
	const userList = userCSV.split("\n");
	for (const user of userList) {
		const [id, first_name, last_name, username, ...unusedValues] =
			user.split(",");

		modifiedUserData.push({
			id: parseInt(id),
			first_name,
			last_name,
			username,
			email: "",
			password: "",
		});
	}

	const usersData = await Users.bulkCreate(modifiedUserData, {
		individualHooks: true,
		returning: true,
	});

	const users = usersData.map((element) => element.get({ plain: true }));

	return users;
}

async function generateUsernameData() {
	const usernameData = [];

	const usernameCSV = fs.readFileSync("./db/data/usernames.csv", "utf8");
	const usernameList = usernameCSV.split("\n");
	for (const username of usernameList) {
		const [id, name, user_id, created_at, updated_at] = username.split(",");
		usernameData.push({
			id: parseInt(id),
			name,
			user_id: parseInt(user_id),
		});
	}

	const savedUsernames = await Usernames.bulkCreate(usernameData, {
		individualHooks: true,
		returning: true,
	});

	const usernames = savedUsernames.map((element) =>
		element.get({ plain: true })
	);

	return usernames;
}

async function generateLocationsData() {
	const locationData = [];

	const locationCSV = fs.readFileSync("./db/data/locations.csv", "utf8");
	const locationList = locationCSV.split("\n");
	for (const location of locationList) {
		const [
			id,
			name,
			city,
			state,
			zip,
			country_code,
			timezone,
			latitude,
			longitude,
			elevation,
			capacity,
			year_constructed,
			grass,
			dome,
			created_at,
			updated_at,
		] = location.split(",");
		locationData.push({
			id: parseInt(id),
			name,
			city,
			state,
			zip: parseInt(zip) ? parseInt(zip) : null,
			country_code,
			timezone,
			latitude: parseInt(latitude) ? parseInt(latitude) : null,
			longitude: parseInt(longitude) ? parseInt(longitude) : null,
			elevation: parseInt(elevation) ? parseInt(elevation) : null,
			capacity: parseInt(capacity) ? parseInt(capacity) : null,
			year_constructed: parseInt(year_constructed)
				? parseInt(year_constructed)
				: null,
			grass: grass ? true : false,
			dome: dome ? true : false,
		});
	}

	const savedLocations = await Locations.bulkCreate(locationData, {
		individualHooks: true,
		returning: true,
	});

	const locations = savedLocations.map((element) =>
		element.get({ plain: true })
	);

	return locations;
}

async function generateTeamsData() {
	const teamData = [];

	const teamCSV = fs.readFileSync("./db/data/teams.csv", "utf8");
	const teamList = teamCSV.split("\n");
	for (const team of teamList) {
		const [
			id,
			school_name,
			mascot,
			abbreviation,
			alt_name1,
			alt_name2,
			alt_name3,
			alt_name4,
			conference,
			classification,
			color,
			alt_color,
			logo,
			alt_logo,
			twitter_handle,
			location_id,
			created_at,
			updated_at,
		] = team.split(",");
		teamData.push({
			id: parseInt(id),
			school_name,
			mascot,
			abbreviation,
			alt_name1,
			alt_name2,
			alt_name3,
			alt_name4,
			conference,
			classification,
			color,
			alt_color,
			logo,
			alt_logo,
			twitter_handle,
			location_id: parseInt(location_id) ? parseInt(location_id) : null,
		});
	}

	const savedTeams = await Teams.bulkCreate(teamData, {
		individualHooks: true,
		returning: true,
	});

	const teams = savedTeams.map((element) => element.get({ plain: true }));

	return teams;
}

async function generateGamesData() {
	const allGamesData = [];

	const gamesCSV = fs.readFileSync("./db/data/games.csv", "utf8");
	const gameList = gamesCSV.split("\n");
	for (const game of gameList) {
		const [
			id,
			homeTeamId,
			awayTeamId,
			championId,
			weekId,
			locationId,
			alt_name,
			date,
			completed,
			createdAt,
		] = game.split(",");

		allGamesData.push({
			id: parseInt(id),
			home_team_id: parseInt(homeTeamId),
			away_team_id: parseInt(awayTeamId),
			champion_id: parseInt(championId),
			week_id: parseInt(weekId),
			location_id: parseInt(locationId),
			date,
			completed: parseInt(completed),
		});
	}

	const gamesData = await Games.bulkCreate(allGamesData, {
		individualHooks: true,
		returning: true,
	});
	const games = gamesData.map((element) => element.get({ plain: true }));
	return games;
}

async function generatePicksData() {
	const pickData = [];

	const pickCSV = fs.readFileSync("./db/data/picks.csv", "utf8");
	const pickList = pickCSV.split("\n");
	for (const pick of pickList) {
		const [
			id,
			user_id,
			picked_team_id,
			game_id,
			week_id,
			points_wagered,
			points_won,
			...unusedValues
		] = pick.split(",");

		pickData.push({
			id: parseInt(id),
			user_id: parseInt(user_id),
			picked_team_id: parseInt(picked_team_id),
			game_id: parseInt(game_id),
			week_id: parseInt(week_id),
			points_wagered: parseInt(points_wagered),
			points_won: parseInt(points_won),
		});
	}

	const savedPickData = await Picks.bulkCreate(pickData, {
		individualHooks: true,
		returning: true,
	});
	const picks = savedPickData.map((element) => element.get({ plain: true }));
	return picks;
}

const seedDatabase = async () => {
	await sequelize.sync({ force: true });
	console.log("\n\n");

	console.log("Generating Weeks Data...");
	const weeks = await generateWeekData();
	console.log("Weeks Data Generated!\n");

	console.log("Generating User Data...");
	const users = await generateUserData();
	console.log("User Data Generated!\n");

	console.log("Generating Username Data...");
	const username = await generateUsernameData();
	console.log("Username Data Generated!\n");

	console.log("Generating Locations Data...");
	const locations = await generateLocationsData();
	console.log("Locations Data Generated!\n");

	console.log("Generating Teams Data...");
	const teams = await generateTeamsData();
	console.log("Teams Data Generated!\n");

	console.log("Generating Games Data...");
	const games = await generateGamesData();
	console.log("Games Data Generated!\n");

	console.log("Generating Picks Data...");
	const picks = await generatePicksData();
	console.log("Picks Data Generated!\n");

	console.log("Database Seeded Successfully!");

	process.exit(0);
};

seedDatabase();
