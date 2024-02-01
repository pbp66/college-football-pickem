import { google } from "googleapis";
import "dotenv/config";
import * as fs from "fs";

class Week {
	constructor(weekNumber, matchUps, pickData) {
		this.weekNumber = weekNumber;
		this.matchUps = matchUps;
		this.pickData = pickData;
	}
}

class Data {
	constructor(playerName, games) {
		this.playerName = playerName;
		this.games = games;
	}
}

class Game {
	constructor(
		gameNumber,
		homeTeam,
		awayTeam,
		pickedTeam,
		winningTeam,
		pointsWagered,
		pointsWon
	) {
		this.gameNumber = gameNumber;
		this.homeTeam = homeTeam;
		this.awayTeam = awayTeam;
		this.pickedTeam = pickedTeam;
		this.winningTeam = winningTeam;
		this.pointsWagered = pointsWagered;
		this.pointsWon = pointsWon;
	}
}

const sheetsAPI = google.sheets({
	version: "v4",
	auth: process.env.API_KEY,
});

const historicalSheet2019Id = "1AjT1AQywe99yFGX5cQe8Jql7oZbBakTApqGThk9rOLo";
const historicalSheet2020Id = "1-RjQqGLemGLiQi2rd4timvA24PjGkDtLC8K2Ewg-WzM";
const historicalSheet2021Id = "1z5p_JHvNDEZRYWJVbQSiRaF9KOtC0qLzHRBkxRGKLYk";
const historicalSheet2022Id = "1IKULDleiK1QEHUt0y1pF7zE3KB3JOMfoDzKpm7x6tuo";
const historicalSheet2023Id = "1phCjeMld4QMeYgafXvLoLA4kWMmfzt3Mk6jzasWb1hQ";
const historicalSheetIds = [
	historicalSheet2019Id,
	historicalSheet2020Id,
	historicalSheet2021Id,
	historicalSheet2022Id,
	historicalSheet2023Id,
];

//! Javascript will set the variable name as the key if typed as {key: value} rather than use variable subsitution. So... see the alternate approach below
const playerMap = {};
playerMap[historicalSheet2019Id] = 9;
playerMap[historicalSheet2020Id] = 10;
playerMap[historicalSheet2021Id] = 9;
playerMap[historicalSheet2022Id] = 12;
playerMap[historicalSheet2023Id] = 11;

const yearMap = {};
yearMap[historicalSheet2019Id] = 2019;
yearMap[historicalSheet2020Id] = 2020;
yearMap[historicalSheet2021Id] = 2021;
yearMap[historicalSheet2022Id] = 2022;
yearMap[historicalSheet2023Id] = 2023;

let data;

async function main(sheetId) {
	const res = await sheetsAPI.spreadsheets.get({
		spreadsheetId: sheetId,
		includeGridData: true,
	});

	let players = playerMap[sheetId]; //! For additional spreadsheets, update the playerMap
	let sheets = res.data.sheets;
	let matchups;
	let gamesList = [];
	let pickData = [];
	let weekData = [];

	for (let i = 1; i < sheets.length - 2; i++) {
		// Generate Matchup List
		matchups = [];
		for (
			let j = 2;
			j < sheets[i].data[0].rowData[4].values.length;
			j += 2
		) {
			let temp = "";
			if (
				Object.hasOwn(
					sheets[i].data[0].rowData[4].values[j],
					"formattedValue"
				)
			) {
				//* Formatting each matchup for proper delimination below
				matchups.push(
					sheets[i].data[0].rowData[4].values[j].formattedValue
						.replace(/\s+/g, "")
						.replace(/\-/g, "@")
						.replace(/vs\.?/g, "@")
				);
			}
		}

		// Generate Player Pick Data
		pickData = [];
		for (let k = 5, p = 0; p < players; k += 2, p++) {
			gamesList = [];
			for (let l = 2, g = 0; g < matchups.length; l += 2, g++) {
				let delim = matchups[g].indexOf("@");
				gamesList.push(
					new Game(
						g + 1,
						matchups[g].substring(delim + 1),
						matchups[g].substring(0, delim),
						sheets[i].data[0].rowData[k].values[l].formattedValue,
						sheets[i].data[0].rowData[k + 1].values[
							l
						].formattedValue,
						sheets[i].data[0].rowData[k].values[
							l + 1
						].formattedValue,
						sheets[i].data[0].rowData[k + 1].values[
							l + 1
						].formattedValue
					)
				);
			}
			pickData.push(
				new Data(
					sheets[i].data[0].rowData[k].values[0].formattedValue,
					gamesList
				)
			);
		}

		weekData.push(new Week(i, matchups, pickData));
	}

	data = JSON.stringify(weekData);

	fs.writeFile(
		`./data/historicalData${yearMap[sheetId]}.json`,
		data,
		(error) => {
			if (error) {
				console.error(error);
				throw error;
			}
			if (yearMap[sheetId] == 2020) {
				console.log(
					"Remember, for the year 2020, the sheets are ordered in reverse compared to the other sheets!"
				);
			}
			console.log(
				`JSON data written to historicalData${yearMap[sheetId]}.json`
			);
		}
	);
}

//console.log(res.data.sheets[1].data[0].rowData);
//res.data returns the entire spreadsheet
//res.data.sheets returns the list of sheets within the spreadsheet
//res.data.sheets[1] returns the 2nd sheet within the sheets array
//res.data.sheets[1].data returns the cell data for that specific sheet
for (const historicalSheet of historicalSheetIds) {
	main(historicalSheet).catch(console.error);
}
