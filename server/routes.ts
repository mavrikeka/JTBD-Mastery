import type { Express } from "express";
import { createServer, type Server } from "http";
import { critiqueJTBD, getSuggestions, polishJTBD } from "./ai-service";
import { critiqueRequestSchema, suggestionRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Critique endpoint - analyze JTBD with Claude Sonnet 4
  app.post("/api/critique", async (req, res) => {
    try {
      console.log('📥 Critique request received:', req.body);
      const request = critiqueRequestSchema.parse(req.body);
      console.log('✅ Request validated:', request);
      const critique = await critiqueJTBD(request);
      console.log('✅ Critique generated:', critique);
      res.json(critique);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request", details: error.errors });
      } else {
        console.error('Critique error:', error);
        res.status(500).json({ 
          error: error instanceof Error ? error.message : "Failed to analyze JTBD" 
        });
      }
    }
  });

  // Suggestions endpoint - get AI suggestions with GPT-4o
  app.post("/api/suggestions", async (req, res) => {
    try {
      const request = suggestionRequestSchema.parse(req.body);
      const suggestions = await getSuggestions(request);
      res.json(suggestions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request", details: error.errors });
      } else {
        console.error('Suggestions error:', error);
        res.status(500).json({
          error: error instanceof Error ? error.message : "Failed to generate suggestions"
        });
      }
    }
  });

  // Polish endpoint - refine JTBD statement into cohesive sentence
  app.post("/api/polish-jtbd", async (req, res) => {
    try {
      const { rawStatement } = req.body;
      if (!rawStatement || typeof rawStatement !== 'string') {
        return res.status(400).json({ error: "rawStatement is required" });
      }
      const polishedStatement = await polishJTBD(rawStatement);
      res.json({ polishedStatement });
    } catch (error) {
      console.error('Polish error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to polish JTBD"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
