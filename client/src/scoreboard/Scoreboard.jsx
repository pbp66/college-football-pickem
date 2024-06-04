import { useEffect, useState } from "react";

import Head from "./Head";
import Body from "./Body";
import calendarIcon from "../assets/calendar-svgrepo-com.svg";
import { getCurrentGameYear } from "../../utils/getCurrentGameYear";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// state: { year: number, week: number, type: string }

const initialScoreboardState = {
	year: getCurrentGameYear(),
	weekNum: 1,
	weekType: "regular",
};

//* weekData is a JSON object representing an unordered map. Years are the keys. Each value corresponds to another JSON object representing an additional unordered map. The keys for this map are the season/week type. Each value is an array of all possible weeks.
function Scoreboard({ weekData }) {
	// const [gameWeek, setGameWeek] = useState(initialScoreboardState);

	// Query for scoreboard data
	// useEffect(() => {
	// 	let useEffectActive = true;
	// 	async function fetchScoreboard() {
	// 		const scoreboardData = await fetch(
	// 			`/api/scoreboard?year=${gameWeek.year}&weekNum=${gameWeek.weekNum}&season=${gameWeek.weekType}`
	// 		);

	// 		//TODO: Translate scoreboardData into readable scoreboard table...
	// 	}
	// 	fetchScoreboard();
	// 	return () => {
	// 		useEffectActive = false;
	// 	};
	// }, [gameWeek]);

	function handleCalendarClick() {
		const calendarContainerStyle =
			document.getElementsByClassName("calendar-container")[0].style;
		if (calendarContainerStyle.display === "none") {
			calendarContainerStyle.display = "contents";
		} else {
			calendarContainerStyle.display = "none";
		}
	}

	return (
		<>
			<div className="calendar-wrapper">
				<div className="test">Header</div>
				<button
					className="calendar"
					onClick={handleCalendarClick}
				>
					<img
						src={calendarIcon}
						className="calendar-icon"
						alt="Calendar Icon"
						width={50}
					/>
				</button>
				<div className="calendar-container">
					<div className="Calendar-Header">
						<button>
							{/* 
								//TODO:
								Left arrow to decrease year 
								Disable arrow upon reaching lower limit for years (2019)
						*/}
							&lsaquo;&lsaquo;
						</button>
						<div className="Calendar-Year">Year</div>
						<button>
							{/* 
								//TODO:
								Right arrow to increase year 
								Disable arrow upon reaching upper limit for years (Current year)
						*/}
							&rsaquo;&rsaquo;
						</button>
					</div>
					<ul className="weekList">
						{/* 
							//TODO:
							List of weeks segregated by season type (regular and post)
							Clicking a week sets the state for the page: year, weekNum, and weekType
						*/}
					</ul>
					<div className="Calendar-Footer">
						<button>Cancel</button>
					</div>
				</div>
			</div>
			<div>
				<table>
					<caption></caption>
					<Head />
					<Body />
					{/* Include footer if necessary*/}
				</table>
			</div>
		</>
	);
}

export default Scoreboard;
