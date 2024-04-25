import express from "express";
const router = express.Router();

import { login, logout, signup } from "../../controllers/api/userController.js";
import userStatisticsRouter from "./userStatisticsRouter.js";

router.post("/login", async (req, res) => {
	login(req, res);
});

router.post("/logout", (req, res) => {
	logout(req, res);
});

router.post("/signup", async (req, res) => {
	signup(req, res);
});

router.use("/statistics", userStatisticsRouter);

export default router;
