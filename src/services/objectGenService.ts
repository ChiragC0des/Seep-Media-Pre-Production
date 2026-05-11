import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateObject = async (prompt?: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt 
      ? `Generate a cinematic prop/object profile based on this concept: ${prompt}. Specify the category (Weapon, Tech, Artifact, Tool, Vehicle, Decor) clearly. Return the data in the specified JSON format.`
      : `Generate a completely unique and visually stunning cinematic prop or object concept. Return the data in the specified JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING },
          rarity: { type: Type.STRING, enum: ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Exotic"] },
          material: { type: Type.STRING },
          origin: { type: Type.STRING },
          dimensions: { type: Type.STRING },
          weight: { type: Type.STRING },
          functionality: { type: Type.STRING },
          state: { type: Type.STRING, description: "Current condition: e.g. Pristine, Weathered, Ancient, Damaged" }
        },
        required: ["name", "description", "category", "rarity", "material", "origin", "dimensions", "weight", "functionality", "state"]
      }
    }
  });

  if (!response.text) throw new Error("No content generated");
  return JSON.parse(response.text.trim());
};

export const generateObjectVisualPrompt = async (obj: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following object data, generate an ultra-realistic cinematic prop-building prompt and a "Director's Multi-Shot Set" for high-fidelity image generation.
    
    Object Data:
    ${JSON.stringify(obj, null, 2)}
    
    The narrative output MUST be a single cohesive unit structured exactly as follows:

    GENERAL VISION: (Overall aesthetic, era, and core vision)
    SCALE REALISM: (Define physical scale perception, macro lens logic, and micro-imperfections)
    MATERIAL SCIENCE: (Detailed breakdown of surfaces: wood grain, metal oxidation, glass refraction, etched symbols)
    SHOT A — ESTABLISHING: (The object in its natural environment, lighting context, and environmental storytelling)
    SHOT B — FUNCTIONAL VIEW: (The object in use or shown from its primary interactive angle)
    SHOT C — MACRO DETAIL: (Extreme close-up of a specific component: cooling vents, serial numbers, textures, biological growth)
    SHOT D — ORTHOGRAPHIC: (Clean studio-lighting view showing scale and proportions)
    LIGHTING: (Ray tracing details, subsurface scattering, emissive glows, and shadow depth)
    ATMOSPHERE & VFX: (Particles, heat haze, energy fields, or dust accumulation)
    CAMERA: (Lens equivalent, depth of field, framing style, and focus falloff)
    COLOR PALETTE: (Primary, secondary, and accent colors with material context)
    QUALITY: (Resolution, fidelity, and rendering style)
    IMPORTANT: (Consistency rules and physical accuracy notes)
    AVOID: (Specific artifacts or styles to exclude)

    Return the result as a JSON object with two fields:
    "visualPrompt": The formatted narrative string using the HEADERS above.
    "worldJSON": A raw JSON string containing the technical configuration exactly in this schema:
    {
      "render_profile": "string",
      "material_properties": {
        "roughness": "0.0–1.0",
        "metallicity": "0.0–1.0",
        "subsurface_scattering": "enabled/disabled",
        "anisotropy": "string"
      },
      "lighting": {
        "key_light_temp": "string",
        "rim_light_intensity": "string",
        "emissive_val": "string"
      },
      "physics": {
        "mass_sim": "string",
        "interaction_nodes": ["string"],
        "center_of_gravity": [x, y, z]
      },
      "post_fx": {
        "depth_of_field": "macro",
        "lens_flares": "string",
        "chromatic_aberration": "string"
      }
    }
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          visualPrompt: { type: Type.STRING },
          worldJSON: { type: Type.STRING }
        },
        required: ["visualPrompt", "worldJSON"]
      }
    }
  });

  if (!response.text) throw new Error("Failed to generate visual prompt");
  return JSON.parse(response.text.trim());
};
