function hasVersionPrefix(url) {
	return /\/v\d+\/?$/.test(url);
}

function buildRequest(baseUrl, apiKey, model, systemPrompt, userPrompt) {
	const normalizedBaseUrl = (baseUrl || "https://api.anthropic.com").replace(
		/\/$/,
		"",
	);
	const url = hasVersionPrefix(normalizedBaseUrl)
		? `${normalizedBaseUrl}/messages`
		: `${normalizedBaseUrl}/v1/messages`;
	return {
		url,
		method: "POST",
		header: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
			"anthropic-version": "2023-06-01",
		},
		body: {
			model,
			max_tokens: 4096,
			stream: false,
			system: systemPrompt,
			messages: [{ role: "user", content: userPrompt }],
		},
	};
}

function extractText(responseData) {
	const content = responseData?.content ?? [];

	return content
		.filter((item) => item?.type === "text" && item.text)
		.map((item) => item.text)
		.join("");
}

module.exports = {
	buildRequest,
	extractText,
};
