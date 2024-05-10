import express from "express";
const router = express.Router();
import {
	getAllTeams,
	addTeam,
	deleteTeam,
} from "../../controllers/api/teamController.js";

router.get("/", async (req, res) => {
	getAllTeams(req, res);
});

router.post("/", async (req, res) => {
	addTeam(req, res);
});

router.delete("/:id", async (req, res) => {
	deleteTeam(req, res);
});

export default router;
