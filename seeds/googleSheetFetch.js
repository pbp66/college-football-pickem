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
		weekNumber,
		homeTeam,
		awayTeam,
		pickedTeam,
		winningTeam,
		pointsWagered,
		pointsWon
	) {
		this.weekNumber = weekNumber;
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

let historicalSheet2022Id = "1IKULDleiK1QEHUt0y1pF7zE3KB3JOMfoDzKpm7x6tuo";
let historicalSheet2023Id = "1phCjeMld4QMeYgafXvLoLA4kWMmfzt3Mk6jzasWb1hQ";

let data;

async function main() {
	const res = await sheetsAPI.spreadsheets.get({
		spreadsheetId: historicalSheet2023Id,
		includeGridData: true,
	});

	let players = 11;
	let sheets = res.data.sheets;
	let matchups = [];
	let gamesList = [];
	let pickData = [];
	let weekData = [];

	for (let i = 1; i < sheets.length - 3; i++) {
		// Generate Matchup List
		matchups.push([]);
		for (
			let j = 2;
			j < sheets[i].data[0].rowData[4].values.length;
			j += 2
		) {
			if (
				Object.hasOwn(
					sheets[i].data[0].rowData[4].values[j],
					"formattedValue"
				)
			) {
				matchups[i - 1].push(
					sheets[i].data[0].rowData[4].values[
						j
					].formattedValue.replace(/\s+/g, "")
				);
			}
		}

		// Generate Player Pick Data
		pickData = [];
		for (let k = 5; k < players; k += 2) {
			gamesList = [];
			for (let l = 2; l < matchups[i - 1].length; l += 2) {
				let delim = matchups[i - 1][l - 2].indexOf("@");
				//console.log(matchups[i - 1][l - 2]);
				gamesList.push(
					new Game(
						l - 1,
						matchups[i - 1][l - 2].substring(delim + 1),
						matchups[i - 1][l - 2].substring(0, delim),
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

	//const data = JSON.stringify(res.data.sheets[1]);
	data = JSON.stringify(weekData);

	fs.writeFile("data.json", data, (error) => {
		if (error) {
			console.error(error);
			throw error;
		}

		console.log("JSON data written to data.json");
	});
}

//console.log(res.data.sheets[1].data[0].rowData);
//res.data returns the entire spreadsheet
//res.data.sheets returns the list of sheets within the spreadsheet
//res.data.sheets[1] returns the 2nd sheet within the sheets array
//res.data.sheets[1].data returns the cell data for that specific sheet

main().catch(console.error);
