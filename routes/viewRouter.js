import express from "express";
const router = express.Router();

import {
	displayHomepage,
	loginView,
	teamPicker,
	getScoreboard,
} from "../controllers/viewController.js";

router.get("/", async (req, res) => {
	displayHomepage(req, res);
});

router.get("/login", async (req, res) => {
	loginView(req, res);
});

router.get("/teampicker", async (req, res) => {
	// TODO: Rename and redefine this function
	teamPicker(req, res);
});

router.get("/scoreboard", async (req, res) => {
	getScoreboard(req, res);
});

export default router;
