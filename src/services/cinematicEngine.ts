import { collection, doc, getDocs, setDoc, query, where, orderBy, limit, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { GoogleGenAI } from '@google/genai';

// Types for our Memory System
export interface Character {
  id?: string;
  name: string;
  projectId: string;
  userId: string;
  archetype?: string;
  age?: string;
  species?: string;
  traits?: string[];
  personality?: string;
  visualPrompt?: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

export interface Environment {
  id?: string;
  name: string;
  projectId: string;
  userId: string;
  description?: string;
  mood?: string;
  lighting?: string;
  visualPrompt?: string;
  [key: string]: any;
}

export interface CinematicObject {
  id?: string;
  name: string;
  projectId: string;
  userId: string;
  category: string;
  owner?: string;
  functionality?: string;
  visualPrompt?: string;
  [key: string]: any;
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  userId: string;
  genre?: string;
  tone?: string;
  createdAt: any;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const cinematicEngine = {
  // --- PROJECT MANAGEMENT ---
  async getProjects() {
    if (!auth.currentUser) return [];
    const path = 'projects';
    try {
      const q = query(collection(db, path), where('userId', '==', auth.currentUser.uid), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async createProject(name: string, description: string) {
    if (!auth.currentUser) throw new Error('Not authenticated');
    const path = 'projects';
    try {
      const docRef = await addDoc(collection(db, path), {
        name,
        description,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // --- MEMORY RETRIEVAL ---
  async getProjectMemory(projectId: string) {
    if (!auth.currentUser) return null;
    const collections = ['characters', 'environments', 'objects', 'storyBeats', 'relationships', 'cinematicStyles'];
    const memory: any = {};

    for (const col of collections) {
      const path = `projects/${projectId}/${col}`;
      try {
        const q = query(collection(db, path), where('userId', '==', auth.currentUser.uid));
        const snapshot = await getDocs(q);
        memory[col] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }
    return memory;
  },

  // --- ENTITY MANAGEMENT ---
  async saveCharacter(character: any) {
    const path = `projects/${character.projectId}/characters`;
    try {
      const docRef = await addDoc(collection(db, path), {
        ...character,
        userId: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async saveEnvironment(env: any) {
     const path = `projects/${env.projectId}/environments`;
     try {
       const docRef = await addDoc(collection(db, path), {
         ...env,
         userId: auth.currentUser?.uid,
         createdAt: serverTimestamp()
       });
       return docRef.id;
     } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, path);
     }
  },

  // --- NEXUS BRAIN ---
  async generateNexusResponse(projectId: string, prompt: string, history: any[]) {
    const memory = await this.getProjectMemory(projectId);

    // Construct the System Instruct / Context
    const systemInstruction = `
You are SEEP STORY ENGINE v3 — an elite cinematic screenwriter, narrative architect, and emotional continuity AI.
Current Cinematic Universe Memory (Real-time Context):
${JSON.stringify(memory, null, 2)}

Your purpose is to create emotionally layered, visually cinematic, and psychologically believable stories optimized for production.

═══════════════════════════════════════
CORE STORY PHILOSOPHY
═══════════════════════════════════════
- STORIES ARE TRANSFORMATIONS: Every scene must change emotional energy, deepen psychology, or reveal hidden truth.
- SUBTEXT FIRST: Characters rarely say exactly what they feel. Dialogue must be restrained and psychologically motivated.
- SILENCE IS POWERFUL: Allow pauses, eye movement, and breathing. A trembling hand carries more weight than an argument.
- THE WORLD REMEMBERS: Continuity is mandatory. Track injuries, weather, fatigue, and relationship changes across scenes.
- OBSERVATIONAL CINEMA: Show, don't tell. Discovery emotion through visual behavior (e.g., eating beside an untouched second plate).

═══════════════════════════════════════
CHARACTER PSYCHOLOGY ENGINE
═══════════════════════════════════════
For every major character, you must track and influence:
- WANT: Conscious pursuit.
- NEED: Emotional requirement.
- FEAR: Avoidance at all costs.
- WOUND: Shaping trauma.
- MASK: Public presentation vs. TRUTH (Underneath).
- SECRET: Hidden from others.
- COPING MECHANISM: How they handle stress.

═══════════════════════════════════════
RELATIONSHIP EVOLUTION SYSTEM
═══════════════════════════════════════
Track scene-by-scene: TRUST (0-10), INTIMACY (0-10), TENSION (0-10), DEPENDENCY (0-10), UNSPOKEN FEELING, and POWER DYNAMIC.

═══════════════════════════════════════
WRITER’S ROOM MODE (CORE BEHAVIOR)
═══════════════════════════════════════
- COLLABORATIVE DEVELOPMENT: NEVER rush. Suggest multiple paths/openings and ask the user which direction feels strongest.
- DIRECTOR’S TABLE: After scenes, discuss what worked, future payoffs, and pacing.
- NOVELISTIC FLOW: Prioritize immersion and anticipation. Let moments breathe.

═══════════════════════════════════════
SCENE STRUCTURE (MANDATORY OUTPUT)
═══════════════════════════════════════
For every scene, output using this exact structure:

SCENE [NUMBER] — [TITLE]

[DURATION]: (e.g., 15s)
[NARRATIVE PURPOSE]: Why this scene exists.
[EMOTIONAL PURPOSE]: Relationship or internal shift.
[TENSION/INTIMACY LEVEL]: (0-10)

[ENVIRONMENT]: Living world textures and atmosphere.
[CHARACTER STATES]: Emotional + behavioral condition entering.
[ACTION FLOW]: Step-by-step visual progression and micro-gestures.
[DIALOGUE]: Subtext-driven human speech.
[VISUAL STORYTELLING]: Camera details, symbolism, environment interaction.
[EMOTIONAL SUBTEXT]: The unsaid weight.
[CONTINUITY MEMORY]: What future scenes must remember.
[TRANSITION]: How emotional energy flows into the next scene.

═══════════════════════════════════════
FINAL GOAL
═══════════════════════════════════════
Every scene must feel intentional, lived-in, and emotionally earned.
Because legendary cinema is remembered for how it made people FEEL.
    `;

    const contents = [
      ...history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: {
        systemInstruction
      }
    });

    if (!result.text) throw new Error("No response from Nexus");
    return result.text;
  }
};
