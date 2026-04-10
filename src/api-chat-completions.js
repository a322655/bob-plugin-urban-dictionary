function hasVersionPrefix(url) {
	return /\/v\d+\/?$/.test(url);
}

function buildRequest(baseUrl, apiKey, model, systemPrompt, userPrompt) {
	const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
	const url = hasVersionPrefix(normalizedBaseUrl)
		? `${normalizedBaseUrl}/chat/completions`
		: `${normalizedBaseUrl}/v1/chat/completions`;
	return {
		url,
		method: "POST",
		header: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: {
			model,
			stream: false,
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
		},
	};
}

function extractText(responseData) {
	return responseData?.choices?.[0]?.message?.content ?? null;
}

module.exports = {
	buildRequest,
	extractText,
};
