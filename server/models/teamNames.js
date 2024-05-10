import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connection.js";
import { Teams } from "./models.js";

class TeamNames extends Model {}

TeamNames.init(
	{
		name: {
			//! Time to learn you a thing or two about sequelize and MySQL... Specifically with MySQL, all string types are, by default, case-insensitive. This means that if you have a unique constraint on a string column, you can't have "foo" and "FOO" in the same column. Sequelize doesn't appear to have any easy means of setting the charSet for a specific column. To get around this, you can use the BINARY attribute to make the column case-sensitive. This is what the { binary: true } option does. As far as I'm aware, there is no need to further specify a charSet using collate. The other alternative is to define a regular ol' id as the PK and remove the PK constraint from name and team_id. For reference: https://github.com/sequelize/sequelize/issues/7110
			type: DataTypes.STRING({ binary: true }),
			primaryKey: true,
			validate: {
				isEmail: true,
			},
		},
		team_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			references: {
				model: Teams,
				key: "id",
			},
		},
	},
	{
		sequelize,
		timestamps: true,
		freezeTableName: true,
		underscored: true,
		modelName: "team_names",
	}
);

export default TeamNames;
