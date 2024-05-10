import { Users, Games, Weeks, Teams, Picks } from "../../models/models";

async function login(req, res) {
	try {
		const userData = await Users.findOne({
			where: { email: req.body.email },
		});

		if (!userData) {
			res.status(400).json({
				message: "Incorrect email or password, please try again",
			});
			return;
		}

		const validPassword = await userData.checkPassword(req.body.password);

		if (!validPassword) {
			res.status(400).json({
				message: "Incorrect email or password, please try again",
			});
			return;
		}

		req.session.save(() => {
			req.session.user_id = userData.id;
			req.session.logged_in = true;
			res.json({ user: userData, message: "You are now logged in!" });
		});
	} catch (err) {
		console.log(err);
		res.status(400).send();
	}
}

async function logout(req, res) {
	if (req.session.logged_in) {
		// Remove the session variables
		req.session.destroy(() => {
			res.status(204).end();
		});
	} else {
		res.status(404).end();
	}
}

async function signup(req, res) {
	try {
		const userData = await Users.findOne({
			where: { email: req.body.email },
		});
		if (userData) {
			res.status(400).json({ message: "Email already exists" });
		}

		const newUserData = await Users.create(req.body);
		const newUser = newUserData.get({ plain: true });

		/**
		 * Make sure we add blank week entries for this user upon account creation
		 */
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

		let pickData = [];
		for (let i = 0; i < games.length; i++) {
			pickData.push({
				game_id: games[i].id,
				team_pick_id: null,
				points: 0,
				user_id: newUser.id,
			});
		}

		const picksData = await Picks.bulkCreate(pickData, {
			individualHooks: true,
			returning: true,
		});
		const picks = picksData.map((element) => element.get({ plain: true }));

		// Make sure we save the credentials to the session so that the user automatically logins upon account creation
		req.session.save(() => {
			req.session.user_id = newUser.id;
			req.session.logged_in = true;
			res.json({ user: newUser, message: "You are now logged in!" });
		});
	} catch (err) {
		console.log(err);
		res.status(400).send();
	}
}
export { login, logout, signup };
