import { Model, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../config/connection";

class User extends Model {
	async checkPassword(loginPw) {
		return await bcrypt.compare(loginPw, this.password);
	}
}

User.init(
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
		email: {
			type: DataTypes.STRING,
			allowNull: false,
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
		modelName: "user",
	}
);

export default User;
