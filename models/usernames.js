import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";
import Users from "./users.js";

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
				foreignKey: "id",
			},
		},
	},
	{
		sequelize,
		timestamps: true,
		freezeTableName: true,
		underscored: true,
		modelName: "usernames",
	}
);

export default Usernames;
