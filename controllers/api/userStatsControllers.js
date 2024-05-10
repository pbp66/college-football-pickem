import sequelize from "sequelize";
import { Picks, Usernames, Weeks } from "../../models/models";

async function getWeekId(year, weekNum, weekType) {
	const weekData = await Weeks.findOne({
		attributes: ["id"],
		where: {
			year: year,
			week_num: weekNum,
			week_type: weekType,
		},
		raw: true,
	});
	return weekData.id;
}

async function getAllWeeksForSeason(year) {
	const weekData = await Weeks.findAll({
		attributes: ["id"],
		where: { year },
		raw: true,
	});

	return weekData.map((element) => element.id);
}

async function getUserId(username) {
	const userData = await Usernames.findOne({
		attributes: ["id"],
		where: { name: username },
		raw: true,
	});

	return userData.id;
}

async function getUserScoreForWeek(userId, weekId) {
	return await Picks.findAll({
		attributes: [
			[sequelize.fn("SUM"), sequelize.col("points_won"), "totalScore"],
			[
				sequelize.fn("COUNT"),
				sequelize.col("picked_team_id"),
				"gameCount",
			], // for any given week, all picked_team_id's will be unique as each team will only play once per week
		],
		where: { user_id: userId, week_id: weekId },
		raw: true,
	});
}

function average(array) {
	const initialValue = 0;
	return (
		array.reduce(
			(accumulator, currentValue) => accumulator + currentValue,
			initialValue
		) / array.length
	);
}

async function getUserAverageScore(username, year) {
	const weekIds = await getAllWeeksForSeason(year);
	const userId = await getUserId(username);
	const weeklyScores = [];

	for (const weekId of weekIds) {
		const { totalScore, gameCount } = await getUserScoreForWeek(
			userId,
			weekId
		);
		weeklyScores.push(totalScore);
	}

	return average(weeklyScores);
}

async function getWeeklyAverageScore(req, res) {
	/**
	 * Query Params:
	 * username, timeFrame, interval, year
	 */
	try {
		const averageScore = await getUserAverageScore(
			req.query.username,
			req.query.year
		);
		res.status(200).json(averageScore).send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

//TODO: Implement for timeFrames other than a year
async function getUserPickAccuracy(req, res) {
	try {
		const weekIds = getAllWeeksForSeason(req.query.year);
		const userId = getUserId(req.query.username);
		const pickData = await Picks.findAll({
			attributes: ["points_wagered", "points_won"],
			where: { user_id: userId, week_id: weekIds },
			raw: true,
		});

		const correctPicks = 0;
		for (const pick of pickData) {
			if (pick.points_wagered === pick.points_won) {
				correctPicks++;
			}
		}
		const accuracy = correctPicks / pickData.length;
		res.status(200).json(accuracy).send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

export { getWeeklyAverageScore, getUserPickAccuracy };
