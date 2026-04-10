const utils = require("./utils.js");

function normalizeVoteCount(value) {
	const voteCount = Number(value);
	return Number.isFinite(voteCount) ? voteCount : 0;
}

/**
 * Fetch definitions from Urban Dictionary API
 * @param {string} term The term to look up
 * @param {object} $http Bob's HTTP client
 * @returns {Promise<Array>} Promise that resolves to an array of top definitions (max 3)
 */
function fetchDefinitions(term, $http) {
	const urlEncodedWord = encodeURIComponent(term);
	const options = {
		url: `https://api.urbandictionary.com/v0/define?term=${urlEncodedWord}`,
		method: "GET",
		header: {
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36",
		},
	};

	return $http.request(options).then((response) => {
		const list = response.data?.list;
		if (!list || list.length === 0) {
			return null;
		}

		const definitions = list.map((def) => ({
			definition: utils.cleanUDText(def.definition),
			example: utils.cleanUDText(def.example),
			thumbs_up: normalizeVoteCount(def.thumbs_up),
			thumbs_down: normalizeVoteCount(def.thumbs_down),
		}));
		const votesUnavailable =
			definitions.length >= 2 &&
			definitions.every(
				(definition) =>
					definition.thumbs_up === 0 && definition.thumbs_down === 0,
			);
		const rankedDefinitions = votesUnavailable
			? definitions
			: [...definitions].sort((a, b) => b.thumbs_up - a.thumbs_up);

		return rankedDefinitions.slice(0, 3).map((definition) => ({
			...definition,
			votesUnavailable,
		}));
	});
}

module.exports = {
	fetchDefinitions,
};
