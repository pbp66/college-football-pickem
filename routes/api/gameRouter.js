import express from "express";
const router = express.Router();

import {
	getAllGames,
	getGameById,
	createGame,
	updateGameWinner,
} from "../../controllers/api/gameController.js";

router.get("/", async (req, res) => {
	getAllGames(req, res);
});

router.get("/:id", async (req, res) => {
	getGameById(req, res);
});

router.post("/", async (req, res) => {
	createGame(req, res);
});

router.put("/:id/winner/:team_id", async (req, res) => {
	updateGameWinner(req, res);
});

export default router;
