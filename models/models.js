import Games from "./games.js";
import Locations from "./locations.js";
import Picks from "./picks.js";
import Teams from "./teams.js";
import Usernames from "./usernames.js";
import Users from "./users.js";
import Weeks from "./weeks.js";

Games.belongsTo(Teams, {
	as: "home_team",
	foreignKey: "id",
});
Games.belongsTo(Teams, {
	as: "away_team",
	foreignKey: "id",
});
Games.belongsTo(Teams, {
	as: "winning_team",
	foreignKey: "id",
});
Games.belongsTo(Weeks);
Games.belongsTo(Locations);
Games.hasMany(Picks, {
	foreignKey: "game",
});

Locations.hasMany(Teams, {
	foreignKey: "location",
});
Locations.hasMany(Games, {
	foreignKey: "location",
});

Picks.belongsTo(Users);
Picks.belongsTo(Teams);
Picks.belongsTo(Games);
Picks.belongsTo(Weeks);

Teams.belongsTo(Locations);
Teams.hasMany(Picks, {
	foreignKey: "picked_team",
});
Teams.hasMany(Games, {
	foreignKey: "home_team",
});
Teams.hasMany(Games, {
	foreignKey: "away_team",
});
Teams.hasMany(Games, {
	foreignKey: "winning_team",
});

Usernames.belongsTo(Users);

Users.hasMany(Usernames, {
	foreignKey: "user",
	// Or:
	// foreignKey: { name: "user"},
});
Users.hasMany(Picks, {
	foreignKey: "user",
});

Weeks.hasMany(Games, {
	foreignKey: "week",
});
Weeks.hasMany(Picks, {
	foreignKey: "week",
});

export { Games, Locations, Picks, Teams, Usernames, Users, Weeks };
