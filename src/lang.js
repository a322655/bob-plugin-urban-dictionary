/**
 * Urban Dictionary is an English slang dictionary
 * Only supports English queries but can display results in any target language setting
 */

const supportedLanguages = [
	"auto",
	"en",
	"zh-Hans",
	"zh-Hant",
	"ja",
	"ko",
	"fr",
	"de",
	"es",
	"ru",
];

function getSupportLanguages() {
	return supportedLanguages;
}

module.exports = {
	getSupportLanguages,
};
