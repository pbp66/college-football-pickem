import axios from "axios";
import dotenv from "dotenv/config";
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
import userJSON from "./data/json/users.json" assert { type: "json" };
import teamJSON from "./data/json/teams.json" assert { type: "json" };
import locationJSON from "./data/json/locations.json" assert { type: "json" };
import historicalJSON2019 from "./data/json/historicalData2019.json" assert { type: "json" };
import historicalJSON2020 from "./data/json/historicalData2020.json" assert { type: "json" };
import historicalJSON2021 from "./data/json/historicalData2021.json" assert { type: "json" };
import historicalJSON2022 from "./data/json/historicalData2022.json" assert { type: "json" };
import historicalJSON2023 from "./data/json/historicalData2023.json" assert { type: "json" };

const historicalData = [
	historicalJSON2019,
	historicalJSON2020,
	historicalJSON2021,
	historicalJSON2022,
	historicalJSON2023,
];
const years = [2019, 2020, 2021, 2022, 2023];
const apiURL = new URL("https://api.collegefootballdata.com");
const gameAPI = new URL("/games", apiURL);
const token = process.env.BEARER_TOKEN;

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

async function getWeekId(year, season, weekNum) {
	return await Weeks.findOne({
		attributes: ["id"],
		where: { year, season, number: weekNum },
		raw: true,
	});
}

async function getLocationId(venue) {
	return await Locations.findOne({
		attributes: ["id"],
		where: { name: venue },
		raw: true,
	});
}

// params must be a list of key, value pairs
async function getGameData(params) {
	for (const [key, value] of Object.entries(params)) {
		gameAPI.searchParams.set(key, value);
	}

	return new Promise((resolve) => {
		setTimeout(() => {
			axios
				.get(gameAPI, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				.then((response) => {
					// console.log(
					// 	"\nYear:",
					// 	gameAPI.searchParams.get("year"),
					// 	"\nSeason Type:",
					// 	gameAPI.searchParams.get("seasonType"),
					// 	"\nWeek:",
					// 	gameAPI.searchParams.get("week"),
					// 	"\nTeam:",
					// 	gameAPI.searchParams.get("team"),
					// 	"\n"
					// );
					resolve(response);
				});
		}, 750);
	});
}

async function preprocessHistoricalData() {
	let splitIndex, homeTeam, awayTeam, gameType, weekNum;
	const matchups = [];
	const pickData = [];
	let i = 0;
	for (const season of historicalData) {
		for (const week of season) {
			const [gameType, weekNum] = getWeekData(years[i], week.weekNumber);
			for (const game of week.matchUps) {
				splitIndex = game.indexOf("@");
				homeTeam = await getTeamName(game.substring(splitIndex + 1));
				awayTeam = await getTeamName(game.substring(0, splitIndex));
				matchups.push({
					home: homeTeam.school_name,
					away: awayTeam.school_name,
					weekId: (await getWeekId(years[i], gameType, weekNum)).id,
					year: years[i],
					gameType,
					weekNum,
				});
			}
			for (const picks of week.pickData) {
				pickData.push({
					player: picks.playerName,
					games: picks.games,
					weekId: (await getWeekId(years[i], gameType, weekNum)).id,
				});
			}
		}
		i++;
	}
	return [matchups, pickData];
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

	const usernames = await generateUsernameData(usernameData);
	const users = usersData.map((element) => element.get({ plain: true }));

	return [users, usernames];
}

async function generateUsernameData(usernameData) {
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
				user_id: userData.dataValues.id,
			});
		}
	}
	const usernamesData = await Usernames.bulkCreate(modifiedUsernameData, {
		individualHooks: true,
		returning: true,
	});
	return usernamesData.map((element) => element.get({ plain: true }));
}

async function generateLocationsData() {
	const modifiedLocationData = [];
	for (const location of locationJSON) {
		modifiedLocationData.push({
			name: location.name,
			city: location.city,
			state: location.state,
			zip: location.zip,
			country_code: location.country_code,
			timezone: location.timezone,
			latitude: location.latitude,
			longitude: location.longitude,
			elevation: location.elevation,
			capacity: location.capacity,
			year_constructed: location.year_constructed,
			grass: location.grass,
			dome: location.dome,
		});
	}
	const locationData = await Locations.bulkCreate(modifiedLocationData, {
		individualHooks: true,
		returning: true,
	});
	const locations = locationData.map((element) =>
		element.get({ plain: true })
	);
	return locations;
}

async function generateTeamsData() {
	const modifiedTeamsData = [];
	for (const team of teamJSON) {
		modifiedTeamsData.push({
			school_name: team.school,
			mascot: team.mascot,
			abbreviation: team.abbreviation,
			alt_name1: team.alt_name1,
			alt_name2: team.alt_name2,
			alt_name3: team.alt_name3,
			alt_name4: team.alt_name4,
			conference: team.conference,
			classification: team.classification,
			color: team.color,
			alt_color: team.alt_color,
			logo: team.logos[0],
			alt_logo: team.logos[1],
			twitter_handle: team.twitter,
			location: { name: team.location.name, city: team.location.city },
		});
	}

	// Assign location IDs to TeamsData
	let locationData;
	for (let i = 0; i < modifiedTeamsData.length; i++) {
		// If location data is truthy (not null)
		if (modifiedTeamsData[i].location.name) {
			locationData = await Locations.findOne({
				where: {
					name: modifiedTeamsData[i].location.name,
					city: modifiedTeamsData[i].location.city,
				},
				raw: true,
			});
			modifiedTeamsData[i].location = locationData.id;
		}
	}
	const teamsData = await Teams.bulkCreate(modifiedTeamsData, {
		individualHooks: true,
		returning: true,
	});
	const teams = teamsData.map((element) => element.get({ plain: true }));
	return teams;
}

async function generateGamesData(matchups) {
	let params, gameData, homeTeamId, awayTeamId, locationId, championId;
	const allGamesData = [];

	// Iterate through each game and retrieve its information from the API server
	for (const game of matchups) {
		params = {
			year: game.year,
			week: game.weekNum,
			team: game.home,
			seasonType: game.gameType,
		};
		gameData = (await getGameData(params)).data[0];
		homeTeamId = (await getTeamId(game.home)).id;
		awayTeamId = (await getTeamId(game.away)).id;

		// Determine game winner
		if (gameData.home_points > gameData.away_points) {
			championId = homeTeamId;
		} else if (gameData.away_points > gameData.home_points) {
			championId = awayTeamId;
		} else {
			//TODO:
			//? We have a tie! What do I do for a tie???
			championId = null;
		}

		locationId = (await getLocationId(gameData.venue)).id;

		allGamesData.push({
			home_team_id: homeTeamId,
			away_team_id: awayTeamId,
			champion_id: championId,
			week_id: game.weekId,
			location_id: locationId,
			date: gameData.start_date,
			completed: gameData.completed,
		});
	}

	const gamesData = await Games.bulkCreate(allGamesData, {
		individualHooks: true,
		returning: true,
	});
	const games = gamesData.map((element) => element.get({ plain: true }));
	return games;
}

async function generatePicksData(pickData) {
	let playerId, pickedTeamId, pickedTeam, gameId, pickedTeamName, gameInfo;
	const allPicksData = [];

	for (const picks of pickData) {
		playerId = (
			await Usernames.findOne({
				attributes: ["user_id"],
				where: { name: picks.player },
				raw: true,
			})
		).user_id;

		for (const game of picks.games) {
			pickedTeamName = await getTeamName(game.pickedTeam);
			pickedTeam = await getTeamId(pickedTeamName.school_name);
			pickedTeamId = pickedTeam.id;
			gameInfo = await Games.findOne({
				attributes: ["id"],
				where: {
					week_id: picks.weekId,
					[Op.or]: [
						{ home_team_id: pickedTeamId },
						{ away_team_id: pickedTeamId },
					],
				},
				raw: true,
			});
			gameId = gameInfo.id;

			allPicksData.push({
				user_id: playerId,
				picked_team_id: pickedTeamId,
				game_id: gameId,
				week_id: picks.weekId,
				points_wagered: game.pointsWagered,
				points_won: game.pointsWon,
			});
		}
	}

	const picksData = await Picks.bulkCreate(allPicksData, {
		individualHooks: true,
		returning: true,
	});
	const picks = picksData.map((element) => element.get({ plain: true }));
	return picks;
}

const seedDatabase = async () => {
	await sequelize.sync({ force: true });
	console.log("\n\n");
	console.log("Generating Weeks Data...");
	const weeks = await generateWeekData();
	console.log("Weeks Data Generated!\n");

	console.log("Generating User Data...");
	const [users, usernames] = await generateUserData();
	console.log("User Data Generated!\n");

	console.log("Generating Locations Data...");
	const locations = await generateLocationsData();
	console.log("Locations Data Generated!\n");

	console.log("Generating Teams Data...");
	const teams = await generateTeamsData();
	console.log("Teams Data Generated!\n");

	console.log("Preprocessing Historical Data...");
	const [matchups, pickData] = await preprocessHistoricalData();
	console.log("Historical Data Preprocessed!\n");

	console.log("Generating Games Data...");
	const games = await generateGamesData(matchups);
	console.log("Games Data Generated!\n");

	console.log("Generating Picks Data...");
	const picks = await generatePicksData(pickData);
	console.log("Picks Data Generated!\n");

	console.log("Database Seeded Successfully!");

	process.exit(0);
};

seedDatabase();
