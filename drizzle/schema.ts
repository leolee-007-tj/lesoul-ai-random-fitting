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
  brand: varchar("brand", { length: 120 }),
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
  purchaseQrUrl: text("purchaseQrUrl"),
  purchaseQrUpdatedAt: timestamp("purchaseQrUpdatedAt"),
  isFeatured: int("isFeatured").default(0).notNull(),
  featuredPriority: int("featuredPriority").default(0).notNull(),
  catalogTier: mysqlEnum("catalogTier", ["beta", "basic", "full"]).default("full").notNull(),
  garmentMeasurements: json("garmentMeasurements").$type<import("../shared/fitEngine").GarmentMeasurements>(),
  sizeOptions: json("sizeOptions").$type<import("../shared/fitEngine").GarmentSizeOption[]>(),
  stretchLevel: mysqlEnum("stretchLevel", ["none", "low", "medium", "high"]).default("low").notNull(),
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

/** One id=1 record controls access policy without coupling the LESOUL Core to a release mode. */
export const releaseSettings = mysqlTable("releaseSettings", {
  id: int("id").primaryKey(),
  /** Prevent a deliberately emptied administrator catalog from being reseeded with demo products. */
  catalogInitialized: int("catalogInitialized").default(0).notNull(),
  releaseMode: mysqlEnum("releaseMode", ["PRIVATE", "BETA_PUBLIC", "REDEEM_CODE"]).default("PRIVATE").notNull(),
  betaCatalogLimit: int("betaCatalogLimit").default(12).notNull(),
  betaDailyVisitorLimit: int("betaDailyVisitorLimit").default(2).notNull(),
  betaFreeGenerationAllowance: int("betaFreeGenerationAllowance").default(3).notNull(),
  globalDailyGenerationLimit: int("globalDailyGenerationLimit").default(120).notNull(),
  monthlyGenerationLimit: int("monthlyGenerationLimit").default(2400).notNull(),
  generationEnabled: int("generationEnabled").default(1).notNull(),
  purchaseMode: mysqlEnum("purchaseMode", ["PURCHASE_LIST", "QR", "DISABLED"]).default("PURCHASE_LIST").notNull(),
  purchaseListMaxItems: int("purchaseListMaxItems").default(10).notNull(),
  purchaseQrEnabled: int("purchaseQrEnabled").default(1).notNull(),
  purchaseNoticeEn: text("purchaseNoticeEn"),
  purchaseNoticeKo: text("purchaseNoticeKo"),
  purchaseNoticeZh: text("purchaseNoticeZh"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const redeemCodes = mysqlTable("redeemCodes", {
  id: int("id").autoincrement().primaryKey(),
  codeHash: varchar("codeHash", { length: 128 }).notNull().unique(),
  status: mysqlEnum("status", ["ACTIVE", "USED", "EXPIRED", "DISABLED"]).default("ACTIVE").notNull(),
  expiresAt: timestamp("expiresAt"),
  maxUses: int("maxUses").default(1).notNull(),
  usedCount: int("usedCount").default(0).notNull(),
  generationAllowance: int("generationAllowance").default(5).notNull(),
  isUnlimited: int("isUnlimited").default(0).notNull(),
  catalogTier: mysqlEnum("catalogTier", ["basic", "full"]).default("basic").notNull(),
  campaign: varchar("campaign", { length: 120 }),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const visitorEntitlements = mysqlTable("visitorEntitlements", {
  id: int("id").autoincrement().primaryKey(),
  visitorId: varchar("visitorId", { length: 96 }).notNull(),
  redeemCodeId: int("redeemCodeId").references(() => redeemCodes.id),
  generationAllowance: int("generationAllowance").notNull(),
  isUnlimited: int("isUnlimited").default(0).notNull(),
  generationUsed: int("generationUsed").default(0).notNull(),
  catalogTier: mysqlEnum("catalogTier", ["beta", "basic", "full"]).default("beta").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const bodyProfiles = mysqlTable("bodyProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  visitorId: varchar("visitorId", { length: 96 }).notNull(),
  heightCm: int("heightCm").notNull(),
  weightKg: int("weightKg").notNull(),
  bustCm: int("bustCm"),
  waistCm: int("waistCm"),
  hipCm: int("hipCm"),
  genderPresentation: mysqlEnum("genderPresentation", ["female", "masculine", "androgynous", "custom"]).default("female").notNull(),
  bodyShape: mysqlEnum("bodyShape", ["slim", "straight", "curvy", "petite", "tall", "plus", "custom"]).default("custom").notNull(),
  modelKey: varchar("modelKey", { length: 48 }).notNull(),
  hairLength: mysqlEnum("hairLength", ["short", "medium", "long"]).default("medium").notNull(),
  hairStyle: mysqlEnum("hairStyle", ["straight", "natural_wave", "bob"]).default("straight").notNull(),
  hairColor: mysqlEnum("hairColor", ["black", "dark_brown", "brown", "light_brown"]).default("dark_brown").notNull(),
  skinTone: mysqlEnum("skinTone", ["light", "light_medium", "medium", "medium_deep", "deep"]).default("light_medium").notNull(),
  approvalStatus: mysqlEnum("approvalStatus", ["preview", "approved", "superseded"]).default("preview").notNull(),
  profileHash: varchar("profileHash", { length: 128 }).notNull(),
  version: int("version").default(1).notNull(),
  consentedAt: timestamp("consentedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const aiBodyModels = mysqlTable("aiBodyModels", {
  id: int("id").autoincrement().primaryKey(),
  bodyProfileId: int("bodyProfileId").notNull().references(() => bodyProfiles.id),
  profileHash: varchar("profileHash", { length: 128 }).notNull(),
  modelKey: varchar("modelKey", { length: 48 }).notNull(),
  version: int("version").default(1).notNull(),
  approved: int("approved").default(0).notNull(),
  imageUrl: text("imageUrl"),
  status: mysqlEnum("status", ["preparing", "ready", "failed"]).default("preparing").notNull(),
  provider: varchar("provider", { length: 80 }).default("manus_gpt_image_2").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const generationFeedback = mysqlTable("generationFeedback", {
  id: int("id").autoincrement().primaryKey(),
  generationRequestId: varchar("generationRequestId", { length: 96 }).notNull(),
  visitorId: varchar("visitorId", { length: 96 }).notNull(),
  feedback: mysqlEnum("feedback", ["love", "okay", "not_like_me", "garment_inaccurate"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const savedLooks = mysqlTable("savedLooks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  lookId: varchar("lookId", { length: 96 }).notNull(),
  lookCode: varchar("lookCode", { length: 48 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  snapshot: json("snapshot").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
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
  visitorId: varchar("visitorId", { length: 96 }).default("legacy").notNull(),
  releaseMode: mysqlEnum("releaseMode", ["PRIVATE", "BETA_PUBLIC", "REDEEM_CODE"]).default("PRIVATE").notNull(),
  source: mysqlEnum("source", ["wechat_moments", "direct", "admin_test"]).default("direct").notNull(),
  generationMode: mysqlEnum("generationMode", ["AI_FITTING", "QUICK_FIT"]).default("AI_FITTING").notNull(),
  tryOnMode: mysqlEnum("tryOnMode", ["my_photo", "ai_body_model", "quick_fit"]).default("my_photo").notNull(),
  bodyModelId: int("bodyModelId"),
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
