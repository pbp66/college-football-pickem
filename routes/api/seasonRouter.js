import express from "express";
const router = express.Router();
import {
	getSeasonWinner,
	getSeasonLoser,
} from "../../controllers/api/seasonController";

router.get("/winner/:year", async (req, res) => {
	getSeasonWinner(req, res);
});

router.get("/loser/:year", async (req, res) => {
	getSeasonLoser(req, res);
});

export default router;
