import axios from "axios";
import dotenv from "dotenv/config";
import * as fs from "fs";
import { Op } from "sequelize";
import { Teams, Games, Weeks, Locations } from "../models/models.js";

import historicalJSON2019 from "./data/historicalData2019.json" assert { type: "json" };
import historicalJSON2020 from "./data/historicalData2020.json" assert { type: "json" };
import historicalJSON2021 from "./data/historicalData2021.json" assert { type: "json" };
import historicalJSON2022 from "./data/historicalData2022.json" assert { type: "json" };
import historicalJSON2023 from "./data/historicalData2023.json" assert { type: "json" };

const years = [2019, 2020, 2021, 2022, 2023];
const historicalData = [
	historicalJSON2019,
	historicalJSON2020,
	historicalJSON2021,
	historicalJSON2022,
	historicalJSON2023,
];

const apiURL = new URL("https://api.collegefootballdata.com");
const gameAPI = new URL("/games", apiURL);
gameAPI.searchParams.set("year", 2019);
gameAPI.searchParams.set("week", 1);
gameAPI.searchParams.set("team", "Purdue");
gameAPI.searchParams.set("seasonType", "regular");
const token = process.env.BEARER_TOKEN;

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
					console.log(
						"\nYear:",
						gameAPI.searchParams.get("year"),
						"\nSeason Type:",
						gameAPI.searchParams.get("seasonType"),
						"\nWeek:",
						gameAPI.searchParams.get("week"),
						"\nTeam:",
						gameAPI.searchParams.get("team"),
						"\n"
					);
					resolve(response);
				});
		}, 750);
	});
}

async function generateCustomGameData(
	params,
	gameData,
	teamObject,
	fullGameData
) {
	let winningTeam;
	const customGameData = {};
	try {
		let homeTeam = await Teams.findOne({
			attributes: ["id"],
			where: { school_name: gameData.home_team },
		});
		if (homeTeam) {
			customGameData["home_team_id"] = homeTeam.dataValues.id;
		}
	} catch (error) {
		console.log(`\n\n\nWeek: ${params.week}, Year: ${params.year}`);
		console.log(teamObject.school_name);
		console.log(fullGameData);
		console.error(error);
		throw error;
	}

	let awayTeam = await Teams.findOne({
		attributes: ["id"],
		where: { school_name: gameData.away_team },
	});
	if (awayTeam) {
		customGameData["away_team_id"] = awayTeam.dataValues.id;
	}

	if (gameData.home_points > gameData.away_points) {
		winningTeam = gameData.home_team;
	} else if (gameData.away_points > gameData.home_points) {
		winningTeam = gameData.away_team;
	} else {
		//? We have a tie! What do I do for a tie???
		winningTeam = null;
	}
	if (winningTeam) {
		customGameData["winning_team_id"] = (
			await Teams.findOne({
				attributes: ["id"],
				where: { school_name: winningTeam },
			})
		).dataValues.id;
	} else {
		customGameData["winning_team_id"] = winningTeam;
	}

	let week = await Weeks.findOne({
		attributes: ["id"],
		where: { season: params.year, number: params.week },
	});
	if (week) {
		customGameData["week_id"] = week.dataValues.id;
	}

	let location = await Locations.findOne({
		attributes: ["id"],
		where: { name: gameData.venue },
	});
	if (location) {
		customGameData["location_id"] = location.dataValues.id;
	}

	return customGameData;
}

async function createGamesList(seasonData, year) {
	let splitIndex, team, teamObject, params, gameData, seasonType;
	let customGameData;
	const modifiedGamesData = [];
	for (const week of seasonData) {
		if (year === 2019 && week.weekNumber === 16) {
			seasonType = "postseason";
			week.weekNumber = 1;
		} else if (week.weekNumber === 15 && year !== 2020) {
			seasonType = "postseason";
			week.weekNumber = 1;
		} else {
			seasonType = "regular";
		}
		for (const game of week.matchUps) {
			splitIndex = game.indexOf("@");
			team = game.substring(0, splitIndex);
			teamObject = (
				await Teams.findOne({
					where: {
						[Op.or]: [
							{ abbreviation: team },
							{ alt_name1: team },
							{ alt_name2: team },
							{ alt_name3: team },
							{ alt_name4: team },
						],
					},
				})
			).dataValues;
			if (/[\w]+\s+[\w]+/g.test(teamObject.school_name)) {
				teamObject.school_name.replace(/\s/, "%20");
			}
			params = {
				year,
				week: week.weekNumber,
				team: teamObject.school_name,
				seasonType,
			};
			gameData = await getGameData(params); // Returns a list of length 1
			customGameData = await generateCustomGameData(
				params,
				gameData.data[0],
				teamObject,
				gameData
			);
			modifiedGamesData.push({
				home_team_id: customGameData.home_team_id,
				away_team_id: customGameData.away_team_id,
				winning_team_id: customGameData.winning_team_id,
				week_id: customGameData.week_id,
				location_id: customGameData.location_id,
				date: gameData.start_date,
				completed: true,
			});
		}
	}

	return modifiedGamesData;
}
async function main() {
	let games = [];
	//! NEEDS REFACTORING. Ugly code, but works for now...
	for (let i = 0; i < historicalData.length; i++) {
		let gamesList = await createGamesList(historicalData[i], years[i]);
		for (const game of gamesList) {
			games.push(game);
		}
	}
	return games;
}

let games = await main();
console.log(games);
fs.writeFile("./data/games.json", JSON.stringify(games, null, 4), (error) => {
	if (error) {
		console.error(error);
		throw error;
	}
	console.log(`JSON data written to ./data/games.json`);
});
