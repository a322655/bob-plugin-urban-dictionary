var lang = require("./lang.js");

/**
 * Return the supported languages
 */
function supportLanguages() {
  return lang.getSupportLanguages();
}

/**
 * Remove Markdown formatting from text to ensure compatibility with Bob's plain text display
 * @param {string} text Text with potential Markdown formatting
 * @returns {string} Cleaned plain text
 */
function removeMarkdown(text) {
  if (!text) return "";

  // Replace code blocks, but preserve their line breaks
  text = text.replace(/```[\s\S]*?```/g, function (match) {
    // Keep the language name if present
    return match.replace(/```(?:\w+)?\n?/, "").replace(/```$/, "");
  });

  // Replace inline code
  text = text.replace(/`([^`]+)`/g, "$1");

  // Replace headers but keep content
  text = text.replace(/^(#{1,6})\s+(.+)$/gm, "$2");

  // Replace bold and italic
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/_([^_]+)_/g, "$1");

  // Replace list markers
  text = text.replace(/^[\s]*[-*+][\s]+/gm, "• ");

  // Replace numbered lists (keep them as is)
  text = text.replace(/^[\s]*(\d+\.)[\s]+/gm, "$1 ");

  // Replace blockquotes but preserve content
  text = text.replace(/^[\s]*>[\s]*/gm, "");

  // Replace horizontal rules
  text = text.replace(/^[\s]*[-*_]{3,}[\s]*$/gm, "\n---\n");

  // Replace links [text](url) with just text
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

  // Replace images ![alt](url) with just alt text
  text = text.replace(/!\[([^\]]+)\]\([^\)]+\)/g, "$1");

  // Replace tables but keep content and structure using spaces
  text = text.replace(/\|/g, "  ").replace(/^\s*[-:]+[-|\s:]*$/gm, "");

  // Clean up excessive spaces, but NOT newlines
  text = text.replace(/ {2,}/g, " ");

  // Make sure paragraphs are properly separated
  text = text.replace(/\n{3,}/g, "\n\n");

  return text;
}

/**
 * Call OpenAI API to analyze Urban Dictionary definitions
 * @param {array} definitions Top definitions from Urban Dictionary
 * @param {string} targetLanguage Target language code
 * @param {string} term The term being looked up
 * @returns {Promise} Promise that resolves to OpenAI's analysis
 */
async function analyzeWithGPT(definitions, targetLanguage, term) {
  const apiKey = $option.apiKey;
  const model = $option.model || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error(
      "OpenAI API Key is not set. Please add your API key in the plugin settings."
    );
  }

  // Extract the main content from definitions to send to GPT
  const definitionTexts = definitions
    .map((def, index) => {
      return `Definition ${index + 1}: ${def.definition.replace(
        /\[|\]/g,
        ""
      )}\nExample: ${def.example.replace(/\[|\]/g, "")}`;
    })
    .join("\n\n");

  // Determine system message language based on target language
  let systemLanguage = "English";
  let userLanguage = "English";

  // Map target language codes to language names
  if (targetLanguage === "zh-Hans") {
    systemLanguage = "Simplified Chinese";
    userLanguage = "简体中文";
  } else if (targetLanguage === "zh-Hant") {
    systemLanguage = "Traditional Chinese";
    userLanguage = "繁體中文";
  } else if (targetLanguage === "ja") {
    systemLanguage = "Japanese";
    userLanguage = "日本語";
  } else if (targetLanguage === "ko") {
    systemLanguage = "Korean";
    userLanguage = "한국어";
  } else if (targetLanguage === "fr") {
    systemLanguage = "French";
    userLanguage = "Français";
  } else if (targetLanguage === "de") {
    systemLanguage = "German";
    userLanguage = "Deutsch";
  } else if (targetLanguage === "es") {
    systemLanguage = "Spanish";
    userLanguage = "Español";
  } else if (targetLanguage === "ru") {
    systemLanguage = "Russian";
    userLanguage = "Русский";
  }

  // Prepare request body
  const requestBody = {
    model: model,
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that explains slang terms and informal expressions. Analyze the provided Urban Dictionary definitions and give a clear explanation in ${systemLanguage}. Include cultural context, common usage, and appropriateness level.`,
      },
      {
        role: "user",
        content: `I need an explanation of the slang term "${term}" in ${userLanguage}. Here are the top definitions from Urban Dictionary:\n\n${definitionTexts}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  };

  // Define request options
  const options = {
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    header: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: requestBody,
  };

  try {
    // Make API request
    const response = await $http.request(options);

    if (
      response.data &&
      response.data.choices &&
      response.data.choices.length > 0
    ) {
      // Clean Markdown and return plain text result
      const content = response.data.choices[0].message.content.trim();

      // Ensure text line breaks are preserved and paragraphs are clear
      let cleanedContent = removeMarkdown(content);

      // If the cleaned text does not end with a newline, add one
      if (cleanedContent && !cleanedContent.endsWith("\n")) {
        cleanedContent += "\n";
      }

      return cleanedContent;
    } else {
      throw new Error("Failed to get a response from OpenAI API");
    }
  } catch (error) {
    // Handle API errors
    let errorMessage = "OpenAI API Error: ";

    if (error.response && error.response.data && error.response.data.error) {
      errorMessage += error.response.data.error.message;
    } else {
      errorMessage += error.message || "Unknown error";
    }

    throw new Error(errorMessage);
  }
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

  let urlEncodedWord = encodeURIComponent(source);
  let options = {
    url: `https://api.urbandictionary.com/v0/define?term=${urlEncodedWord}`,
    method: "GET",
    header: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36",
    },
  };

  $http
    .request(options)
    .then(async (response) => {
      if (
        response.data &&
        response.data.list &&
        response.data.list.length > 0
      ) {
        let definitions = response.data.list;
        // Sort by thumbs up count (most popular definitions first)
        definitions.sort((a, b) => b.thumbs_up - a.thumbs_up);

        let result = {
          from: detectFrom,
          to: detectTo,
          fromParagraphs: [source],
          toParagraphs: [],
        };

        // Add up to 3 top definitions
        const maxDefinitions = Math.min(3, definitions.length);
        let topDefinitions = definitions.slice(0, maxDefinitions);

        for (let i = 0; i < topDefinitions.length; i++) {
          const def = topDefinitions[i];
          // Clean up definition (remove square brackets, clean up line breaks)
          let cleanDefinition = def.definition
            .replace(/\[|\]/g, "")
            .replace(/\r\n/g, "\n")
            .trim();

          let cleanExample = def.example
            .replace(/\[|\]/g, "")
            .replace(/\r\n/g, "\n")
            .trim();

          // Add this definition to result
          let defText = `${
            i + 1
          }. ${cleanDefinition}\n\nExample: ${cleanExample}\n\n(👍 ${
            def.thumbs_up
          } | 👎 ${def.thumbs_down})`;
          result.toParagraphs.push(defText);
        }

        // Try to add GPT analysis if API key is provided
        try {
          if ($option.apiKey) {
            const gptAnalysis = await analyzeWithGPT(
              topDefinitions,
              detectTo,
              source
            );

            // Use a more obvious separator
            result.toParagraphs.push(
              "\n=========================================\n"
            );
            result.toParagraphs.push("🤖 GPT Analysis:");

            // Ensure GPT analysis content is added correctly by paragraphs
            const gptParagraphs = gptAnalysis.split("\n\n");

            // Add each paragraph separately, not as a whole
            gptParagraphs.forEach((paragraph) => {
              if (paragraph.trim()) {
                result.toParagraphs.push(paragraph.trim());
              }
            });
          }
        } catch (error) {
          // Add error message but still return Urban Dictionary results
          result.toParagraphs.push(
            "\n=========================================\n"
          );
          result.toParagraphs.push("❌ GPT Analysis Error:");
          result.toParagraphs.push(error.message);
        }

        completion({ result });
      } else {
        completion({
          error: {
            type: "notFound",
            message: "No definitions found",
            addition:
              "Urban Dictionary doesn't have a definition for this term.",
          },
        });
      }
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
