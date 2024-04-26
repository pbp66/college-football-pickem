import express from "express";
const router = express.Router();

import {
	getAllPicks,
	getAllUserPicks,
	getAllPicksOfTheWeek,
	getUsersWeeklyPicks,
} from "../../controllers/api/pickController.js";

router.get("/", async (req, res) => {
	getAllPicks(req, res);
});

router.get("/user/:user_id", async (req, res) => {
	getAllUserPicks(req, res);
});

router.get("/week/:week_num", async (req, res) => {
	getAllPicksOfTheWeek(req, res);
});

router.get("/user/:user_id/week/:week_num", async (req, res) => {
	getUsersWeeklyPicks(req, res);
});

export default router;
