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
		primary_color: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				is: /#[0-9a-z]{8}/,
			},
		},
		secondary_color: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				is: /#[0-9a-z]{8}/,
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
		mascot: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		primary_logo: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				isURL: true,
			},
		},
		secondary_logo: {
			type: DataTypes.STRING,
			allowNull: true,
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
	},
	{
		sequelize,
		indexes: [
			{
				name: "UNIQUE_TEAM_LOCATION_CONSTRAINT",
				unique: true,
				fields: ["school_name", "location_id"],
			},
		],
		timestamps: true,
		freezeTableName: true,
		underscored: true,
		modelName: "teams",
	}
);

export default Teams;
