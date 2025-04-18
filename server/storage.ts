import { 
  users, type User, type InsertUser,
  designs, type Design, type InsertDesign, type UpdateDesign
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getDesigns(userId?: number): Promise<Design[]>;
  getDesign(id: number): Promise<Design | undefined>;
  createDesign(design: InsertDesign): Promise<Design>;
  updateDesign(id: number, design: UpdateDesign): Promise<Design | undefined>;
  deleteDesign(id: number): Promise<boolean>;
  
  sessionStore: any; // We'll use any type since SessionStore is not exported
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Create a session store that will store sessions in PostgreSQL
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getDesigns(userId?: number): Promise<Design[]> {
    if (userId) {
      return db.select().from(designs).where(eq(designs.userId, userId));
    }
    return db.select().from(designs);
  }

  async getDesign(id: number): Promise<Design | undefined> {
    const [design] = await db.select().from(designs).where(eq(designs.id, id));
    return design || undefined;
  }

  async createDesign(insertDesign: InsertDesign): Promise<Design> {
    const [design] = await db
      .insert(designs)
      .values(insertDesign)
      .returning();
    return design;
  }

  async updateDesign(id: number, updateDesign: UpdateDesign): Promise<Design | undefined> {
    const [design] = await db
      .update(designs)
      .set(updateDesign)
      .where(eq(designs.id, id))
      .returning();
    return design || undefined;
  }

  async deleteDesign(id: number): Promise<boolean> {
    const result = await db
      .delete(designs)
      .where(eq(designs.id, id));
    // Check if any rows were affected
    return result !== undefined && Object.keys(result).length > 0;
  }
}

export const storage = new DatabaseStorage();
