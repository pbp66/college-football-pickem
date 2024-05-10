import {
	getAllGames,
	getGameById,
	createGame,
	updateGameWinner,
} from "./gameController";
import {
	getAllPicks,
	getAllUserPicks,
	getAllPicksOfTheWeek,
	getUsersWeeklyPicks,
	createPick,
} from "./pickController";
import {
	getAllTimeUserScore,
	getUserScoreForWeek,
	getUserScoreForYear,
} from "./scoreController";
import { getSeasonWinner, getSeasonLoser } from "./seasonController";
import { getAllTeams, addTeam, deleteTeam } from "./teamController";
import { login, logout, signup } from "./userController";
import {
	getAllWeekData,
	getAllWeekNumbers,
	getWeeklyScoreboard,
	getWeek,
} from "./weekController";

export {
	getAllGames,
	getGameById,
	createGame,
	updateGameWinner,
	getAllPicks,
	getAllUserPicks,
	getAllPicksOfTheWeek,
	getUsersWeeklyPicks,
	createPick,
	getAllTimeUserScore,
	getUserScoreForWeek,
	getUserScoreForYear,
	getSeasonWinner,
	getSeasonLoser,
	getAllTeams,
	addTeam,
	deleteTeam,
	login,
	logout,
	signup,
	getAllWeekData,
	getAllWeekNumbers,
	getWeeklyScoreboard,
	getWeek,
};
