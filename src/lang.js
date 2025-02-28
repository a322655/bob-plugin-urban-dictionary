/**
 * Urban Dictionary is an English slang dictionary
 * Only supports English queries but can display results in any target language setting
 */

// Supported languages
var languageList = [
  ["auto", "auto"],
  ["en", "en"],
  ["zh-Hans", "zh-Hans"],
  ["zh-Hant", "zh-Hant"],
  ["ja", "ja"],
  ["ko", "ko"],
  ["fr", "fr"],
  ["de", "de"],
  ["es", "es"],
  ["ru", "ru"],
];

// Get supported languages
function getSupportLanguages() {
  // Return only the first element as the supported language list
  return languageList.map(([lang]) => lang);
}

exports.getSupportLanguages = getSupportLanguages;
