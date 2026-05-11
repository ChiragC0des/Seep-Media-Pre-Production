import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const adminApp = admin.initializeApp({
  projectId: firebaseConfig.projectId,
});
const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId || "(default)");

async function startServer() {
  console.log("Starting server process...");
  const app = express();
  const PORT = 3000;

  console.log("Initializing Express app...");
  // Middleware for parsing JSON
  app.use(express.json());

  console.log("Setting up API routes...");
  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Characters CRUD
  app.get("/api/characters", async (req, res) => {
    const { userId } = req.query;
    console.log(`GET /api/characters - User: ${userId}`);
    if (!userId) return res.status(400).json({ error: "userId is required" });
    try {
      const snapshot = await db.collection("characters").where("createdBy", "==", userId).get();
      const characters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(characters);
    } catch (error: any) {
      console.error("Error fetching characters:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/characters", async (req, res) => {
    console.log("POST /api/characters - Body:", req.body);
    try {
      const characterData = {
        ...req.body,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const docRef = await db.collection("characters").add(characterData);
      res.json({ id: docRef.id, ...characterData });
    } catch (error: any) {
      console.error("Error creating character:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Workflows CRUD
  app.get("/api/workflows", async (req, res) => {
    const { userId } = req.query;
    console.log(`GET /api/workflows - User: ${userId}`);
    if (!userId) return res.status(400).json({ error: "userId is required" });
    try {
      const snapshot = await db.collection("workflows").where("createdBy", "==", userId).get();
      const workflows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(workflows);
    } catch (error: any) {
      console.error("Error fetching workflows:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workflows", async (req, res) => {
    console.log("POST /api/workflows - Body:", req.body);
    try {
      const workflowData = {
        ...req.body,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const docRef = await db.collection("workflows").add(workflowData);
      res.json({ id: docRef.id, ...workflowData });
    } catch (error: any) {
      console.error("Error creating workflow:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Scenes CRUD (per workflow)
  app.get("/api/workflows/:workflowId/scenes", async (req, res) => {
    const { workflowId } = req.params;
    console.log(`GET /api/workflows/${workflowId}/scenes`);
    try {
      const snapshot = await db.collection("workflows").doc(workflowId).collection("scenes").orderBy("number").get();
      const scenes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(scenes);
    } catch (error: any) {
      console.error("Error fetching scenes:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI Pipeline Mock Integration
  app.post("/api/workflows/:workflowId/generate", async (req, res) => {
    const { workflowId } = req.params;
    console.log(`POST /api/workflows/${workflowId}/generate`);
    try {
      // In a real app, this would call Gemini to generate Higgsfield-ready prompts
      // For now, we simulate the structure mentioned in the design
      res.json({
        message: "Pipeline processing started",
        workflowId,
        status: "processing"
      });
    } catch (error: any) {
      console.error("Error in generate pipeline:", error);
      res.status(500).json({ error: error.message });
    }
  });

  console.log(`Environment: ${process.env.NODE_ENV}`);
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware ready.");
  } else {
    console.log("Production mode: serving static files...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
