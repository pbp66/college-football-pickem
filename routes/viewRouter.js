import express from "express";
const router = express.Router();

import {
	displayHomepage,
	login,
	teamPicker,
	getScoreboard,
} from "../controllers/viewController.js";

router.get("/", async (req, res) => {
	displayHomepage(req, res);
});

router.get("/login", (req, res) => {
	login(req, res);
});

router.get("/teampicker", async (req, res) => {
	// TODO: Rename and redefine this function
	teamPicker(req, res);
});

router.get("/scoreboard", async (req, res) => {
	getScoreboard(req, res);
});
