# Urban Dictionary for Bob

A plugin for [Bob](https://bobtranslate.com/) that allows you to quickly look up slang meanings on Urban Dictionary with optional AI analysis powered by OpenAI, Anthropic, or compatible providers.

_Read this in [简体中文](README_zh-cn.md)_

![Plugin Icon](src/icon.png)

## Features

- 🔍 Directly search English slang, internet terminology, and informal expressions from Urban Dictionary within Bob
- 🎯 Get top-rated definitions sorted by popularity (up to 3 displayed)
- 📊 View upvote and downvote statistics for each definition
- 🌐 Support for multiple target languages: Simplified Chinese, Traditional Chinese, Japanese, Korean, French, German, Spanish, and Russian
- 🤖 Integrated AI analysis with support for OpenAI, Anthropic, and compatible custom providers
- 📱 Seamless integration with Bob's translation features

## Installation

### Prerequisites

- macOS device
- [Bob](https://bobtranslate.com/) app installed (v0.5.0 or higher)

### Installation Steps

1. Download the latest `.bobplugin` file from the [Releases](https://github.com/a322655/bob-plugin-urban-dictionary/releases) page
2. Double-click the downloaded file to install it in Bob
3. Enable the plugin in Bob preferences (if you need the AI analysis feature, choose a provider and add the corresponding API key in the plugin settings)

## Usage

1. Select or input the English slang or phrase you want to look up
2. Activate Bob (via hotkey or menu bar)
3. Bob will display Urban Dictionary definitions along with optional AI analysis

**Example queries**:

- "throw shade"
- "yeet"
- "Karen"
- "Netflix and chill"
- "sus"

![example query](docs/assets/example-english.png)

## Configuration Options

The plugin provides the following configuration options:

| Option            | Description                                                                  | Required                      |
| ----------------- | ---------------------------------------------------------------------------- | ----------------------------- |
| AI Provider       | Select OpenAI, Anthropic, or a compatible custom provider                    | No (defaults to OpenAI)       |
| Custom Base URL   | Base URL for custom OpenAI-compatible or Anthropic-compatible providers       | Yes for Custom providers      |
| API Key           | API key for the selected provider                                            | Yes for AI analysis           |
| OpenAI Model      | Select an OpenAI preset model or choose Custom for other providers            | No (defaults to GPT-5.4)      |
| Custom Model Name | Enter the exact model name when using Custom or a non-OpenAI provider         | Yes for non-OpenAI providers |

### Provider Support

- **OpenAI**: Uses the Responses API at `https://api.openai.com/v1/responses`.
- **Anthropic**: Uses the Messages API at `https://api.anthropic.com/v1/messages`.
- **Custom (OpenAI Compatible)**: Uses the Chat Completions API at `<baseUrl>/v1/chat/completions`.
- **Custom (Anthropic Compatible)**: Uses the Messages API at `<baseUrl>/v1/messages`.

The preset model dropdown is OpenAI-focused. For Anthropic or custom providers, select **Custom** and enter the exact model name in **Custom Model Name**.

Available OpenAI model options:

- **GPT-5.4** (default, flagship model)
- **GPT-5.4 Pro** (highest quality, uses more compute)
- **GPT-5.4 Mini** (fast and cost-effective)
- **GPT-5.4 Nano** (fastest and cheapest)
- **Custom** (specify your own model name)

## Contributing

Contributions via Pull Requests and Issues are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

1. Clone the repository to your local machine
2. Use the provided build script to create the plugin package:
   ```bash
   ./build.sh
   ```
3. Double-click the generated `.bobplugin` file to install it in Bob for testing
4. Test the functionality with various types of slang and phrases

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgements

- [Urban Dictionary](https://www.urbandictionary.com/) - For providing slang definition data
- [OpenAI](https://openai.com/) - For providing OpenAI-compatible analysis capabilities
- [Anthropic](https://www.anthropic.com/) - For providing Anthropic-compatible analysis capabilities
- [Bob App](https://bobtranslate.com/) - For providing an excellent translation platform and plugin system
