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
	TeamNames,
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
	//! Unfortunately, this function is coupled with generateWeekData() as the year for the postseason switch must be updated in both places. Ugly, but this only affects seeding the database
	// 2019 and 2020 had 16 regular season weeks, 1 postseason week
	// historical data lists week 16 as the bowl week for 2019
	if (year === 2019 && weekNumber === 16) {
		gameType = "postseason";
		week = 1;
	} else if (year === 2020 && weekNumber === 17) {
		gameType = "postseason";
		week = 1;
		// historical data lists week 15 as the bowl week for 2021 through 2023.
	} else if (year >= 2021 && weekNumber === 15) {
		gameType = "postseason";
		week = 1;
	} else {
		gameType = "regular";
		week = weekNumber;
	}
	return [gameType, week];
}

async function getTeamName(abbreviation) {
	const { team_id: teamId } = await TeamNames.findOne({
		attributes: ["team_id"],
		where: { name: abbreviation },
		raw: true,
	});
	return await Teams.findOne({
		attributes: ["school_name"],
		where: { id: teamId },
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
			zip: parseInt(location.zip) ? parseInt(location.zip) : null,
			country_code: location.country_code,
			timezone: location.timezone,
			latitude: parseInt(location.latitude)
				? parseInt(location.latitude)
				: null,
			longitude: parseInt(location.longitude)
				? parseInt(location.longitude)
				: null,
			elevation: parseInt(location.elevation)
				? parseInt(location.elevation)
				: null,
			capacity: parseInt(location.capacity)
				? parseInt(location.capacity)
				: null,
			year_constructed: parseInt(location.year_constructed)
				? parseInt(location.year_constructed)
				: null,
			grass: location.grass ? true : false,
			dome: location.dome ? true : false,
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

async function generateTeamData() {
	const modifiedTeamsData = [];
	const teamNameData = [];
	for (const team of teamJSON) {
		modifiedTeamsData.push({
			school_name: team.school,
			conference: team.conference,
			classification: team.classification,
			primary_color: team.color,
			secondary_color: team.alt_color,
			location_id: team.location.name
				? (await getLocationId(team.location.name)).id
				: null,
			mascot: team.mascot,
			primary_logo: team.logos[0],
			secondary_logo: team.logos[1],
			twitter_handle: team.twitter,
		});

		teamNameData.push({
			school_name: team.school,
			abbreviation: team.abbreviation,
			alt_name1: team.alt_name1,
			alt_name2: team.alt_name2,
			alt_name3: team.alt_name3,
			alt_name4: team.alt_name4,
		});
	}

	const teamsData = await Teams.bulkCreate(modifiedTeamsData, {
		individualHooks: true,
		returning: true,
	});
	const teams = teamsData.map((element) => element.get({ plain: true }));

	const teamNames = await generateTeamNameData(teamNameData);

	return [teams, teamNames];
}

async function generateTeamNameData(teamNameData) {
	let teamId;
	const newTeamNameData = [];
	for (const teamNameEntry of teamNameData) {
		teamId = (await getTeamId(teamNameEntry.school_name)).id;
		let teamNames = [
			teamNameEntry.alt_name1,
			teamNameEntry.alt_name2,
			teamNameEntry.alt_name3,
			teamNameEntry.alt_name4,
		];
		newTeamNameData.push({
			team_id: teamId,
			name: teamNameEntry.abbreviation,
		});
		for (const teamName of teamNames) {
			if (!teamName || teamName === teamNameEntry.abbreviation) {
				//skip null values and duplicate names
				continue;
			} else {
				newTeamNameData.push({
					team_id: teamId,
					name: teamName,
				});
			}
		}
	}

	const savedTeamNames = await TeamNames.bulkCreate(newTeamNameData, {
		individualHooks: true,
		returning: true,
	});

	const teamNames = savedTeamNames.map((element) =>
		element.get({ plain: true })
	);

	return teamNames;
}

async function preprocessHistoricalData() {
	let splitIndex, homeTeam, awayTeam, weekId, homeTeamAbbr, awayTeamAbbr;
	const matchups = [];
	const pickData = [];
	let i = 0;
	for (const season of historicalData) {
		for (const week of season) {
			const [gameType, weekNum] = getWeekData(years[i], week.weekNumber);
			for (const game of week.matchUps) {
				splitIndex = game.indexOf("@");
				homeTeamAbbr = game.substring(splitIndex + 1);
				awayTeamAbbr = game.substring(0, splitIndex);

				homeTeam = await getTeamName(homeTeamAbbr);
				awayTeam = await getTeamName(awayTeamAbbr);

				weekId = (await getWeekId(years[i], gameType, weekNum)).id;
				matchups.push({
					home: homeTeam.school_name,
					homeAbbr: homeTeamAbbr,
					away: awayTeam.school_name,
					awayAbbr: awayTeamAbbr,
					weekId,
					year: years[i],
					gameType,
					weekNum,
				});
			}
			for (const picks of week.pickData) {
				pickData.push({
					player: picks.playerName,
					games: picks.games,
					weekId,
				});
			}
		}
		i++;
	}
	return [matchups, pickData];
}

async function generateGamesData(matchups) {
	let params, gameData, homeTeamId, awayTeamId, locationId, championId;
	const allGamesData = [];
	const badGames = [];

	// Iterate through each game and retrieve its information from the API server
	for (const game of matchups) {
		try {
			params = {
				year: game.year,
				week: game.weekNum,
				home: game.home,
				away: game.away,
				seasonType: game.gameType,
			};

			// API database has listed the home and away teams backwards. This conditional corrects the issue.
			if (
				params.year === 2022 &&
				params.week === 1 &&
				params.home === "LSU" &&
				params.away === "Florida State"
			) {
				params = {
					year: 2022,
					week: 1,
					home: "Florida State",
					away: "LSU",
					seasonType: "regular",
				};
				// API database correctly shows that the below came occurred in week 6 of the season. It was delayed from Saturday week 5 because of Hurricane Ian. This conditional updates the params to retrieve the correct data. To maintain the week 5 slate of 10 games, this game will be listed as a week 5 game.
			} else if (
				params.year === 2022 &&
				params.week === 5 &&
				params.home === "UCF" &&
				params.away === "SMU"
			) {
				params = {
					year: 2022,
					week: 6,
					home: "UCF",
					away: "SMU",
					seasonType: "regular",
				};
			} else if (
				// API database has listed the home and away teams backwards. This conditional corrects the issue.
				params.year === 2023 &&
				params.week === 1 &&
				params.home === "South Carolina" &&
				params.away === "North Carolina"
			) {
				params = {
					year: 2023,
					week: 1,
					home: "North Carolina",
					away: "South Carolina",
					seasonType: "regular",
				};
			}

			gameData = (await getGameData(params)).data[0];

			if (!gameData) {
				throw new Error(
					`No data found for ${game.away} @ ${game.home} in week ${game.weekNum} of ${game.gameType} of ${game.year} (weekId: ${game.weekId}, homeAbbr: ${game.homeAbbr}, awayAbbr: ${game.awayAbbr})`
				);
			}
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
		} catch (error) {
			badGames.push(game);
			console.error(error);
			console.log("\n");
			continue;
		}
	}

	console.log(badGames);

	const gamesData = await Games.bulkCreate(allGamesData, {
		individualHooks: true,
		returning: true,
	});
	const games = gamesData.map((element) => element.get({ plain: true }));
	return games;
}

async function generatePicksData(pickData) {
	let playerId,
		pickedTeamName,
		pickedTeamId,
		homeTeamName,
		homeTeamId,
		awayTeamName,
		awayTeamId,
		gameData;
	const allPicksData = [];
	const badPicks = [];

	for (const picks of pickData) {
		playerId = (
			await Usernames.findOne({
				attributes: ["user_id"],
				where: { name: picks.player },
				raw: true,
			})
		).user_id;

		for (const game of picks.games) {
			try {
				pickedTeamName = (await getTeamName(game.pickedTeam))
					.school_name;
				pickedTeamId = (await getTeamId(pickedTeamName)).id;

				homeTeamName = (await getTeamName(game.homeTeam)).school_name;
				homeTeamId = (await getTeamId(homeTeamName)).id;

				awayTeamName = (await getTeamName(game.awayTeam)).school_name;
				awayTeamId = (await getTeamId(awayTeamName)).id;

				gameData = await Games.findOne({
					attributes: ["id"],
					where: {
						week_id: picks.weekId,
						[Op.and]: [
							{ home_team_id: homeTeamId },
							{ away_team_id: awayTeamId },
						],
					},
					raw: true,
				});

				if (!gameData) {
					throw new Error(
						`No data found for a pick made by ${picks.player} for the ${awayTeamName} @ ${homeTeamName} game with weekId ${picks.weekId} with picked team ${pickedTeamName} and ${game.pointsWagered} points wagered (points won: ${game.pointsWon}).`
					);
				}

				allPicksData.push({
					user_id: playerId,
					game_id: gameData.id,
					picked_team_id: pickedTeamId,
					week_id: picks.weekId,
					points_wagered: game.pointsWagered,
					points_won: game.pointsWon,
				});
			} catch (error) {
				badPicks.push({
					weekId: picks.weekId,
					player: picks.player,
					homeTeamName,
					awayTeamName,
					pickedTeamName,
					points_wagered: game.pointsWagered,
					points_won: game.pointsWon,
				});
				console.error(error);
				console.log("\n");
				continue;
			}
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

	console.log("Generating User and Username Data...");
	const [users, usernames] = await generateUserData();
	console.log("User and Username Data Generated!\n");

	console.log("Generating Locations Data...");
	const locations = await generateLocationsData();
	console.log("Locations Data Generated!\n");

	console.log("Generating Team and Team Name Data...");
	const [teams, teamNames] = await generateTeamData();
	console.log("Team and Team Name Data Generated!\n");

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
