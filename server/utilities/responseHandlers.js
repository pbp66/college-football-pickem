function sendBadInputResponse(res, message) {
	res.status(400).send({ message });
}

export { sendBadInputResponse };
