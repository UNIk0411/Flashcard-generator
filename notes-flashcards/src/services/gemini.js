import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateStudyMaterials = async (text) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_GEMINI_API_KEY in your environment.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // List of compatible models to attempt in order of preference
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting study materials generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const prompt = `
You are an expert study material generator.
Analyze the following text and generate high-quality, structured learning assets.

You MUST generate exactly:
1. 20 flashcards (each with a 'question' and 'answer').
2. 20 Multiple-Choice Questions (MCQs). Each MCQ must have a 'question' string, an array of exactly 4 'options' strings, a correct 'answer' string (which must match the EXACT text of one of the options), and a brief 'explanation' string explaining why that answer is correct.
3. A concise summary of the material.
4. A revision sheet, containing key concepts, definitions, formulas, or commands.
5. 10 important exam questions (each with 'question' and 'answer').

CRITICAL RULES:
- Absolutely do not use any emojis anywhere in the output (questions, answers, options, summaries, revision sheets, etc.). All text must be purely text without any emojis.
- If the provided text is too short to extract 20 cards and 20 MCQs, use your general knowledge of the topics mentioned in the text to expand, extrapolate, and generate high-quality items.
- The output must conform exactly to this JSON schema:

{
  "flashcards": [
    {
      "question": "question text",
      "answer": "answer text"
    }
  ],
  "mcqs": [
    {
      "question": "question text",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "answer": "option 1",
      "explanation": "why option 1 is correct"
    }
  ],
  "summary": "concise summary text",
  "revision_sheet": [
    {
      "category": "Key Concepts / Definitions / Important Formulas / Important Commands",
      "title": "concept name",
      "content": "detailed explanation or formula representation"
    }
  ],
  "important_questions": [
    {
      "question": "question text",
      "answer": "detailed answer or explanation"
    }
  ]
}

Provided Text:
${text}
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean response text in case markdown wrapper blocks were added
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText
          .replace(/^```json\s*/, "")
          .replace(/```$/, "")
          .trim();
      }

      const parsedData = JSON.parse(cleanedText);

      // Validate structure and fill missing pieces if anything is malformed
      if (!parsedData.flashcards || !Array.isArray(parsedData.flashcards)) {
        parsedData.flashcards = [];
      }
      if (!parsedData.mcqs || !Array.isArray(parsedData.mcqs)) {
        parsedData.mcqs = [];
      }
      if (typeof parsedData.summary !== "string") {
        parsedData.summary = "No summary generated.";
      }
      if (!parsedData.revision_sheet || !Array.isArray(parsedData.revision_sheet)) {
        parsedData.revision_sheet = [];
      }
      if (!parsedData.important_questions || !Array.isArray(parsedData.important_questions)) {
        parsedData.important_questions = [];
      }

      console.log(`Successfully generated study materials using model: ${modelName}`);
      return parsedData;
    } catch (error) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
      // Continue loop to try next model
    }
  }

  throw new Error("Failed to generate study materials: " + lastError.message);
};
