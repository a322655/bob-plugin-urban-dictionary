const lang = require("./lang.js");
const urban = require("./urban.js");
const gpt = require("./gpt.js");

/**
 * Return the supported languages
 */
function supportLanguages() {
	return lang.getSupportLanguages();
}

/**
 * Format definitions for display
 * @param {Array} definitions Cleaned definitions from Urban Dictionary
 * @returns {Array} Formatted text paragraphs
 */
function formatDefinitions(definitions) {
	return definitions.map((def, i) => {
		return `${i + 1}. ${def.definition}\n\nExample: ${def.example}\n\n(👍 ${def.thumbs_up} | 👎 ${def.thumbs_down})`;
	});
}

/**
 * @param {object} query Query object, contains text, detectFrom, detectTo
 * @param {function} completion Callback function, used to return the result
 */
function translate(query, completion) {
	const { text: source, detectFrom, detectTo } = query;

	if (!source) {
		completion({
			error: {
				type: "param",
				message: "Translation source is empty.",
				addition: "Required parameter source is empty.",
			},
		});
		return;
	}

	// Urban Dictionary only supports English input
	const englishRegex = /^[A-Za-z0-9\s\-_.,!?'"():;]*$/;
	if (!englishRegex.test(source)) {
		completion({
			error: {
				type: "unsupportedLanguage",
				message: "Urban Dictionary only supports English input.",
				addition: "Please enter an English word or phrase.",
			},
		});
		return;
	}

	urban
		.fetchDefinitions(source, $http)
		.then(async (definitions) => {
			if (!definitions) {
				completion({
					error: {
						type: "notFound",
						message: "No definitions found",
						addition:
							"Urban Dictionary doesn't have a definition for this term.",
					},
				});
				return;
			}

			const result = {
				from: detectFrom,
				to: detectTo,
				fromParagraphs: [source],
				toParagraphs: formatDefinitions(definitions),
			};

			// Try to add GPT analysis if API key is provided
			if ($option.apiKey) {
				try {
					const gptAnalysis = await gpt.analyzeWithGPT(
						definitions,
						detectTo,
						source,
						$http,
						$option,
					);

					// Add separator and GPT analysis
					result.toParagraphs.push(
						"\n=========================================\n",
					);
					result.toParagraphs.push("🤖 GPT Analysis:");

					// Add each paragraph separately
					const gptParagraphs = gptAnalysis.split("\n\n");
					for (const paragraph of gptParagraphs) {
						if (paragraph.trim()) {
							result.toParagraphs.push(paragraph.trim());
						}
					}
				} catch (error) {
					// Add error message but still return Urban Dictionary results
					result.toParagraphs.push(
						"\n=========================================\n",
					);
					result.toParagraphs.push("❌ GPT Analysis Error:");
					result.toParagraphs.push(error.message);
				}
			}

			completion({ result });
		})
		.catch((error) => {
			completion({
				error: {
					type: "network",
					message: "Network error",
					addition: error,
				},
			});
		});
}

module.exports = {
	translate,
	supportLanguages,
};
