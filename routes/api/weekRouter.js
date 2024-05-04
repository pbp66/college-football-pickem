import express from "express";
const router = express.Router();

import {
	getAllWeekData,
	getAllWeekNumbers,
	getWeeklyScoreboard,
	getWeek,
} from "../../controllers/api/weekController";

router.get("/", async (req, res) => {
	getAllWeekData(req, res);
});

router.get("/all-week-nums", async (req, res) => {
	getAllWeekNumbers(req, res);
});

router.get("/weeklyScoreboard", (req, res) => {
	getWeeklyScoreboard(req, res);
});

router.get("/:week_num", async (req, res) => {
	getWeek(req, res);
});

export default router;
