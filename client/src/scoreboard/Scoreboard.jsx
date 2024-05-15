import { useEffect } from "react";

import Head from "./Head";
import Body from "./Body";
import { getCurrentGameYear } from "../../utils/getCurrentGameYear";

// state: { year: number, week: number, type: string }

const initialScoreboardState = {
	year: getCurrentGameYear(),
	weekNum: 1,
	weekType: "regular",
};

function Scoreboard() {
	const [year, setYear] = useState(initialScoreboardState.year);
	const [weekNum, setWeekNum] = useState(initialScoreboardState.weekNum);
	const [weekType, setweekType] = useState(initialScoreboardState.weekType);

	useEffect(() => {}, [year, weekNum, weekType]);

	return (
		<div>
			<div>
				<select
					name="year"
					id="year"
				>
					{/* Generate options based on unique years in the db*/}
					{/*<option value="2019">2019</option>*/}
				</select>
				<select
					name="week"
					id="week"
				>
					{/* Generate options based on unique weeks for the specified year in the db*/}
					{/*<option value="1">1</option>*/}
				</select>
				<select
					name="type"
					id="week-type"
				>
					{/* Generate options based on unique week types (regular or post) for the year*/}
					{/*<option value="regular">regular</option>*/}
				</select>
			</div>
			<div>
				<table>
					<caption></caption>
					<Head />
					<Body />
					{/* Include footer if necessary*/}
				</table>
			</div>
		</div>
	);
}

export default Scoreboard;
