import express from "express";
const router = express.Router();

import {
	getAllTimeUserScore,
	getUserScoreForYear,
	getUserScoreForWeek,
} from "../../controllers/api/scoreController";
import { sendBadInputResponse } from "../../utils/errorResponses.js";

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
			sendBadInputResponse(
				res,
				"score time frame option must be provided. {timeFrame: <all, year, week>}"
			);
			return;
		}
		let score;
		switch (req.query.timeFrame) {
			case "all":
				getAllTimeUserScore(req, res);
				break;
			case "year":
				if (!req.query.year) {
					sendBadInputResponse(res, "A year must be provided");
					return;
				}
				getUserScoreForYear(req.params.user_id, req.query.year);
				break;
			case "week":
				if (!req.query.week || !req.query.season) {
					sendBadInputResponse(
						res,
						"Week and Season must be provided"
					);
					return;
				}
				getUserScoreForWeek(req, res);
				break;
			default:
				sendBadInputResponse(res, "Invalid timeFrame option");
		}
	} catch (err) {
		console.err(err);
		res.sendStatus(500);
		return;
	}
});

export default router;
