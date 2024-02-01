import axios from "axios";
import dotenv from "dotenv/config";
import * as fs from "fs";

const apiURL = new URL("https://api.collegefootballdata.com");
const teamAPI = new URL("/teams", apiURL);
const token = process.env.BEARER_TOKEN;

async function getTeamsData() {
	return await axios.get(teamAPI, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}

const response = await getTeamsData();
const teams = response.data;
const validTeams = [];
for (const team of teams) {
	if (/fbs|fcs/.test(team.classification)) {
		validTeams.push(team);
	}
}

fs.writeFile(
	"./data/teams.json",
	JSON.stringify(validTeams, null, 4),
	(error) => {
		if (error) {
			console.error(error);
			throw error;
		}
		console.log(`JSON data written to ./data/teams.json`);
	}
);
