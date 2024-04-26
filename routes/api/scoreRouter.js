import express from "express";
const router = express.Router();

import {
	getAllTimeUserScore,
	getUserScoreForYear,
	getUserScoreForWeek,
} from "../../controllers/api/scoreController";

// Requires Query params to pick the right controller
router.get("/user/:user_id", async (req, res) => {
	/**
	 * Possible Query Params:
	 * timeFrame: all, year, week
	 * year: 4-digit year
	 * week: week number
	 * season: season type( regular or postseason)
	 */
	try {
		if (!req.query.timeFrame) {
			res.sendStatus(400);
			return;
		}
		let score;
		switch (req.query.timeFrame) {
			case "all":
				score = await getAllTimeUserScore(req.params.user_id);
				res.status(200).json(score).send();
				break;
			case "year":
				if (!req.query.year) {
					res.sendStatus(400);
					return;
				}
				score = await getUserScoreForYear(
					req.params.user_id,
					req.query.year
				);
				res.status(200).json(score).send();
				break;
			case "week":
				if (!req.query.week || !req.query.season) {
					res.sendStatus(400);
					return;
				}
				score = await getUserScoreForWeek(
					req.params.user_id,
					req.query.week,
					req.query.season
				);
				res.status(200).json(score).send();
				break;
			default:
				res.sendStatus(400);
		}
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
		return;
	}
});

export default router;
