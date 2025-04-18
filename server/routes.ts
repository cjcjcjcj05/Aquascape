import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDesignSchema, updateDesignSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { z } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Designs API
  app.get('/api/designs', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get designs for the current logged-in user
      const userId = req.user?.id;
      const designs = await storage.getDesigns(userId);
      res.json(designs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch designs' });
    }
  });

  app.get('/api/designs/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const design = await storage.getDesign(id);
      
      // Check if design exists and belongs to current user
      if (!design || design.userId !== req.user?.id) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      res.json(design);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch design' });
    }
  });

  app.post('/api/designs', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Add the current user's ID to the design
      const designData = {
        ...req.body,
        userId: req.user?.id
      };
      
      const validationResult = insertDesignSchema.safeParse(designData);
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid design data', errors: validationResult.error.errors });
      }

      const design = await storage.createDesign(validationResult.data);
      res.status(201).json(design);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create design' });
    }
  });

  app.put('/api/designs/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const design = await storage.getDesign(id);
      
      // Check if design exists and belongs to current user
      if (!design || design.userId !== req.user?.id) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      const validationResult = updateDesignSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid design data', errors: validationResult.error.errors });
      }

      const updatedDesign = await storage.updateDesign(id, validationResult.data);
      res.json(updatedDesign);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update design' });
    }
  });

  app.delete('/api/designs/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const design = await storage.getDesign(id);
      
      // Check if design exists and belongs to current user
      if (!design || design.userId !== req.user?.id) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      const success = await storage.deleteDesign(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete design' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
