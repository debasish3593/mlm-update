import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, createClientSchema, paymentConfirmationSchema, insertPlanSchema, updatePlanSchema } from "@shared/schema";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    role?: string;
  }
}

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Middleware to check admin role
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId || req.session.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, role } = loginSchema.parse(req.body);
      
      const user = await storage.validateUser(username, password, role);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.role = user.role;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: Get all clients
  app.get("/api/clients", requireAdmin, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      const clientsWithoutPasswords = clients.map(({ password: _, ...client }) => client);
      res.json(clientsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: Create new client with payment confirmation
  app.post("/api/clients/create-with-payment", requireAdmin, async (req, res) => {
    try {
      const paymentData = paymentConfirmationSchema.parse(req.body);
      
      if (!paymentData.paymentConfirmed) {
        return res.status(400).json({ message: "Payment confirmation required" });
      }

      const { clientData } = paymentData;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(clientData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Verify the parent user exists (should be the current admin)
      const parentUser = await storage.getUserById(clientData.parentId || req.session.userId!);
      if (!parentUser) {
        return res.status(400).json({ message: "Parent user not found" });
      }

      // Ensure parentId is properly set in client data
      const finalClientData = {
        ...clientData,
        parentId: clientData.parentId || req.session.userId!
      };

      // Create client with proper parent-child relationship
      const client = await storage.createClientWithPayment(finalClientData, req.session.userId);
      const { password: _, ...clientWithoutPassword } = client;
      
      res.status(201).json({
        ...clientWithoutPassword,
        message: "Client created successfully after payment confirmation"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to create client" 
      });
    }
  });

  // Admin: Create new client (legacy endpoint for direct creation)
  app.post("/api/clients", requireAdmin, async (req, res) => {
    try {
      const clientData = createClientSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(clientData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Ensure parentId is set to current user (admin) if not provided
      const finalClientData = {
        ...clientData,
        parentId: clientData.parentId || req.session.userId!
      };

      const client = await storage.createClient(finalClientData, req.session.userId);
      const { password: _, ...clientWithoutPassword } = client;
      res.status(201).json(clientWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create client" });
    }
  });

  // Client: Create downline client
  app.post("/api/clients/downline", requireAuth, async (req, res) => {
    try {
      if (req.session.role !== "client") {
        return res.status(403).json({ message: "Only clients can add downline members" });
      }

      const clientData = createClientSchema.parse(req.body);
      
      // Set the parent to be the current user
      clientData.parentId = req.session.userId;

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(clientData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const client = await storage.createClient(clientData, req.session.userId);
      const { password: _, ...clientWithoutPassword } = client;
      res.status(201).json(clientWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create downline client" });
    }
  });

  // Get client's downline
  app.get("/api/clients/downline", requireAuth, async (req, res) => {
    try {
      const downline = await storage.getClientsByParent(req.session.userId!);
      const downlineWithoutPasswords = downline.map(({ password: _, ...client }) => client);
      res.json(downlineWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get available positions for a parent
  app.get("/api/clients/:parentId/positions", requireAuth, async (req, res) => {
    try {
      const { parentId } = req.params;
      
      // Check if user can access this information
      if (req.session.role === "client" && req.session.userId !== parentId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const positions = await storage.getAvailablePositions(parentId);
      res.json(positions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get client statistics
  app.get("/api/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getClientStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Plans management endpoints
  // Get all plans
  app.get("/api/plans", requireAdmin, async (req, res) => {
    try {
      const plans = await storage.getAllPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get plan by ID
  app.get("/api/plans/:id", requireAdmin, async (req, res) => {
    try {
      const plan = await storage.getPlanById(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new plan
  app.post("/api/plans", requireAdmin, async (req, res) => {
    try {
      const planData = insertPlanSchema.parse(req.body);
      const plan = await storage.createPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update plan
  app.put("/api/plans/:id", requireAdmin, async (req, res) => {
    try {
      const planData = updatePlanSchema.parse(req.body);
      const plan = await storage.updatePlan(req.params.id, planData);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete plan
  app.delete("/api/plans/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deletePlan(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json({ message: "Plan deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
