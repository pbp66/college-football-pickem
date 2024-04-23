import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";
import { Users } from "./models.js";

class Emails extends Model {}

Emails.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isEmail: true,
			},
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
				name: "UNIQUE_EMAIL_CONSTRAINT",
				unique: true,
				fields: ["email", "user_id"],
			},
		],
		timestamps: true,
		freezeTableName: true,
		underscored: true,
		modelName: "emails",
	}
);

export default Emails;
