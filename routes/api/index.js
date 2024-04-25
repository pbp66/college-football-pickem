import express from "express";
const router = express.Router();

import gameRouter from "./gameRouter";
import pickRouter from "./pickRouter";
import teamRouter from "./teamRouter";
import userRouter from "./userRouter";
import weekRouter from "./weekRouter";

router.use("/games", gameRouter);
router.use("/picks", pickRouter);
router.use("/teams", teamRouter);
router.use("/users", userRouter);
router.use("/weeks", weekRouter);

router.use("/scores", scoreRouter);
router.use("/season", seasonRouter);

export default router;
