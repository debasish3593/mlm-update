import { type User, type InsertUser, type CreateClientRequest, type Plan, type InsertPlan, type UpdatePlan } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createClient(client: CreateClientRequest, createdById?: string): Promise<User>;
  createClientWithPayment(client: CreateClientRequest, createdById?: string): Promise<User>;
  
  // Authentication
  validateUser(username: string, password: string, role: string): Promise<User | null>;
  
  // Hierarchical operations
  getAllClients(): Promise<User[]>;
  getClientsByParent(parentId: string): Promise<User[]>;
  getClientDownline(clientId: string): Promise<User[]>;
  getAvailablePositions(parentId: string): Promise<("left" | "right")[]>;
  
  // Plans management
  getAllPlans(): Promise<Plan[]>;
  getPlanById(id: string): Promise<Plan | null>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: string, plan: UpdatePlan): Promise<Plan | null>;
  deletePlan(id: string): Promise<boolean>;
  
  // Statistics
  getClientStats(): Promise<{
    total: number;
    silver: number;
    gold: number;
    diamond: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private plans: Map<string, Plan>;

  constructor() {
    this.users = new Map();
    this.plans = new Map();
    this.initializeAdminUser();
    this.initializePlans();
  }

  private async initializeAdminUser() {
    const adminExists = Array.from(this.users.values()).some(user => user.role === "admin");
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin: User = {
        id: randomUUID(),
        name: "System Admin",
        username: "admin",
        password: hashedPassword,
        email: "admin@nappinghand.com",
        mobile: null,
        role: "admin",
        package: null,
        parentId: null,
        position: null,
        createdAt: new Date(),
      };
      this.users.set(admin.id, admin);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = randomUUID();
    const user: User = { 
      id,
      name: null,
      email: null,
      mobile: null,
      username: insertUser.username,
      password: hashedPassword,
      role: insertUser.role || "client",
      package: insertUser.package || null,
      parentId: insertUser.parentId || null,
      position: insertUser.position || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async createClient(client: CreateClientRequest, createdById?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(client.password, 10);
    const id = randomUUID();
    
    // Ensure parentId is set (fallback to createdById if not provided)
    const parentId = client.parentId || createdById;
    
    // If parentId is provided, find available position
    let position: string | null = null;
    if (parentId) {
      const availablePositions = await this.getAvailablePositions(parentId);
      if (availablePositions.length === 0) {
        throw new Error("Parent already has 2 children");
      }
      position = client.position || availablePositions[0];
    }

    const user: User = {
      id,
      name: client.name || null,
      username: client.username,
      password: hashedPassword,
      email: client.email || null,
      mobile: client.mobile || null,
      role: "client",
      package: client.package,
      parentId: parentId || null,
      position: position,
      createdAt: new Date(),
    };
    
    this.users.set(id, user);
    return user;
  }

  // Enhanced client creation with payment confirmation and binary tree logic
  async createClientWithPayment(client: CreateClientRequest, adminId?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(client.password, 10);
    const id = randomUUID();
    
    // Binary tree insertion logic
    let parentId = client.parentId || adminId;
    let position: string | null = null;
    
    if (parentId) {
      // Find available position under the specified parent
      const availablePositions = await this.getAvailablePositions(parentId);
      
      if (availablePositions.length === 0) {
        // Parent has no available positions, find the first available spot in the tree
        const allClients = await this.getAllClients();
        
        for (const potentialParent of allClients) {
          const availablePos = await this.getAvailablePositions(potentialParent.id);
          if (availablePos.length > 0) {
            parentId = potentialParent.id;
            position = availablePos[0]; // Take the first available position
            break;
          }
        }
        
        // If still no position found, make them a direct client under admin
        if (!position && adminId) {
          parentId = adminId;
          const adminPositions = await this.getAvailablePositions(adminId);
          position = adminPositions.length > 0 ? adminPositions[0] : null;
        }
      } else {
        // Assign to the first available position
        position = availablePositions[0];
      }
    }

    const user: User = {
      id,
      name: client.name || null,
      username: client.username,
      password: hashedPassword,
      email: client.email || null,
      mobile: client.mobile || null,
      role: "client",
      package: client.package,
      parentId: parentId || null,
      position: position || null,
      createdAt: new Date(),
    };
    
    this.users.set(id, user);
    return user;
  }

  async validateUser(username: string, password: string, role: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user || user.role !== role) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async getAllClients(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === "client");
  }

  async getClientsByParent(parentId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.parentId === parentId);
  }

  async getClientDownline(clientId: string): Promise<User[]> {
    const downline: User[] = [];
    const directChildren = await this.getClientsByParent(clientId);
    
    for (const child of directChildren) {
      downline.push(child);
      const childDownline = await this.getClientDownline(child.id);
      downline.push(...childDownline);
    }
    
    return downline;
  }

  async getAvailablePositions(parentId: string): Promise<("left" | "right")[]> {
    const children = await this.getClientsByParent(parentId);
    const occupiedPositions = children.map(child => child.position).filter(Boolean);
    
    const allPositions: ("left" | "right")[] = ["left", "right"];
    return allPositions.filter(pos => !occupiedPositions.includes(pos));
  }

  async getClientStats(): Promise<{ total: number; silver: number; gold: number; diamond: number; }> {
    const clients = await this.getAllClients();
    return {
      total: clients.length,
      silver: clients.filter(c => c.package === "Silver").length,
      gold: clients.filter(c => c.package === "Gold").length,
      diamond: clients.filter(c => c.package === "Diamond").length,
    };
  }

  private async initializePlans() {
    const defaultPlans: Plan[] = [
      {
        id: randomUUID(),
        name: "Silver",
        price: "₹510.00 INR",
        businessVolume: "100",
        referralCommission: "₹100.00 INR",
        treeCommission: "₹200.00 INR",
        status: "active",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Gold",
        price: "₹1010.00 INR",
        businessVolume: "200",
        referralCommission: "₹200.00 INR",
        treeCommission: "₹400.00 INR",
        status: "active",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Diamond",
        price: "₹1510.00 INR",
        businessVolume: "300",
        referralCommission: "₹300.00 INR",
        treeCommission: "₹600.00 INR",
        status: "active",
        createdAt: new Date(),
      }
    ];

    for (const plan of defaultPlans) {
      this.plans.set(plan.id, plan);
    }
  }

  async getAllPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }

  async getPlanById(id: string): Promise<Plan | null> {
    return this.plans.get(id) || null;
  }

  async createPlan(planData: InsertPlan): Promise<Plan> {
    const id = randomUUID();
    const plan: Plan = {
      id,
      name: planData.name,
      price: planData.price,
      businessVolume: planData.businessVolume,
      referralCommission: planData.referralCommission,
      treeCommission: planData.treeCommission,
      status: planData.status || "active",
      createdAt: new Date(),
    };
    this.plans.set(id, plan);
    return plan;
  }

  async updatePlan(id: string, planData: UpdatePlan): Promise<Plan | null> {
    const existingPlan = this.plans.get(id);
    if (!existingPlan) return null;

    const updatedPlan: Plan = {
      ...existingPlan,
      ...planData,
    };
    this.plans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deletePlan(id: string): Promise<boolean> {
    return this.plans.delete(id);
  }
}

export const storage = new MemStorage();
