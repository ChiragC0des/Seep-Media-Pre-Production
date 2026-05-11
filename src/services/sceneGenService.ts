import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateScenesFromScript = async (script: string, secondsPerScene: number) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following script and provide a cinematic breakdown.
    
    1. Break it down into multiple scenes, each representing approximately ${secondsPerScene} seconds of screen time.
    2. Identify all major characters appearing in the script.
    3. Identify all primary environments/locations.
    
    Script:
    ${script}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                duration: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["Interior", "Exterior"] }
              },
              required: ["name", "description", "duration", "category"]
            }
          },
          extractedEntities: {
            type: Type.OBJECT,
            properties: {
              characters: { type: Type.ARRAY, items: { type: Type.STRING } },
              environments: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["characters", "environments"]
          }
        },
        required: ["scenes", "extractedEntities"]
      }
    }
  });

  if (!response.text) throw new Error("No analysis generated");
  return JSON.parse(response.text.trim());
};
