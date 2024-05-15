import express from "express";
const router = express.Router();
import apiRouter from "./api";

router.use("/api", apiRouter);

// * this basic get route will be the hosted site
// router.get("/", (req, res) => {
// 	res.status(500).send(`<h1>500 Internal Server Error</h1>`);
// });

export default router;
