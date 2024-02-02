import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";
import { Locations } from "./models.js";

class Teams extends Model {}

Teams.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		school_name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		mascot: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		abbreviation: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		alt_name1: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		alt_name2: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		alt_name3: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		conference: {
			type: DataTypes.STRING,
			allowNull: false, // TODO: Add validator for valid conferences
		},
		classification: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isIn: ["fbs", "fcs", "iii", "ii"], // TODO: Add remaining valid classifications
			},
		},
		color: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				is: /#[0-9a-z]{8}/,
			},
		},
		alt_color: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				is: /#[0-9a-z]{8}/,
			},
		},
		logo: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isURL: true,
			},
		},
		alt_logo: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isURL: true,
			},
		},
		twitter_handle: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				is: /^@?(\w){1,15}$/,
			},
		},
		location_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: {
				model: Locations,
				key: "id",
			},
		},
	},
	{
		sequelize,
		timestamps: true,
		freezeTableName: true,
		underscored: true,
		modelName: "teams",
	}
);

export default Teams;
