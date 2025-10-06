import { GoogleGenAI, Modality, Type } from "@google/genai";

// Ensure the API key is handled by the environment.
// Do not hardcode or expose the API key in the client-side code.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generatePostIdea = async (topic: string): Promise<string> => {
  if (!API_KEY) {
    return "AI service is currently unavailable. Please check your API key setup.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, engaging social media post caption about "${topic}". Include relevant hashtags. The tone should be cool and modern.`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    if (error instanceof Error) {
        return `An error occurred while generating the post idea: ${error.message}`;
    }
    return "An unknown error occurred while generating the post idea.";
  }
};

export const removeImageBackground = async (base64ImageData: string, mimeType: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("AI service is currently unavailable. Please check your API key setup.");
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: 'Remove the background from this image, leaving only the main subject. The output must be a PNG with a transparent background.',
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image data returned from the AI model.");
  } catch (error) {
      console.error("Error removing image background with Gemini:", error);
      if (error instanceof Error) {
          throw new Error(`An error occurred while processing the image: ${error.message}`);
      }
      throw new Error("An unknown error occurred while processing the image.");
  }
};

export const generateChatReply = async (conversationHistory: string): Promise<{ suggestions: string[] }> => {
  if (!API_KEY) {
    throw new Error("AI service is currently unavailable. Please check your API key setup.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on this recent conversation history, suggest 3 short, relevant, and natural-sounding replies for the user "AMScout_Official" to send.
      Conversation History:
      "${conversationHistory}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 3 short reply suggestions."
            }
          },
          required: ["suggestions"],
        },
      },
    });

    const jsonText = response.text.trim();
    // A simple check to see if the response is a valid JSON object.
    if (jsonText.startsWith('{') && jsonText.endsWith('}')) {
        const parsed = JSON.parse(jsonText);
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
            return parsed;
        }
    }
    throw new Error("AI returned an invalid response format.");
  } catch (error) {
    console.error("Error generating chat replies with Gemini:", error);
    throw new Error("Failed to generate AI replies.");
  }
};