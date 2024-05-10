import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";
import { Users } from "./models.js";

class Usernames extends Model {}

Usernames.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: Users,
				key: "id",
			},
		},
	},
	{
		sequelize,
		indexes: [
			{
				name: "UNIQUE_USERNAME_CONSTRAINT",
				unique: true,
				fields: ["name", "user_id"],
			},
		],
		timestamps: true,
		freezeTableName: true,
		underscored: true,
		modelName: "usernames",
	}
);

export default Usernames;
