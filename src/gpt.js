const utils = require("./utils.js");

/**
 * Language mapping from target language code to language names
 */
const LANGUAGE_MAP = {
	"zh-Hans": { system: "Simplified Chinese", user: "简体中文" },
	"zh-Hant": { system: "Traditional Chinese", user: "繁體中文" },
	ja: { system: "Japanese", user: "日本語" },
	ko: { system: "Korean", user: "한국어" },
	fr: { system: "French", user: "Français" },
	de: { system: "German", user: "Deutsch" },
	es: { system: "Spanish", user: "Español" },
	ru: { system: "Russian", user: "Русский" },
};

/**
 * Call OpenAI Responses API to analyze Urban Dictionary definitions
 * @param {Array} definitions Top definitions from Urban Dictionary
 * @param {string} targetLanguage Target language code
 * @param {string} term The term being looked up
 * @param {object} $http Bob's HTTP client
 * @param {object} options Plugin options containing apiKey, model, useCustomModel, customModel
 * @returns {Promise<string>} Promise that resolves to OpenAI's analysis
 */
async function analyzeWithGPT(
	definitions,
	targetLanguage,
	term,
	$http,
	options,
) {
	const apiKey = options.apiKey;

	// Determine model: use customModel if "custom" is selected
	const model =
		options.model === "custom" && options.customModel
			? options.customModel
			: options.model || "gpt-5.4";

	if (!apiKey) {
		throw new Error(
			"OpenAI API Key is not set. Please add your API key in the plugin settings.",
		);
	}

	// Extract the main content from definitions to send to GPT
	const definitionTexts = definitions
		.map((def, index) => {
			return `Definition ${index + 1}: ${def.definition}\nExample: ${def.example}`;
		})
		.join("\n\n");

	// Determine language based on target language code
	const langInfo = LANGUAGE_MAP[targetLanguage] || {
		system: "English",
		user: "English",
	};

	// Prepare request body for Responses API
	const requestBody = {
		model: model,
		instructions: `You are a helpful assistant that explains slang terms and informal expressions. Analyze the provided Urban Dictionary definitions and give a clear explanation in ${langInfo.system}. Include cultural context, common usage, and appropriateness level.`,
		input: `I need an explanation of the slang term "${term}" in ${langInfo.user}. Here are the top definitions from Urban Dictionary:\n\n${definitionTexts}`,
	};

	// Define request options
	const requestOptions = {
		url: "https://api.openai.com/v1/responses",
		method: "POST",
		header: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: requestBody,
	};

	try {
		// Make API request
		const response = await $http.request(requestOptions);

		// Parse Responses API output
		// Structure: { output: [{ type: "message", content: [{ type: "output_text", text: "..." }] }] }
		if (response.data?.output && response.data.output.length > 0) {
			// Find the message item in output array
			let textContent = null;

			for (let i = 0; i < response.data.output.length; i++) {
				const item = response.data.output[i];
				if (
					item.type === "message" &&
					item.content &&
					item.content.length > 0
				) {
					// Find output_text in content array
					for (let j = 0; j < item.content.length; j++) {
						const contentItem = item.content[j];
						if (contentItem.type === "output_text" && contentItem.text) {
							textContent = contentItem.text;
							break;
						}
					}
					if (textContent) break;
				}
			}

			if (textContent) {
				// Clean Markdown and return plain text result
				let cleanedContent = utils.removeMarkdown(textContent.trim());

				// If the cleaned text does not end with a newline, add one
				if (cleanedContent && !cleanedContent.endsWith("\n")) {
					cleanedContent += "\n";
				}

				return cleanedContent;
			}
		}

		throw new Error("Failed to get a response from OpenAI API");
	} catch (error) {
		// Handle API errors
		let errorMessage = "OpenAI API Error: ";

		if (error.response?.data?.error) {
			errorMessage += error.response.data.error.message;
		} else {
			errorMessage += error.message || "Unknown error";
		}

		throw new Error(errorMessage);
	}
}

module.exports = {
	analyzeWithGPT,
};
