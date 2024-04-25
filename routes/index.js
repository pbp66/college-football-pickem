import express from "express";
const router = express.Router();
import apiRouter from "./api";
import viewRouter from "./viewRouter";

router.use("/", viewRouter);
router.use("/api", apiRouter);

export default router;
