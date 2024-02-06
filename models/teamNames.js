import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";
import { Teams } from "./models.js";

class TeamNames extends Model {}

TeamNames.init(
	{
		name: {
			type: DataTypes.STRING,
			primaryKey: true,
			validate: {
				isEmail: true,
			},
		},
		team_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			references: {
				model: Teams,
				key: "id",
			},
		},
	},
	{
		sequelize,
		timestamps: true,
		freezeTableName: true,
		underscored: true,
		modelName: "team_names",
	}
);

export default TeamNames;
