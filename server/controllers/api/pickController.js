import { Sequelize } from "sequelize";
import { Games, Picks, Teams, Users, Weeks } from "../../models/models";

let gameAssociations = {
	model: Games,
	attributes: ["id"],
	include: [
		{
			model: Teams,
			as: "home_team",
			attributes: {
				exclude: ["createdAt", "updatedAt"],
			},
		},
		{
			model: Teams,
			as: "away_team",
			attributes: {
				exclude: ["createdAt", "updatedAt"],
			},
		},
		{
			model: Weeks,
			attributes: ["id", "week_num"],
		},
	],
};

let userAssociations = {
	model: Users,
	attributes: ["id", "name"],
};

let teamPickAssociations = {
	model: Teams,
	as: "picked_team",
	attributes: {
		exclude: ["createdAt", "updatedAt"],
	},
};

// TODO: Implement query handler requests...
async function getAllPicks(req, res) {
	try {
		const picks = await Picks.findAll({
			attributes: ["id", "points"],
			include: [gameAssociations, userAssociations, teamPickAssociations],
		});
		res.status(200).json(picks).send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

async function getAllUserPicks(req, res) {
	userAssociations.where = { id: req.params.user_id };
	try {
		const picks = await Picks.findAll({
			attributes: ["id", "points"],
			include: [gameAssociations, userAssociations, teamPickAssociations],
		});
		res.status(200).json(picks).send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

async function getAllPicksOfTheWeek(req, res) {
	gameAssociations.include[3].where = { week_num: req.params.week_num };
	try {
		const picks = await Picks.findAll({
			attributes: ["id", "points"],
			include: [gameAssociations, userAssociations, teamPickAssociations],
		});
		res.status(200).json(picks).send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

async function getUsersWeeklyPicks(req, res) {
	userAssociations.where = { id: req.params.user_id };
	gameAssociations.include[3].where = {
		week_num: req.params.week_num,
	};
	try {
		const picks = await Picks.findAll({
			attributes: ["id", "points"],
			include: [gameAssociations, userAssociations, teamPickAssociations],
		});
		res.status(200).json(picks).send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

async function createPick(req, res) {
	/**
	 * Request body for Picks as JSON:
	 * {
	 * 	game_id: "game id as an integer",
	 * 	team_pick_id: "picked team id as an integer",
	 * 	points: "points wagered as an integer",
	 * 	user_id: "supplied user as its id as an integer"
	 * }
	 */
	try {
		const newPick = await Picks.create(req.body);
		res.status(201).json(newPick).send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

/**
 * USES QUERY PARAMETERS
 * ONLY UPDATES THE PICKED TEAM AND THE AMOUNT OF POINTS
 */
async function updatePick(req, res) {
	/**
	 * req.query.id
	 * req.query.team_pick_id
	 * req.query.points
	 */

	console.log(req.body);
	console.log(req.query);

	const pickExists = await Picks.findOne({
		attributes: ["id", "game_id", "team_pick_id"],
		where: { id: req.query.id },
	});

	// Sequelize will return null if no record is found
	if (pickExists) {
		try {
			const updatedPick = await Picks.update(
				{
					team_pick_id: req.query.team_pick_id,
					points: req.query.points,
				},
				{ where: { id: req.query.id } }
			);

			// updatePick will have a length of 1 if the value was updated. Otherwise, no update was performed
			if (updatedPick[0]) {
				res.status(204).send();
			} else {
				res.status(304).send();
			}
		} catch (err) {
			if (err.type === Sequelize.SequelizeValidationError) {
				console.log("Encountered Bad Request");
				console.log(
					`Pick Id: ${req.query.id} ${req.query.team_pick_id} ${req.query.points}`
				);
				res.status(400).send(`400 Bad Request`);
				return;
			}
			console.error(err);
			res.status(500).send(`<h1>500 Internal Server Error</h1>`);
		}
	} else {
		try {
			const newPick = await Picks.create({
				game_id: req.query.game_id,
				team_pick_id: req.query.team_pick_id,
				points: req.query.points,
				user_id: req.query.user_id,
			});
			res.status(201).json(newPick).send();
		} catch (err) {
			console.error(err);
			res.status(500).send(`<h1>500 Internal Server Error</h1>`);
		}
	}
}

export {
	getAllPicks,
	getAllUserPicks,
	getAllPicksOfTheWeek,
	getUsersWeeklyPicks,
	createPick,
	updatePick,
};
