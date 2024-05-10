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
		// TODO: Generate validator where only 1 email can be primary per user
		primary: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		// TODO: Generate validator where primary and secondary values cannot be the same
		secondary: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
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
