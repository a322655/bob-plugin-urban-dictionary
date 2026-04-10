const utils = require("./utils.js");
const openaiApi = require("./api-openai.js");
const chatCompletionsApi = require("./api-chat-completions.js");
const anthropicApi = require("./api-anthropic.js");

const OPENAI_PROVIDER = "openai";
const ANTHROPIC_PROVIDER = "anthropic";
const CUSTOM_OPENAI_PROVIDER = "custom-openai";
const CUSTOM_ANTHROPIC_PROVIDER = "custom-anthropic";

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

function resolveProvider(provider) {
	return provider || OPENAI_PROVIDER;
}

function getProviderLabel(provider) {
	switch (provider) {
		case ANTHROPIC_PROVIDER:
			return "Anthropic";
		case CUSTOM_OPENAI_PROVIDER:
			return "Custom OpenAI-Compatible";
		case CUSTOM_ANTHROPIC_PROVIDER:
			return "Custom Anthropic-Compatible";
		default:
			return "OpenAI";
	}
}

function resolveModel(provider, options) {
	if (provider === OPENAI_PROVIDER) {
		if (options.model === "custom") {
			if (!options.customModel) {
				throw new Error(
					"Custom Model Name is required when 'Custom' is selected in OpenAI Model.",
				);
			}
			return options.customModel;
		}
		return options.model || "gpt-5.4";
	}

	if (provider === ANTHROPIC_PROVIDER) {
		if (options.anthropicModel === "custom") {
			if (!options.customModel) {
				throw new Error(
					"Custom Model Name is required when 'Custom' is selected in Anthropic Model.",
				);
			}
			return options.customModel;
		}
		return options.anthropicModel || "claude-sonnet-4-6";
	}

	if (!options.customModel) {
		throw new Error(
			"Custom Model Name is required when using custom providers.",
		);
	}

	return options.customModel;
}

function buildDefinitionText(definitions) {
	return definitions
		.map((definition, index) => {
			return `Definition ${index + 1}: ${definition.definition}\nExample: ${definition.example}`;
		})
		.join("\n\n");
}

function buildPrompts(definitions, targetLanguage, term) {
	const langInfo = LANGUAGE_MAP[targetLanguage] || {
		system: "English",
		user: "English",
	};
	const definitionText = buildDefinitionText(definitions);

	return {
		systemPrompt: `You are a helpful assistant that explains slang terms and informal expressions. Analyze the provided Urban Dictionary definitions and give a clear explanation in ${langInfo.system}. Include cultural context, common usage, and appropriateness level.`,
		userPrompt: `I need an explanation of the slang term "${term}" in ${langInfo.user}. Here are the top definitions from Urban Dictionary:\n\n${definitionText}`,
	};
}

function buildRequest(provider, options, model, systemPrompt, userPrompt) {
	if (
		(provider === CUSTOM_OPENAI_PROVIDER ||
			provider === CUSTOM_ANTHROPIC_PROVIDER) &&
		!options.baseUrl
	) {
		throw new Error("Custom Base URL is required when using custom providers.");
	}

	switch (provider) {
		case ANTHROPIC_PROVIDER:
			return anthropicApi.buildRequest(
				undefined,
				options.apiKey,
				model,
				systemPrompt,
				userPrompt,
			);
		case CUSTOM_OPENAI_PROVIDER:
			return chatCompletionsApi.buildRequest(
				options.baseUrl,
				options.apiKey,
				model,
				systemPrompt,
				userPrompt,
			);
		case CUSTOM_ANTHROPIC_PROVIDER:
			return anthropicApi.buildRequest(
				options.baseUrl,
				options.apiKey,
				model,
				systemPrompt,
				userPrompt,
			);
		default:
			return openaiApi.buildRequest(
				options.apiKey,
				model,
				systemPrompt,
				userPrompt,
			);
	}
}

function extractText(provider, responseData) {
	switch (provider) {
		case ANTHROPIC_PROVIDER:
		case CUSTOM_ANTHROPIC_PROVIDER:
			return anthropicApi.extractText(responseData);
		case CUSTOM_OPENAI_PROVIDER:
			return chatCompletionsApi.extractText(responseData);
		default:
			return openaiApi.extractText(responseData);
	}
}

function cleanText(textContent) {
	const cleanedContent = utils.removeMarkdown(textContent.trim());

	return cleanedContent && !cleanedContent.endsWith("\n")
		? `${cleanedContent}\n`
		: cleanedContent;
}

function parseErrorMessage(error) {
	return (
		error.response?.data?.error?.message || error.message || "Unknown error"
	);
}

async function analyzeWithAI(
	definitions,
	targetLanguage,
	term,
	$http,
	options,
) {
	const provider = resolveProvider(options.provider);
	const providerLabel = getProviderLabel(provider);

	if (!options.apiKey) {
		throw new Error(
			`${providerLabel} API Key is not set. Please add your API key in the plugin settings.`,
		);
	}

	const model = resolveModel(provider, options);
	const { systemPrompt, userPrompt } = buildPrompts(
		definitions,
		targetLanguage,
		term,
	);
	const requestOptions = buildRequest(
		provider,
		options,
		model,
		systemPrompt,
		userPrompt,
	);

	try {
		const response = await $http.request(requestOptions);
		const data =
			typeof response.data === "string"
				? JSON.parse(response.data)
				: response.data;
		const textContent = extractText(provider, data);

		if (!textContent) {
			throw new Error(
				`Failed to parse response: ${JSON.stringify(data).slice(0, 200)}`,
			);
		}

		return cleanText(textContent);
	} catch (error) {
		throw new Error(`${providerLabel} API Error: ${parseErrorMessage(error)}`);
	}
}

module.exports = {
	analyzeWithAI,
};
