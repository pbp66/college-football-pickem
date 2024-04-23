import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";
import { Users, Weeks } from "./models.js";

class WeeklyScoreboard extends Model {}

WeeklyScoreboard.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Users,
				key: "id",
			},
		},
		week_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Weeks,
				key: "id",
			},
		},
		points_won: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 0,
			},
		},
		correct_picks: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 0,
			},
		},
	},
	{
		sequelize,
		indexes: [
			{
				name: "UNIQUE_WEEKLY_SCOREBOARD_CONSTRAINT",
				unique: true,
				fields: ["user_id", "week_id"],
			},
		],
		timestamps: true,
		freezeTableName: true,
		underscored: true,
		modelName: "weekly_scoreboard",
	}
);

export default WeeklyScoreboard;
