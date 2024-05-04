import { Games, Teams, Users, Weeks, Picks } from "../models/models";
import { Sequelize } from "sequelize";

// replace withAuth,
async function displayHomepage(req, res) {
	try {
		// const userData = await User.findAll({
		// 	attributes: { exclude: ["password"] },
		// 	order: [["name", "ASC"]],
		// });

		// const users = userData.map((project) => project.get({ plain: true }));

		res.render("homepage", {
			//users,
			logged_in: req.session.logged_in,
		});
	} catch (err) {
		res.status(500).json(err);
	}
}

async function loginView(req, res) {
	if (req.session.logged_in) {
		res.redirect("../");
		return;
	}
	res.render("loginView");
}

// TODO: Rename and redefine this function
async function teamPicker(req, res) {
	let picks;

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

	try {
		const weekData = await Weeks.findOne({
			attributes: ["week_num"],
			order: [["week_num", "DESC"]],
		});
		const week = weekData.get({ plain: true });

		userAssociations.where = { id: req.session.user_id };
		gameAssociations.include[3].where = {
			week_num: week.week_num,
		};
		picks = await Picks.findAll({
			attributes: ["id", "points"],
			include: [gameAssociations, userAssociations, teamPickAssociations],
		});

		picks = picks.map((element) => element.get({ plain: true }));
		console.log(picks[0]);
		res.render("teampicker", {
			picks: picks,
			logged_in: req.session.logged_in,
			user: req.session.user_id,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send(`<h1>500 Internal Server Error</h1>`);
	}
}

async function getScoreboard(req, res) {
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
				model: Teams,
				as: "winner",
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

	let weekAssociations = [
		{
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
					model: Teams,
					as: "winner",
					attributes: {
						exclude: ["createdAt", "updatedAt"],
					},
				},
			],
		},
	];

	const weekNums = await Weeks.aggregate("week_num", "DISTINCT", {
		plain: false,
	});
	const weeks = weekNums.map((element) => element.DISTINCT);

	const gameData = await Weeks.findAll({
		attributes: ["id", "week_num"],
		include: weekAssociations,
		where: {
			week_num: weeks[0],
		},
		order: [[Games, "id", "ASC"]],
	});
	const games = gameData.map((element) => element.get({ plain: true }));

	gameAssociations.include[4].where = { week_num: weeks[0] };
	const pickData = await Picks.findAll({
		attributes: ["id", "points"],
		include: [gameAssociations, userAssociations, teamPickAssociations],
		order: [
			[User, "id", "ASC"],
			[Game, "id", "ASC"],
		],
	});
	const picks = pickData.map((element) => element.get({ plain: true }));

	console.log(picks);

	res.render("scoreboard", {
		weeks: weeks,
		games: games,
		picks: picks,
		logged_in: req.session.logged_in,
	});
}

export { displayHomepage, loginView, teamPicker, getScoreboard };
