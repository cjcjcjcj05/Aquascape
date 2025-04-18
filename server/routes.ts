import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDesignSchema, updateDesignSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Designs API
  app.get('/api/designs', async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const designs = await storage.getDesigns(userId);
      res.json(designs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch designs' });
    }
  });

  app.get('/api/designs/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const design = await storage.getDesign(id);
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      res.json(design);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch design' });
    }
  });

  app.post('/api/designs', async (req: Request, res: Response) => {
    try {
      const validationResult = insertDesignSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid design data', errors: validationResult.error.errors });
      }

      const design = await storage.createDesign(validationResult.data);
      res.status(201).json(design);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create design' });
    }
  });

  app.put('/api/designs/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validationResult = updateDesignSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid design data', errors: validationResult.error.errors });
      }

      const updatedDesign = await storage.updateDesign(id, validationResult.data);
      if (!updatedDesign) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      res.json(updatedDesign);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update design' });
    }
  });

  app.delete('/api/designs/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDesign(id);
      if (!success) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete design' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
