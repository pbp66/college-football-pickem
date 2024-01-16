import { google } from "googleapis";
import "dotenv/config";
import * as fs from "fs";

const sheets = google.sheets({
	version: "v4",
	auth: process.env.API_KEY,
});

let historicalSheet2022Id = "1IKULDleiK1QEHUt0y1pF7zE3KB3JOMfoDzKpm7x6tuo";
let historicalSheet2023Id = "1phCjeMld4QMeYgafXvLoLA4kWMmfzt3Mk6jzasWb1hQ";

class GoogleSpreadsheet {
	constructor(id, properties, sheets, url) {
		this.id = id;
		this.properties = properties;
		this.sheets = sheets;
		this.URL = new URL(url);
	}
}

class Sheet {
	constructor(id, title, index, data, merges = []) {
		this.id = id;
		this.title = title;
		this.index = index;
		this.data = data;
		this.merges = merges;
	}
}

// const params = { spreadsheetId: historicalSheet2023Id };

async function main() {
	const res = await sheets.spreadsheets.get({
		spreadsheetId: historicalSheet2023Id,
		includeGridData: true,
	});

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
