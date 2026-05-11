import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export const getDirectorResponse = async (
  currentScript: string,
  projectName: string,
  chatHistory: ChatMessage[],
  userPrompt: string
) => {
  const contents = [
    ...chatHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    })),
    {
      role: 'user' as const,
      parts: [{ text: userPrompt }]
    }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction: `You are the AI Scene Director for a cinematic production called "${projectName}".
Your goal is to help the user write their script. 
- If the user is stuck, suggest creative story paths, dialogue, or world-building details.
- If the user asks for a scene, write a professional screenplay segment (INT/EXT, character names, dialogue, action).
- Always be encouraging and cinematic.
- You have access to their current script draft: "${currentScript}". Use this as context.
- Your response should be a friendly chat message, but if you include a script suggestion, wrap it in [SCRIPT_SUGGESTION] ... [/SCRIPT_SUGGESTION] tags so the system can offer to apply it.`,
    }
  });

  if (!response.text) throw new Error("No content generated");
  return response.text;
};

export const finalizeScriptIntoMainDraft = async (
  currentScript: string,
  chatHistory: ChatMessage[]
) => {
  const contents = [
    {
      role: 'user' as const,
      parts: [{ 
        text: `Based on the conversation below, update the original script. 
        Incorporate all discussed changes, dialogue improvements, and scene additions intelligently. 
        Maintain the screenplay format. Return ONLY the final revised script.
        
        Original Script:
        ${currentScript}
        
        Conversation History:
        ${chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}
        ` 
      }]
    }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
  });

  if (!response.text) throw new Error("Failed to finalize script");
  return response.text;
};

export const getDirectorVoice = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Zephyr' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};
