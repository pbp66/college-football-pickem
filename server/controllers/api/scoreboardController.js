import { Picks, Users, Games, Weeks, Teams } from "../../models/models";
import { sendBadInputResponse } from "../../utilities/responseHandlers";

async function getWeeklyScoreboard(req, res) {
	// req.query.params: {year, weekNum, season}
	const weekId = (
		await Weeks.findOne({
			attributes: ["id"],
			where: {
				year: req.query.year,
				number: req.query.weekNum,
				season: req.query.season,
			},
			raw: true,
		})
	).id;

	const picks = await Picks.findAll({
		attributes: [
			"game_id",
			"picked_team_id",
			"points_wagered",
			"points_won",
		],
		where: { week_id: weekId },
		include: [
			{ model: Users, as: "Username", attributes: ["username"] },
			{
				model: Games,
				as: "Game",
				include: [
					{
						model: Teams,
						as: "HomeTeam",
						attributes: ["school_name"],
					},
					{
						model: Teams,
						as: "AwayTeam",
						attributes: ["school_name"],
					},
					{
						model: Teams,
						as: "Champion",
						attributes: ["school_name"],
					},
				],
			},
			{ model: Teams, as: "PickedTeam", attributes: ["school_name"] },
		],
		raw: true,
	});
}

export { getWeeklyScoreboard };
