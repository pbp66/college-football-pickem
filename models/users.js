import { Model, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../config/connection.js";
import Usernames from "./usernames.js";

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
			defaultValue: `${this.first_name}-${this.id}`,
			unique: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true,
			validate: {
				isEmail: true,
			},
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [8],
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
				const saltRounds = 12;
				newUserData.password = await bcrypt.hash(
					newUserData.password,
					saltRounds
				);
				return newUserData;
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
