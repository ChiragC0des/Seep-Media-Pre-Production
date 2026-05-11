import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateCharacter = async (prompt?: string, type: string = 'Human') => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt 
      ? `Generate a detailed cinematic character profile based on this concept: ${prompt}. 
         Identify if the character is a Human, Animal, Alien, or Custom species and return this in the "type" field.
         If the character is NOT Human, ensure physical traits like skin, features, and structure are biologically appropriate for that species (e.g., fur, scales, chitin, bioluminescence).
         Return the data in the specified JSON format.`
      : `Generate a completely unique and highly detailed cinematic character profile of type "${type}" with a creative concept. 
         Identify the species type clearly in the "type" field.
         If the type is NOT Human, be extremely creative with biology and anatomy.
         Return the data in the specified JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "One of: Human, Animal, Alien, Custom" },
          name: { type: Type.STRING },
          archetype: { type: Type.STRING },
          motivation: { type: Type.STRING },
          physical: {
            type: Type.OBJECT,
            properties: {
              height: { type: Type.NUMBER },
              age: { type: Type.NUMBER },
              skinTone: { type: Type.STRING, description: "Skin tone or surface texture/color" },
              features: { type: Type.STRING, description: "Unique features like scars, gills, horns" },
              speciesDetails: { type: Type.STRING }
            },
            required: ["height", "age", "skinTone", "features"]
          },
          facial: {
            type: Type.OBJECT,
            properties: {
              shape: { type: Type.STRING },
              jawline: { type: Type.STRING },
              nose: { type: Type.STRING }
            },
            required: ["shape", "jawline", "nose"]
          },
          eyesHair: {
            type: Type.OBJECT,
            properties: {
              eyeColor: { type: Type.STRING },
              hairStyle: { type: Type.STRING },
              hairColor: { type: Type.STRING }
            },
            required: ["eyeColor", "hairStyle", "hairColor"]
          },
          style: {
            type: Type.OBJECT,
            properties: {
              attire: { type: Type.STRING },
              materials: { type: Type.STRING }
            },
            required: ["attire", "materials"]
          },
          behavior: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING },
              personality: { type: Type.STRING }
            },
            required: ["role", "personality"]
          }
        },
        required: ["type", "name", "archetype", "motivation", "physical", "facial", "eyesHair", "style", "behavior"]
      }
    }
  });

  if (!response.text) throw new Error("No content generated");
  return JSON.parse(response.text.trim());
};

export const generateCharacterVisualPrompt = async (character: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following character data, generate an ultra-realistic cinematic character sheet prompt and a consistent JSON character set for image generation.
    
    Character Data:
    ${JSON.stringify(character, null, 2)}
    
    The narrative prompt MUST follow this exact structure:
    
    1. CORE IDENTITY (Age, Height, Face details, Skin/Surface details, Hair/Texture, Eyes)
    2. PERSONALITY (Archetype, Expression, Voice)
    3. STRUCTURE (Generate a multi-panel character sheet including Full Body Views, Pose Variations, and Detail Shots. If the character is a GIANT or very SMALL, specify scale reference objects in the background.)
    4. CHARACTER DATA PANEL (Clean UI style card displaying text info)
    5. STYLE & ENVIRONMENT (Setting, Lighting, Color palette, Mood)
    6. OUTFIT/ARMOR (Specific materials like weathered synthetic, rusted iron, hide, etc.)
    7. QUALITY (Resolution, focus, HDR constraints)
    8. IMPORTANT (Face/Biological consistency, NO identity drift)
    9. AVOID (List of things to avoid for maximum realism)

    Return the result as a JSON object with two fields:
    "visualPrompt": The formatted narrative string using the headers above.
    "characterJSON": A raw JSON string containing a detailed technical representation of the character set, structured exactly like this:
    {
      "character_set": {
        "character_id": "string",
        "species_alignment": "string",
        "locked_attributes": ["face", "eyes", "surface", "anatomy"],
        "variation_rules": {
          "allowed_changes": ["clothing", "pose", "lighting", "expression"],
          "restricted_changes": ["bone_structure", "eye_color", "base_biology"]
        },
        "scale_metrics": { "base_height": "string", "reference_scale": "string" },
        "scene_behavior_profile": { "movement": "string", "interaction": "string", "default_posture": "string" },
        "render_preferences": { "focus": "string", "lighting_preference": "string", "detail_priority": "string" }
      }
    }
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          visualPrompt: { type: Type.STRING },
          characterJSON: { type: Type.STRING, description: "The JSON blob as a string" }
        },
        required: ["visualPrompt", "characterJSON"]
      }
    }
  });

  if (!response.text) throw new Error("Failed to generate visual prompt");
  return JSON.parse(response.text.trim());
};
