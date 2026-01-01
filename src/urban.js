var utils = require("./utils.js");

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
		const list = response.data && response.data.list;
		if (!list || list.length === 0) {
			return null;
		}

		// Sort by thumbs up count (most popular definitions first)
		list.sort((a, b) => b.thumbs_up - a.thumbs_up);

		// Take top 3 definitions and clean the text
		const maxDefinitions = Math.min(3, list.length);
		const topDefinitions = list.slice(0, maxDefinitions);

		return topDefinitions.map((def) => ({
			definition: utils.cleanUDText(def.definition),
			example: utils.cleanUDText(def.example),
			thumbs_up: def.thumbs_up,
			thumbs_down: def.thumbs_down,
		}));
	});
}

module.exports = {
	fetchDefinitions,
};
