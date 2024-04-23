import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";
import { Users, Teams, Games, Weeks } from "./models.js";

class Picks extends Model {}

Picks.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		user_id: {
			type: DataTypes.INTEGER,
			references: {
				model: Users,
				key: "id",
			},
		},
		picked_team_id: {
			type: DataTypes.INTEGER,
			references: {
				model: Teams,
				key: "id",
			},
		},
		game_id: {
			type: DataTypes.INTEGER,
			references: {
				model: Games,
				key: "id",
			},
		},
		week_id: {
			type: DataTypes.INTEGER,
			references: {
				model: Weeks,
				key: "id",
			},
		},
		points_wagered: {
			type: DataTypes.INTEGER,
			allowNull: false,
			// TODO: create custom validator. Points are typically between 1 and 10, but bowl games could be greater than 10...
			// validate: {
			// 	isIn: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			// },
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

export default Picks;
