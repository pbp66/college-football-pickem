import { Picks, Weeks } from "../../models/models";
import { sendBadInputResponse } from "../../utilities/responseHandlers";

async function getAllTimeUserScore(req, res) {
	try {
		if (!req.params.user_id) {
			sendBadInputResponse(res, "No User Id Provided");
		}

		const userId = req.params.user_id;
		const score = await Picks.sum({
			where: { user_id: userId },
			attributes: ["points_won"],
			raw: true,
		});
		if (!score) {
			sendBadInputResponse(res, "Invalid User Id");
			return;
		}
		res.status(200).json(score).send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

async function getUserScoreForYear(req, res) {
	try {
		const userId = req.params.user_id;
		const year = req.query.year;

		if (year < 2019 || year > new Date().getFullYear()) {
			sendBadInputResponse(res, "Invalid Year");
			return;
		}

		const weekIds = await Weeks.findAll({
			where: { year: year },
			attributes: ["id"],
			raw: true,
		});

		const score = await Picks.sum({
			where: { user_id: userId, week_id: weekIds },
			attributes: ["points_won"],
			raw: true,
		});

		if (!score) {
			sendBadInputResponse(
				res,
				`Invalid Arguments. User Id: ${userId}, Year: ${year}`
			);
			return;
		}
		res.status(200).json(score).send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

async function getUserScoreForWeek(req, res) {
	try {
		const userId = req.params.user_id;
		const week = req.query.week;
		const season = req.query.season;

		if (season !== "regular" || season !== "postseason") {
			sendBadInputResponse(res, "Invalid Season Type");
		}

		const weekId = await Weeks.findOne({
			where: { number: week, season },
			attributes: ["id"],
			raw: true,
		});

		if (!weekId) {
			sendBadInputResponse(
				res,
				`Invalid Week: ${week}, Season Type: ${season}`
			);
		}

		const score = await Picks.sum({
			where: { user_id: userId, week_id: weekId },
			attributes: ["points_won"],
			raw: true,
		});

		if (!score) {
			sendBadInputResponse(
				`Invalid Arguments. User Id: ${userId}, Week: ${week}, Season Type: ${season}`
			);
		}
		res.status(200).json(score).send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

export { getAllTimeUserScore, getUserScoreForYear, getUserScoreForWeek };
