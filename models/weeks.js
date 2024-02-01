import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection";
import Game from "./game";

class Weeks extends Model {}

Weeks.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		season: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		week_num: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		game_id: {
			type: DataTypes.INTEGER,
			references: {
				model: Game,
				foreignKey: "id",
			},
		},
	},
	{
		sequelize,
		timestamps: true,
		freezeTableName: true,
		underscored: true,
		modelName: "weeks",
	}
);

export default Weeks;
