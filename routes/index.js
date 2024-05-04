import express from "express";
const router = express.Router();
import apiRouter from "./api";
import viewRouter from "./viewRouter";

router.use("/api", apiRouter);
router.use("/", viewRouter);

export default router;
