import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

class Locations extends Model {}

Team.init(
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
	},
	{
		sequelize,
		timestamps: true,
		freezeTableName: true,
		underscored: true,
		modelName: "locations",
	}
);

export default Locations;
