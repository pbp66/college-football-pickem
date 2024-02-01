import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";
import Users from "./users.js";
import Teams from "./teams.js";
import Games from "./games.js";
import Weeks from "./weeks.js";

class Picks extends Model {}

Pick.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		user: {
			type: DataTypes.INTEGER,
			references: {
				model: Users,
				key: "id",
			},
		},
		picked_team: {
			type: DataTypes.INTEGER,
			references: {
				model: Teams,
				key: "id",
			},
		},
		game: {
			type: DataTypes.INTEGER,
			references: {
				model: Games,
				key: "id",
			},
		},
		week: {
			type: DataTypes.INTEGER,
			references: {
				model: Weeks,
				key: "id",
			},
		},
		points_wagered: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				isIn: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			},
		},
		points_won: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null,
		},
	}, // TODO: create hook, script, or automation to update points_won once the game winner is updated.
	{
		sequelize,
		timestamps: true,
		freezeTableName: true,
		underscored: true,
		modelName: "picks",
	}
);

Picks.belongsTo(Users);
Picks.belongsTo(Teams);
Picks.belongsTo(Games);
Picks.belongsTo(Weeks);

export default Picks;
