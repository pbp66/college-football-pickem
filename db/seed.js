import sequelize from "../config/connection.js";
// import { Date, Game, Pick, Team, User, Week } from "../models"; //! Moving to direct imports and removing bulk imports with index.js
import userData from "./data/users.json" assert { type: "json" };
import teamData from "./data/teams.json" assert { type: "json" };

const seedDatabase = async () => {
	await sequelize.sync({ force: true });

	/* Generate Week Data*/
	const years = [2019, 2020, 2021, 2022, 2023];
	let maxWeeks;
	const weekData = [];
	for (const year of years) {
		if (year == 2020) {
			maxWeeks = 9;
		} else {
			maxWeeks = 15;
		}
		for (let i = 1; i < maxWeeks + 1; i++) {
			weekData.push({ season: year, number: i });
		}
	}
	const weeksData = await Weeks.bulkCreate(weekData, {
		individualHooks: true,
		returning: true,
	});
	const weeks = weeksData.map((element) => element.get({ plain: true }));

	/* Generate User Data from JSON */
	const usersData = await User.bulkCreate(userData, {
		individualHooks: true,
		returning: true,
	});
	const users = usersData.map((element) => element.get({ plain: true }));

	//! NO LONGER VALID
	// const datesData = await Date.bulkCreate(dateData, {
	// 	individualHooks: true,
	// 	returning: true,
	// });
	// const dates = datesData.map((element) => element.get({ plain: true }));

	/* Generate Teams Data from JSON */
	const teamsData = await Team.bulkCreate(teamData, {
		individualHooks: true,
		returning: true,
	});
	const teams = teamsData.map((element) => element.get({ plain: true }));

	/** Dynamically generate Game Data based on insertion order of the games.
	 * Since the ids aren't always sequential, this preserves the team match-ups.
	 */
	let gameData = [];
	for (let i = 0; i < teams.length; i += 2) {
		gameData.push({
			away_team_id: teams[i].id,
			home_team_id: teams[i + 1].id,
			winner_id: teams[Math.floor(Math.random() * 2) + i].id,
			date_id: dates[0].id,
		});
	}
	const gamesData = await Game.bulkCreate(gameData, {
		individualHooks: true,
		returning: true,
	});
	const games = gamesData.map((element) => element.get({ plain: true }));

	//! NO LONGER VALID
	// const weeksData = await Week.bulkCreate(weekData, {
	// 	individualHooks: true,
	// 	returning: true,
	// });
	// const weeks = weeksData.map((element) => element.get({ plain: true }));

	/**
	 * Dynamically generate Pick Data based on the games created as well as random points per user
	 */
	let pickData = [];
	for (let i = 0; i < users.length; i++) {
		let points = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		for (let j = 0; j < games.length; j++) {
			const { home_team_id, away_team_id } = games[j];
			const choices = [home_team_id, away_team_id];
			pickData.push({
				game_id: games[j].id,
				team_pick_id: choices[Math.floor(Math.random() * 2)],
				points: points.splice(
					Math.floor(Math.random() * points.length),
					1
				)[0],
				user_id: users[i].id,
			});
		}
	}
	const picksData = await Pick.bulkCreate(pickData, {
		individualHooks: true,
		returning: true,
	});
	const picks = picksData.map((element) => element.get({ plain: true }));
	process.exit(0);
};

seedDatabase();
