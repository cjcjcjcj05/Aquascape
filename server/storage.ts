import { 
  users, type User, type InsertUser,
  designs, type Design, type InsertDesign, type UpdateDesign
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getDesigns(userId?: number): Promise<Design[]>;
  getDesign(id: number): Promise<Design | undefined>;
  createDesign(design: InsertDesign): Promise<Design>;
  updateDesign(id: number, design: UpdateDesign): Promise<Design | undefined>;
  deleteDesign(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private designs: Map<number, Design>;
  private userIdCounter: number;
  private designIdCounter: number;

  constructor() {
    this.users = new Map();
    this.designs = new Map();
    this.userIdCounter = 1;
    this.designIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDesigns(userId?: number): Promise<Design[]> {
    if (userId) {
      return Array.from(this.designs.values()).filter(design => design.userId === userId);
    }
    return Array.from(this.designs.values());
  }

  async getDesign(id: number): Promise<Design | undefined> {
    return this.designs.get(id);
  }

  async createDesign(insertDesign: InsertDesign): Promise<Design> {
    const id = this.designIdCounter++;
    const design: Design = { ...insertDesign, id };
    this.designs.set(id, design);
    return design;
  }

  async updateDesign(id: number, updateDesign: UpdateDesign): Promise<Design | undefined> {
    const existingDesign = this.designs.get(id);
    if (!existingDesign) {
      return undefined;
    }
    
    const updatedDesign: Design = { 
      ...existingDesign, 
      ...updateDesign,
    };
    
    this.designs.set(id, updatedDesign);
    return updatedDesign;
  }

  async deleteDesign(id: number): Promise<boolean> {
    return this.designs.delete(id);
  }
}

export const storage = new MemStorage();
