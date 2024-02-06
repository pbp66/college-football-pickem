import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";
import { Users } from "./models.js";

class YearlyScoreboard extends Model {}

YearlyScoreboard.init(
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
		year: {
			type: DataTypes.INTEGER,
			allowNull: false,
			// TODO: Evaluate if a foreign key relationship is needed for Weeks.year
			// references: {
			// 	model: Weeks,
			// 	key: "year",
			// },
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
		week_count: {
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
				name: "UNIQUE_YEARLY_SCOREBOARD_CONSTRAINT",
				unique: true,
				fields: ["user_id", "year"],
			},
		],
		timestamps: true,
		freezeTableName: true,
		underscored: true,
		modelName: "yearly_scoreboard",
	}
);

export default YearlyScoreboard;
