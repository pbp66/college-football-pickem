import express from "express";
const router = express.Router();

import {
	getAllWeekData,
	getWeeklyScoreboard,
	getWeekWinner,
} from "../../controllers/api/weekController";

router.get("/", async (req, res) => {
	getAllWeekData(req, res);
});

router.get("/weeklyScoreboard", (req, res) => {
	getWeeklyScoreboard(req, res);
});

router.get("/winner", async (req, res) => {
	// Uses query params for flexibility
	// year, weekNum, weekType (regular, postseason)
	getWeekWinner(req, res);
});

router.get("/loser", async (req, res) => {
	// Uses query params for flexibility
	getWeekLoser(req, res);
});

export default router;
