import { google } from "googleapis";
import "dotenv/config";
import * as fs from "fs";

class Week {
	constructor(number, matchUps, data) {
		this.number = number;
		this.matchUps = matchUps;
		this.data = data;
	}
}

class Data {
	constructor(name, games) {
		this.name = name;
		this.games = games;
	}
}

class Game {
	constructor(
		number,
		homeTeam,
		awayTeam,
		pickedTeam,
		winningTeam,
		pointsWagered,
		pointsWon
	) {
		this.number = number;
		this.homeTeam = homeTeam;
		this.awayTeam = awayTeam;
		this.pickedTeam = pickedTeam;
		this.winningTeam = winningTeam;
		this.pointsWagered = pointsWagered;
		this.pointsWon = pointsWon;
	}
}

const sheets = google.sheets({
	version: "v4",
	auth: process.env.API_KEY,
});

let historicalSheet2022Id = "1IKULDleiK1QEHUt0y1pF7zE3KB3JOMfoDzKpm7x6tuo";
let historicalSheet2023Id = "1phCjeMld4QMeYgafXvLoLA4kWMmfzt3Mk6jzasWb1hQ";

async function main() {
	const res = await sheets.spreadsheets.get({
		spreadsheetId: historicalSheet2023Id,
		includeGridData: true,
	});

	let players = 11;
	let sheets = res.data.sheets;
	let matchups = [];
	let weekData = [];

	for (let i = 1; i < sheets.length - 3; i++) {
		// Generate Matchup List
		for (
			let j = 2;
			j < sheets[i].data[0].rowData[5].values.length;
			j += 2
		) {
			if (
				Object.hasOwn(
					sheets[i].data[0].rowData[5].values[j],
					"formattedValue"
				)
			) {
				matchups.push(
					sheets[i].data[0].rowData[5].values[j].formattedValue
				);
			}
		}

		// Generate Player Pick Data
		for (let k = 0; k < players; k++) {
			sheets[i].data[0].rowData;
		}

		weekData.push(new Week(i, matchups, pickData));
	}

	const data = JSON.stringify(res.data.sheets[1]);

	fs.writeFile("data.json", data, (error) => {
		if (error) {
			console.error(error);
			throw error;
		}

		console.log("JSON data written to data.json");
	});

	//console.log(res.data.sheets[1].data[0].rowData);
	//res.data returns the entire spreadsheet
	//res.data.sheets returns the list of sheets within the spreadsheet
	//res.data.sheets[1] returns the 2nd sheet within the sheets array
	//res.data.sheets[1].data returns the cell data for that specific sheet
}
main().catch(console.error);
