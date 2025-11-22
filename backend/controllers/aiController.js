const { GoogleGenAI } = require("@google/genai");
const {
  researchPostIdeasPrompt,
  generateReplyPrompt,
  researchSummaryPrompt,
} = require("../utils/prompts");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Generate Research content from title
// @route   POST /api/ai/generate
// @access  Private
const generateResearchPost = async (req, res) => {
  try {
    const { title, tone } = req.body;
console.log("Generate Research Post Request Body:", req.body);
    if (!title || !tone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = `Write a markdown-formatted research post titled "${title}". Use a ${tone} tone. Include an introduction, subheadings, code examples if relevant, and a conclusion.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let rawText = response.text;
    res.status(200).json(rawText);
  } catch (error) {
    console.error("Error generating research post:", error);
    res.status(500).json({
      message: "Failed to generate research post",
      error: error.message,
    });
  }
};

// @desc    Generate Research post ideas from title
// @route   POST /api/ai/generate-ideas
// @access  Private
const generateResearchPostIdeas = async (req, res) => {
  try {
    const { topics } = req.body;

    if (!topics) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = researchPostIdeasPrompt(topics);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let rawText = response.text;

    // Clean it: Remove ```json and ``` from beginning and end
    const cleanedText = rawText
      .replace(/^```json\s*/, "") // remove starting ```json
      .replace(/```$/, "") // remove ending ```
      .trim(); // remove extra spaces

    // Now safe to parse
    const data = JSON.parse(cleanedText);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate research post ideas",
      error: error.message,
    });
  }
};

// @desc    Generate comment reply
// @route   POST /api/ai/generate-reply
// @access  Private
const generateCommentReply = async (req, res) => {
  try {
    const { author, content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = generateReplyPrompt({ author, content });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let rawText = response.text;
    res.status(200).json(rawText);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate comment reply",
      error: error.message,
    });
  }
};

// @desc    Generate Research post summary
// @route   POST /api/ai/generate-summary
// @access  Private
const generatePostSummary = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = researchSummaryPrompt(content);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
console.log(response);
    let rawText = response.text;

    // Clean it: Remove ```json and ``` from beginning and end
    const cleanedText = rawText
      .replace(/^```json\s*/, "") // remove starting ```json
      .replace(/```$/, "") // remove ending ```
      .trim(); // remove extra spaces

    // Now safe to parse
    const data = JSON.parse(cleanedText);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate research post summary",
      error: error.message,
    });
  }
};

module.exports = {
  generateResearchPost,
  generateResearchPostIdeas,
  generateCommentReply,
  generatePostSummary,
};
