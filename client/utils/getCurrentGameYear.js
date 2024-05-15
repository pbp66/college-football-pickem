export function getCurrentGameYear() {
	const now = new Date();
	const currentDay = now.getDate();
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();
	let gameYear = currentYear;

	if (currentMonth < 8 && currentDay < 24) {
		gameYear = currentYear - 1;
	}

	return gameYear;
}
