function buildRequest(apiKey, model, systemPrompt, userPrompt) {
	return {
		url: "https://api.openai.com/v1/responses",
		method: "POST",
		header: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: {
			model,
			instructions: systemPrompt,
			input: userPrompt,
		},
	};
}

function extractText(responseData) {
	const output = responseData?.output ?? [];

	for (const item of output) {
		const content = item?.content ?? [];

		for (const contentItem of content) {
			if (contentItem?.type === "output_text" && contentItem.text) {
				return contentItem.text;
			}
		}
	}

	return null;
}

module.exports = {
	buildRequest,
	extractText,
};
