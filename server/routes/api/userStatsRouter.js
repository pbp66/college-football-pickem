import express from "express";
const router = express.Router();

// username is passed as a query param
router.get("/average/score", async (req, res) => {
	/**
	 * Requires certain query params for the correct controller
	 * timeFrame: year
	 * interval: week
	 * year: season year
	 *
	 * TODO: Implement the following capabilities
	 * timeFrames: range of weeks, range of years
	 * startWeek: starting week number for a range
	 * endWeek: ending week number for a range
	 * startWeekType: regular or postseason for startWeek
	 * endWeekType: regular or postseason for endWeek
	 * startYear: starting year number for a range
	 * endYear: ending year number for a range
	 */

	getWeeklyAverageScore(req, res);
});

router.get("/pickAccuracy", async (req, res) => {
	getUserPickAccuracy(req, res);
});

router.get("/", async (req, res) => {
	res.send(`<h1>400 Bad Request</h1>`);
});

export default router;
