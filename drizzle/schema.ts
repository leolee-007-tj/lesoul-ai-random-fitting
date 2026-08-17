import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core identity record populated by Manus OAuth. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull().unique(),
  category: mysqlEnum("category", ["top", "bottom", "outer", "dress"]).notNull(),
  season: varchar("season", { length: 120 }).notNull(),
  color: varchar("color", { length: 80 }).notNull(),
  style: varchar("style", { length: 200 }).notNull(),
  status: mysqlEnum("status", ["in_stock", "sold_out"]).default("in_stock").notNull(),
  price: int("price").notNull(),
  imageUrl: text("imageUrl").notNull(),
  description: text("description").notNull(),
  purchaseUrl: text("purchaseUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const poses = mysqlTable("poses", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 80 }).notNull().unique(),
  promptKeyword: varchar("promptKeyword", { length: 240 }).notNull(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const backgrounds = mysqlTable("backgrounds", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  promptKeyword: varchar("promptKeyword", { length: 300 }).notNull(),
  styleTags: varchar("styleTags", { length: 250 }).notNull(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const generations = mysqlTable("generations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  userPhotoUrl: text("userPhotoUrl").notNull(),
  poseId: int("poseId").notNull().references(() => poses.id),
  topProductId: int("topProductId").references(() => products.id),
  bottomProductId: int("bottomProductId").references(() => products.id),
  outerProductId: int("outerProductId").references(() => products.id),
  dressProductId: int("dressProductId").references(() => products.id),
  backgroundId: int("backgroundId").notNull().references(() => backgrounds.id),
  lookCode: varchar("lookCode", { length: 32 }).notNull(),
  resultImageUrl: text("resultImageUrl"),
  status: mysqlEnum("status", ["created", "generating", "complete", "failed"]).default("created").notNull(),
  isSaved: int("isSaved").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type Pose = typeof poses.$inferSelect;
export type Background = typeof backgrounds.$inferSelect;
export type Generation = typeof generations.$inferSelect;
