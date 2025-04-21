import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDesignSchema, updateDesignSchema,
  updateProfileSchema, forgotPasswordSchema, resetPasswordSchema
} from "@shared/schema";
import { setupAuth, hashPassword } from "./auth";
import { z } from "zod";
import { 
  initializeEmailService, 
  sendPasswordResetEmail, 
  sendVerificationEmail
} from "./emailService";
import { generateImage, generateDescription } from "./ai";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize email service
  await initializeEmailService();
  
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

  // User Profile API
  app.get('/api/profile', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      let profile = await storage.getUserProfile(userId);
      
      // If profile doesn't exist, create a new one
      if (!profile) {
        profile = await storage.createUserProfile({
          userId,
          displayName: req.user?.username || '',
        });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const validationResult = updateProfileSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid profile data', 
          errors: validationResult.error.errors 
        });
      }
      
      let profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        // Create a new profile if it doesn't exist
        profile = await storage.createUserProfile({
          userId,
          ...validationResult.data,
        });
      } else {
        // Update the existing profile
        profile = await storage.updateUserProfile(userId, validationResult.data);
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Password Reset API
  app.post('/api/forgot-password', async (req: Request, res: Response) => {
    try {
      const validationResult = forgotPasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid data', 
          errors: validationResult.error.errors 
        });
      }
      
      const { email } = validationResult.data;
      const token = await storage.createResetToken(email);
      
      if (!token) {
        // Don't reveal if email exists or not for security
        return res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });
      }
      
      // Get the user to pass their username to the email template
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });
      }
      
      // Send password reset email
      const emailPreviewUrl = await sendPasswordResetEmail(email, token, user.username);
      
      res.json({ 
        message: 'A password reset link has been sent to your email.',
        // For development only - in production we wouldn't return this
        emailPreviewUrl
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'Failed to process password reset request' });
    }
  });

  app.post('/api/reset-password', async (req: Request, res: Response) => {
    try {
      const validationResult = resetPasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid data', 
          errors: validationResult.error.errors 
        });
      }
      
      const { token, password } = validationResult.data;
      const hashedPassword = await hashPassword(password);
      const success = await storage.resetPassword(token, hashedPassword);
      
      if (!success) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }
      
      res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to reset password' });
    }
  });

  // Email verification API
  app.post('/api/verify-email', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Create verification token
      const token = await storage.createVerificationToken(userId);
      
      // Send verification email if user has an email
      if (req.user?.email) {
        const emailPreviewUrl = await sendVerificationEmail(
          req.user.email, 
          token, 
          req.user.username
        );
        
        return res.json({ 
          message: 'A verification email has been sent to your address. Please check your inbox.',
          // For development only
          emailPreviewUrl
        });
      }
      
      // If user doesn't have an email, return the token directly
      res.json({ 
        message: 'Verification token created',
        // For development/testing only
        token
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Failed to create verification token' });
    }
  });

  app.get('/api/verify-email/:token', async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const success = await storage.verifyEmail(token);
      
      if (!success) {
        return res.status(400).json({ message: 'Invalid verification token' });
      }
      
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to verify email' });
    }
  });

  // Asset generation API
  app.post('/api/generate-asset', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Define validation schema for asset generation
      const generateAssetSchema = z.object({
        name: z.string().min(2).max(50),
        category: z.enum(["plants", "hardscape", "fish", "substrate"]),
        description: z.string().min(10).max(500),
        prompt: z.string().min(10).max(1000),
        style: z.enum(["realistic", "artistic", "simple"]),
        backgroundColor: z.enum(["transparent", "white", "gradient"]),
      });
      
      // Validate the request body
      const validationResult = generateAssetSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid asset generation data', 
          errors: validationResult.error.errors 
        });
      }
      
      const { name, category, description, prompt, style, backgroundColor } = validationResult.data;
      
      // Generate image with OpenAI
      const imageUrl = await generateImage({
        prompt,
        style,
        backgroundColor
      });
      
      // Generate enhanced description if needed
      let finalDescription = description;
      if (description.length < 100) {
        try {
          finalDescription = await generateDescription(name, category, description);
        } catch (error) {
          console.error("Error generating enhanced description:", error);
          // Continue with the original description if generation fails
        }
      }
      
      // Return the generated asset info
      res.json({
        name,
        category,
        description: finalDescription,
        imageUrl,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Asset generation error:", error);
      res.status(500).json({ message: 'Failed to generate asset' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
