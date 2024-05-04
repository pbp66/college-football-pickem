import { Sequelize } from "sequelize";
import { Weeks, Games, Teams } from "../../models/models";

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

async function getWeeklyScoreboard(req, res) {
	// TODO: Implement this function
	res.status(501).send(`<h1>501 Not Implemented</h1>`);
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

export { getAllWeekData, getAllWeekNumbers, getWeeklyScoreboard, getWeek };
