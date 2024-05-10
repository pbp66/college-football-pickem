import { Picks, Users, Weeks } from "../../models/models";
import { sendBadInputResponse } from "../../utilities/responseHandlers";

async function getSeasonWinner(req, res) {
	let winnerData;
	const seasonTotals = new Map(); // userId: totalPoints
	const weekIdQueryResult = await Weeks.findAll({
		where: { year: req.params.year },
		attributes: ["id"],
		raw: true,
	});
	const weekIds = weekIdQueryResult.map((element) => element.id);

	const picksQueryResult = await Picks.findAll({
		where: { week_id: weekIds },
		attributes: ["user_id", "points_won"],
		raw: true,
	});
	picksQueryResult.forEach((element) => {
		if (seasonTotals.has(element.user_id)) {
			seasonTotals.set(
				element.user_id,
				seasonTotals.get(element.user_id) + element.points_won
			);
		} else {
			seasonTotals.set(element.user_id, element.points_won);
		}
	});

	for (const [userId, totalPoints] of seasonTotals.entries()) {
		if (!winnerData) {
			winnerData = { userId: userId, totalPoints: totalPoints };
		} else if (totalPoints > winnerData.totalPoints) {
			winnerData = { userId, totalPoints };
		}
	}

	const user = await Users.findOne({
		where: { id: winnerData.userId },
	});

	res.status(200)
		.json({ winner: user.fullname, points: winnerData.totalPoints })
		.send();
}

async function getSeasonLoser(req, res) {
	let loserData;
	const seasonTotals = new Map(); // userId: totalPoints
	const weekIdQueryResult = await Weeks.findAll({
		where: { year: req.params.year },
		attributes: ["id"],
		raw: true,
	});
	const weekIds = weekIdQueryResult.map((element) => element.id);

	const picksQueryResult = await Picks.findAll({
		where: { week_id: weekIds },
		attributes: ["user_id", "points_won"],
		raw: true,
	});
	picksQueryResult.forEach((element) => {
		if (seasonTotals.has(element.user_id)) {
			seasonTotals.set(
				element.user_id,
				seasonTotals.get(element.user_id) + element.points_won
			);
		} else {
			seasonTotals.set(element.user_id, element.points_won);
		}
	});

	for (const [userId, totalPoints] of seasonTotals.entries()) {
		if (!loserData) {
			loserData = { userId: userId, totalPoints: totalPoints };
		} else if (totalPoints < loserData.totalPoints) {
			loserData = { userId, totalPoints };
		}
	}

	const user = await Users.findOne({
		where: { id: loserData.userId },
	});

	console.log(user);

	res.status(200)
		.json({ loser: user.fullname, points: loserData.totalPoints })
		.send();
}

export { getSeasonWinner, getSeasonLoser };
