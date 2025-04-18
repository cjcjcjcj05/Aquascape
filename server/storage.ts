import { 
  users, type User, type InsertUser,
  userProfiles, type UserProfile, type InsertProfile, type UpdateProfile,
  designs, type Design, type InsertDesign, type UpdateDesign
} from "@shared/schema";
import { db } from "./db";
import { eq, and, isNotNull, lt, gt } from "drizzle-orm";
import { randomBytes } from "crypto";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // User profile methods
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, profile: UpdateProfile): Promise<UserProfile | undefined>;
  
  // Password reset methods
  createResetToken(email: string): Promise<string | undefined>;
  verifyResetToken(token: string): Promise<User | undefined>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
  
  // Email verification methods
  createVerificationToken(userId: number): Promise<string>;
  verifyEmail(token: string): Promise<boolean>;
  
  // Design methods
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
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }
  
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }
  
  async createUserProfile(profile: InsertProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }
  
  async updateUserProfile(userId: number, profile: UpdateProfile): Promise<UserProfile | undefined> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({ ...profile, updatedAt: new Date().toISOString() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile || undefined;
  }
  
  async createResetToken(email: string): Promise<string | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) return undefined;
    
    const token = randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // Token expires in 1 hour
    
    await db
      .update(users)
      .set({
        resetToken: token,
        resetTokenExpiry: expiry.toISOString()
      })
      .where(eq(users.id, user.id));
    
    return token;
  }
  
  async verifyResetToken(token: string): Promise<User | undefined> {
    const now = new Date().toISOString();
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetToken, token),
          isNotNull(users.resetTokenExpiry),
          gt(users.resetTokenExpiry, now)
        )
      );
    
    return user || undefined;
  }
  
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.verifyResetToken(token);
    if (!user) return false;
    
    await db
      .update(users)
      .set({
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null
      })
      .where(eq(users.id, user.id));
    
    return true;
  }
  
  async createVerificationToken(userId: number): Promise<string> {
    const token = randomBytes(32).toString('hex');
    
    await db
      .update(users)
      .set({ verificationToken: token })
      .where(eq(users.id, userId));
    
    return token;
  }
  
  async verifyEmail(token: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token));
    
    if (!user) return false;
    
    await db
      .update(users)
      .set({
        emailVerified: true,
        verificationToken: null
      })
      .where(eq(users.id, user.id));
    
    return true;
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
