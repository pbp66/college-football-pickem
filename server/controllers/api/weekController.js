import { Sequelize } from "sequelize";
import { Weeks, Games, Teams, Picks, Users } from "../../models/models";

const weekAssociations = [
	{
		model: Games,
		attributes: ["id"],
		include: [
			{
				model: Teams,
				as: "home_team",
				attributes: {
					exclude: ["createdAt", "updatedAt"],
				},
			},
			{
				model: Teams,
				as: "away_team",
				attributes: {
					exclude: ["createdAt", "updatedAt"],
				},
			},
		],
	},
];

async function getAllWeekData(req, res) {
	try {
		const weekData = await Weeks.findAll({
			include: weekAssociations,
		});
		res.status(200).json(weekData).send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

async function getAllWeekNumbers(req, res) {
	try {
		const weekNums = await Weeks.findAll({
			attributes: [
				Sequelize.fn("DISTINCT", Sequelize.col("week_num")),
				"week_num",
			],
			order: [["week_num", "DESC"]],
		});
		res.status(200).json(weekNums).send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

async function getWeek(req, res) {
	try {
		const weekData = await Weeks.findAll({
			attributes: ["id", "week_num"],
			include: weekAssociations,
			where: {
				week_num: req.params.week_num,
			},
		});
		res.status(200).json(weekData).send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

async function getWeekWinner(req, res) {
	try {
		let winnerData;
		const weeklyTotals = new Map();
		const weekData = await Weeks.findOne({
			attributes: ["id"],
			where: { year, number: req.query.weekNum, season: weekType },
			raw: true,
		});

		const weekId = weekData.id;

		const pickData = await Picks.findAll({
			attributes: ["user_id", "points_won"],
			where: { week_id: weekId },
			raw: true,
		});

		pickData.forEach((element) => {
			if (weeklyTotals.has(element.user_id)) {
				weeklyTotals.set(
					element.user_id,
					weeklyTotals.get(element.user_id) + element.points_won
				);
			} else {
				weeklyTotals.set(element.user_id, element.points_won);
			}
		});

		for (const [userId, totalPoints] of weeklyTotals.entries()) {
			if (!winnerData) {
				winnerData = { userId: userId, totalPoints: totalPoints };
			} else if (totalPoints > winnerData.totalPoints) {
				winnerData = { userId, totalPoints };
			}
		}

		const user = await Users.findOne({
			where: { id: winnerData.userId },
		});

		res.status(200)
			.json({ winner: user.fullname, points: winnerData.totalPoints })
			.send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

async function getWeekLoser(req, res) {
	try {
		let loserData;
		const weeklyTotals = new Map();
		const weekData = await Weeks.findOne({
			attributes: ["id"],
			where: { year, number: req.query.weekNum, season: weekType },
			raw: true,
		});

		const weekId = weekData.id;

		const pickData = await Picks.findAll({
			attributes: ["user_id", "points_won"],
			where: { week_id: weekId },
			raw: true,
		});

		pickData.forEach((element) => {
			if (weeklyTotals.has(element.user_id)) {
				weeklyTotals.set(
					element.user_id,
					weeklyTotals.get(element.user_id) + element.points_won
				);
			} else {
				weeklyTotals.set(element.user_id, element.points_won);
			}
		});

		for (const [userId, totalPoints] of weeklyTotals.entries()) {
			if (!loserData) {
				loserData = { userId: userId, totalPoints: totalPoints };
			} else if (totalPoints < loserData.totalPoints) {
				loserData = { userId, totalPoints };
			}
		}

		const user = await Users.findOne({
			where: { id: loserData.userId },
		});

		res.status(200)
			.json({ winner: user.fullname, points: loserData.totalPoints })
			.send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

export { getAllWeekData, getAllWeekNumbers, getWeekWinner, getWeekLoser };
