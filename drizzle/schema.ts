import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import type { CompatibilityWeights, StylistProductMetadata } from "../shared/stylist";

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
  nameEn: varchar("nameEn", { length: 160 }),
  nameKo: varchar("nameKo", { length: 160 }),
  nameZh: varchar("nameZh", { length: 160 }),
  category: mysqlEnum("category", ["top", "bottom", "outer", "dress", "shoes", "bag"]).notNull(),
  season: varchar("season", { length: 120 }).notNull(),
  color: varchar("color", { length: 80 }).notNull(),
  style: varchar("style", { length: 200 }).notNull(),
  status: mysqlEnum("status", ["in_stock", "sold_out"]).default("in_stock").notNull(),
  price: int("price").notNull(),
  imageUrl: text("imageUrl").notNull(),
  images: json("images").$type<string[]>(),
  imageViews: json("imageViews").$type<import("../shared/bodyMeasurements").ProductImageViews>(),
  description: text("description").notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionKo: text("descriptionKo"),
  descriptionZh: text("descriptionZh"),
  discountSeasonEnabled: int("discountSeasonEnabled").default(0).notNull(),
  discountOnePercent: int("discountOnePercent").default(20).notNull(),
  discountTwoPercent: int("discountTwoPercent").default(25).notNull(),
  discountThreePercent: int("discountThreePercent").default(30).notNull(),
  discountFourPlusPercent: int("discountFourPlusPercent").default(35).notNull(),
  momentCouponEnabled: int("momentCouponEnabled").default(0).notNull(),
  momentCouponCode: varchar("momentCouponCode", { length: 64 }),
  momentCouponPercent: int("momentCouponPercent").default(0).notNull(),
  fabric: varchar("fabric", { length: 160 }),
  texture: varchar("texture", { length: 120 }),
  fit: varchar("fit", { length: 120 }),
  length: varchar("length", { length: 120 }),
  width: varchar("width", { length: 120 }),
  details: varchar("details", { length: 2000 }),
  neckline: varchar("neckline", { length: 120 }),
  sleeve: varchar("sleeve", { length: 120 }),
  purchaseUrl: text("purchaseUrl"),
  purchasePlatform: varchar("purchasePlatform", { length: 120 }),
  stylistMetadata: json("stylistMetadata").$type<StylistProductMetadata>(),
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

export const stylePresets = mysqlTable("stylePresets", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 80 }).notNull(),
  description: varchar("description", { length: 240 }).notNull(),
  matchingTags: json("matchingTags").$type<string[]>().notNull(),
  weights: json("weights").$type<CompatibilityWeights>().notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const stylistFeedback = mysqlTable("stylistFeedback", {
  id: int("id").autoincrement().primaryKey(),
  visitorId: varchar("visitorId", { length: 96 }).notNull(),
  stylePresetKey: varchar("stylePresetKey", { length: 64 }).notNull(),
  anchorProductId: int("anchorProductId").references(() => products.id),
  productIds: json("productIds").$type<number[]>().notNull(),
  score: int("score").notNull(),
  feedback: mysqlEnum("feedback", ["good", "bad"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const generationLogs = mysqlTable("generationLogs", {
  id: int("id").autoincrement().primaryKey(),
  requestId: varchar("requestId", { length: 96 }).notNull().unique(),
  retryOfRequestId: varchar("retryOfRequestId", { length: 96 }),
  retryCount: int("retryCount").default(0).notNull(),
  userImageUrl: text("userImageUrl").notNull(),
  poseId: int("poseId").notNull(),
  style: varchar("style", { length: 80 }).notNull(),
  productIds: json("productIds").$type<number[]>().notNull(),
  backgroundId: int("backgroundId").notNull(),
  provider: varchar("provider", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["preparing", "generating", "completed", "fallback", "failed"]).default("preparing").notNull(),
  resultImageUrl: text("resultImageUrl"),
  errorMessage: text("errorMessage"),
  durationMs: int("durationMs"),
  validationStatus: mysqlEnum("validationStatus", ["not_enabled", "pending", "passed", "acceptable", "retry_recommended", "failed"]).default("not_enabled").notNull(),
  garmentPreservationScore: int("garmentPreservationScore"),
  identityPreservationScore: int("identityPreservationScore"),
  overallQualityScore: int("overallQualityScore"),
  validationDetails: json("validationDetails").$type<Record<string, unknown> | null>(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type Pose = typeof poses.$inferSelect;
export type Background = typeof backgrounds.$inferSelect;
export type Generation = typeof generations.$inferSelect;
export type StylePreset = typeof stylePresets.$inferSelect;
export type StylistFeedback = typeof stylistFeedback.$inferSelect;
export type GenerationLog = typeof generationLogs.$inferSelect;
