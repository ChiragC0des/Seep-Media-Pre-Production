import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateEnvironment = async (prompt?: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt 
      ? `Generate a cinematic environment profile based on this concept: ${prompt}. 
         Specify the category (Interior, Exterior, Urban, Nature, Sci-Fi, Fantasy) clearly.
         Return the data in the specified JSON format.`
      : `Generate a completely unique and visually stunning cinematic environment concept. 
         Return the data in the specified JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          category: { type: Type.STRING },
          scale: { type: Type.STRING, description: "E.g. Miniature/Diorama, 1:1 Human, Macro, Galactic" },
          tone: { type: Type.STRING },
          timeOfDay: { type: Type.STRING },
          mood: { type: Type.STRING },
          gravity: { type: Type.STRING },
          behavior: { type: Type.STRING },
          motionEffects: { type: Type.STRING },
          lighting: { type: Type.STRING },
          atmospheres: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["description", "category", "scale", "tone", "timeOfDay", "mood", "gravity", "behavior", "motionEffects", "lighting", "atmospheres"]
      }
    }
  });

  if (!response.text) throw new Error("No content generated");
  return JSON.parse(response.text.trim());
};

export const generateEnvironmentVisualPrompt = async (env: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following environment data, generate an ultra-realistic cinematic world-building prompt and a "Director's Multi-Shot Set" for high-fidelity image generation.
    
    Environment Data:
    ${JSON.stringify(env, null, 2)}
    
    The narrative output MUST be a single cohesive unit structured exactly as follows:

    GENERAL VISION: (Overall aesthetic, era, and core vision)
    SCALE REALISM: (Define physical scale perception, depth of field logic, and micro-imperfections)
    ARCHITECTURE: (Structural details, materials, and spatial layout)
    SHOT A — ESTABLISHING (LOW ANGLE): (Establishing shot, ground perspective, horizon, and atmospheric depth)
    SHOT B — LANDMARK: (Primary architectural or natural focus point, mid-ground action, specific material details)
    SHOT C — MACRO DETAIL: (Texture science: weathering, organic growth, micro-scratches, or material grain)
    SHOT D — AERIAL GRID: (Top-down organization, layout, and floor plan logic)
    MATERIAL SYSTEM: (Define physical properties of surfaces like wood, metal, glass, or water)
    LIGHTING: (Ray tracing details, temperature, contrast, and light sources)
    ATMOSPHERE & VFX: (Volumetric effects, particles, mist, and environmental movement)
    CAMERA: (Lens equivalent, depth of field, framing style, and focus falloff)
    COLOR PALETTE: (Primary, secondary, and accent colors with mood context)
    QUALITY: (Resolution, fidelity, and rendering style)
    IMPORTANT: (Consistency rules and physical accuracy notes)
    AVOID: (Specific artifacts or styles to exclude)

    Return the result as a JSON object with two fields:
    "visualPrompt": The formatted narrative string using the HEADERS above.
    "worldJSON": A raw JSON string containing the technical configuration exactly in this schema:
    {
      "render_profile": "string",
      "lighting": {
        "temperature": "string",
        "type": "string",
        "contrast": "string",
        "shadow_depth": "string"
      },
      "exposure": {
        "ev": "string",
        "highlight_rolloff": "string",
        "hdr": boolean
      },
      "materials": {
        "wetness": "string",
        "reflectivity": "string",
        "emissive_intensity": "string",
        "surface_variation": "string"
      },
      "volumetrics": {
        "density": "string",
        "type": "string",
        "light_scatter": "string",
        "height_variation": boolean
      },
      "post_fx": {
        "bloom": "string",
        "chromatic_aberration": "string",
        "film_grain": "string",
        "motion_trails": "string"
      },
      "physics": {
        "gravity": [x, y, z],
        "rain_particles": "string",
        "surface_interaction": "string"
      }
    }
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          visualPrompt: { type: Type.STRING },
          worldJSON: { type: Type.STRING, description: "The JSON metadata as a string" }
        },
        required: ["visualPrompt", "worldJSON"]
      }
    }
  });

  if (!response.text) throw new Error("Failed to generate visual prompt");
  return JSON.parse(response.text.trim());
};
