let historicalSheet2022Id = "1IKULDleiK1QEHUt0y1pF7zE3KB3JOMfoDzKpm7x6tuo";
let historicalSheet2023Id = "1phCjeMld4QMeYgafXvLoLA4kWMmfzt3Mk6jzasWb1hQ";

class GoogleSpreadsheet {
	#baseURL = "https://docs.google.com/spreadsheets/d/";
	constructor(id) {
		this.id = id;
		this.baseSheet = newSheet(0);
		this.sheets = [baseSheet];
		this.url = new URL(`${this.id}/edit#gid=0`, this.#baseURL); //edit#gid=0 is the base Sheet
	}
}

class Sheet {
	#baseURL = "/edit";
	constructor(id) {
		this.id = id;
		this.URL = new URL(`#gid=${this.id}`, this.#baseURL);
	}
}
