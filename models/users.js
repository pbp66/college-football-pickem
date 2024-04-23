import { Model, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../config/connection.js";
import { Emails, Usernames } from "./models.js";

class Users extends Model {
	async checkPassword(loginPw) {
		return await bcrypt.compare(loginPw, this.password);
	}

	getFullname() {
		return [this.first_name, this.last_name].join(" ");
	}
}

Users.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		first_name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		last_name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		fullname: {
			type: DataTypes.VIRTUAL,
			get() {
				return `${this.first_name} ${this.last_name}`;
			},
			set(name) {
				throw new Error("Do not try to set the 'fullname value!");
			},
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		email_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: Emails,
				key: "Id",
			},
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				min: 0, //TODO: Update password validation criteria...
			},
		},
		joined: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		hooks: {
			beforeCreate: async (newUserData) => {
				/* Hash the users password */
				const saltRounds = 12;
				newUserData.password = await bcrypt.hash(
					newUserData.password,
					saltRounds
				);

				/* Check and Set Username */
				if (!Object.hasOwn(newUserData, "username")) {
					newUserData.username = newUserData.first_name;
				}

				return newUserData;
			},

			afterCreate: async (user) => {
				if (user.username === user.first_name) {
					return user.update({
						username: `${user.first_name}-${user.id}`,
					});
				}
			},
		},
		sequelize,
		timestamps: true,
		freezeTableName: true,
		underscored: true,
		modelName: "users",
	}
);

export default Users;
