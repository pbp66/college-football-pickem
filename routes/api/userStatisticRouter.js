import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
	res.send(`<h1>400 Bad Request</h1>`);
});

export default router;
