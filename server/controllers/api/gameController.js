import { Sequelize } from "sequelize";
import { Games, Teams, Weeks } from "../../models/models";

const gameAssociations = [
	{
		model: Teams,
		as: "home_team",
		attributes: { exclude: ["createdAt", "updatedAt"] },
	},
	{
		model: Teams,
		as: "away_team",
		attributes: { exclude: ["createdAt", "updatedAt"] },
	},
	{
		model: Weeks,
		attributes: ["id", "week_num"],
	},
];

async function getAllGames(req, res) {
	try {
		const games = await Games.findAll({
			attributes: ["id"],
			include: gameAssociations,
		});
		res.status(200).json(games).send();
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

async function getGameById(req, res) {
	try {
		const game = await Games.findByPk(req.params.id, {
			attributes: ["id"],
			include: gameAssociations,
		});
		if (game) {
			res.status(200).json(game).send();
		} else {
			res.status(400).send(
				`<h1>400 Bad Request</h1><h3>Specified ID does not exist</h3>`
			);
		}
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

async function createGame(req, res) {
	// Create a new game
	/**
	 * Request body JSON Format:
	 * {
	 * 	home_team_id: "home team id as an integer",
	 * 	away_team_id: "away team id as an integer",
	 * 	date_id: "date id as an integer"
	 * }
	 */
	try {
		const newGame = await Games.create(req.body);
		res.status(201).json(newGame).send();
	} catch (err) {
		if (err instanceof Sequelize.ValidateError) {
			res.status(400).send(`<h1>400 Bad Request!</h1>
			<h3>Specified id does not exist.</h3>`);
		} else {
			res.status(500).send(`<h1>500 Internal Server Error</h1>`);
		}
		console.error(err);
	}
}

async function updateGameWinner(req, res) {
	const gameIds = (await Games.findAll({ attributes: ["id"] })).map(
		(element) => element.dataValues.id
	);

	if (gameIds.includes(Number(req.params.id))) {
		try {
			const updatedGame = await Games.update(
				{ winner_team_id: req.params.team_id },
				{ where: { id: req.params.id } }
			);

			// If sequelize successfully updates the database, the length of updatedGame will be 1
			if (updatedGame[0]) {
				res.sendStatus(204);
			} else {
				res.sendStatus(304);
			}
		} catch (err) {
			console.error(err);
			res.status(500).send(`<h1>500 Internal Server Error</h1>`);
		}
	} else {
		res.status(400).send(
			`<h1>400 Bad Request</h1><h3>Specified ID does not exist</h3>`
		);
	}
}

export { getAllGames, getGameById, createGame, updateGameWinner };
