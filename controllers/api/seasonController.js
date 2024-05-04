import { Picks, Users, Weeks } from "../../models/models";
import { sendBadInputResponse } from "../../utilities/responseHandlers";

async function getSeasonWinner(req, res) {
	const weekIds = await Weeks.findAll({
		where: { year: req.params.year },
		attributes: ["id"],
		raw: true,
	});
	console.log(weekIds);
	const picks = await Picks.findAll({
		where: { week_id: weekIds },
		attributes: ["points_won"],
		raw: true,
	});
}

async function getSeasonLoser(req, res) {}

export { getSeasonWinner, getSeasonLoser };
