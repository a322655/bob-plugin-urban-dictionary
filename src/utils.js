/**
 * Remove Markdown formatting from text to ensure compatibility with Bob's plain text display
 * @param {string} text Text with potential Markdown formatting
 * @returns {string} Cleaned plain text
 */
function removeMarkdown(text) {
	if (!text) return "";

	// Replace code blocks, but preserve their line breaks
	text = text.replace(/```[\s\S]*?```/g, (match) => {
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
	text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

	// Replace images ![alt](url) with just alt text
	text = text.replace(/!\[([^\]]+)\]\([^)]+\)/g, "$1");

	// Replace tables but keep content and structure using spaces
	text = text.replace(/\|/g, "  ").replace(/^\s*[-:]+[-|\s:]*$/gm, "");

	// Clean up excessive spaces, but NOT newlines
	text = text.replace(/ {2,}/g, " ");

	// Make sure paragraphs are properly separated
	text = text.replace(/\n{3,}/g, "\n\n");

	return text;
}

/**
 * Clean Urban Dictionary text by removing square brackets and normalizing line breaks
 * @param {string} text Raw text from Urban Dictionary
 * @returns {string} Cleaned text
 */
function cleanUDText(text) {
	if (!text) return "";
	return text.replace(/\[|\]/g, "").replace(/\r\n/g, "\n").trim();
}

module.exports = {
	removeMarkdown,
	cleanUDText,
};
