import { int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import type { CompatibilityWeights, StylistProductMetadata } from "../shared/stylist";

/** Core identity record populated by Manus OAuth. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  /** Username/password identities are reserved for administrator-created controlled account types. */
  username: varchar("username", { length: 64 }).unique(),
  passwordHash: varchar("passwordHash", { length: 256 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "vip", "admin", "store_trial", "store_display"]).default("user").notNull(),
  isActive: int("isActive").default(1).notNull(),
  /** Owner-controlled permission for the Store Display camera greeting. */
  presenceCameraEnabled: int("presenceCameraEnabled").default(1).notNull(),
  /** Short-lived heartbeat used only to show whether a display is currently online. */
  presenceCameraLastSeenAt: timestamp("presenceCameraLastSeenAt"),
  /** Sanitized camera initialization stage only; no frames, device identifiers, or raw UA are stored. */
  presenceCameraLastError: varchar("presenceCameraLastError", { length: 96 }),
  presenceCameraLastErrorAt: timestamp("presenceCameraLastErrorAt"),
  /** The configured owner is the sole primary administrator and operator. */
  isPrimaryAdmin: int("isPrimaryAdmin").default(0).notNull(),
  /** Password-based administrator trial begins independently on that account's first protected console visit. */
  adminTrialStartedAt: timestamp("adminTrialStartedAt"),
  adminTrialDurationHours: int("adminTrialDurationHours").default(48).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** Administrator-managed customer labels mapped to a stable core category for AI and sizing logic. */
export const productCategories = mysqlTable("productCategories", {
  id: int("id").autoincrement().primaryKey(),
  nameEn: varchar("nameEn", { length: 120 }).notNull(),
  nameKo: varchar("nameKo", { length: 120 }).notNull(),
  nameZh: varchar("nameZh", { length: 120 }).notNull(),
  baseNameEn: varchar("baseNameEn", { length: 120 }),
  baseNameKo: varchar("baseNameKo", { length: 120 }),
  baseNameZh: varchar("baseNameZh", { length: 120 }),
  baseCategory: mysqlEnum("baseCategory", ["TOP", "PANTS", "JACKET", "DRESS", "SHOES", "BAG"]).notNull(),
  /** Enabled real-garment measurements, ordered for the administrator Fit Manager. */
  measurementFields: json("measurementFields").$type<import("../shared/categoryMeasurementFields").MeasurementFieldKey[]>(),
  isActive: int("isActive").default(1).notNull(),
  sortOrder: int("sortOrder").default(100).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 160 }),
  nameKo: varchar("nameKo", { length: 160 }),
  nameZh: varchar("nameZh", { length: 160 }),
  brand: varchar("brand", { length: 120 }),
  /** Optional manager-controlled customer display category. The legacy category remains the stable AI/base category. */
  displayCategoryId: int("displayCategoryId"),
  category: mysqlEnum("category", ["top", "bottom", "outer", "dress", "shoes", "bag"]).notNull(),
  season: varchar("season", { length: 120 }).notNull(),
  color: varchar("color", { length: 80 }).notNull(),
  style: varchar("style", { length: 200 }).notNull(),
  status: mysqlEnum("status", ["in_stock", "sold_out"]).default("in_stock").notNull(),
  /** Owner-managed stock count; sold-out products are always synchronized to zero. */
  inventoryQuantity: int("inventoryQuantity").default(0).notNull(),
  /** Public catalog visibility remains separate from current sales availability. */
  isActive: int("isActive").default(1).notNull(),
  availabilityStatus: mysqlEnum("availabilityStatus", ["IN_STOCK", "PRE_ORDER", "SOLD_OUT"]).default("IN_STOCK").notNull(),
  /** When enabled, customer display is limited to VIP accounts and the owner preview. */
  vipEarlyAccess: int("vipEarlyAccess").default(0).notNull(),
  isNew: int("isNew").default(0).notNull(),
  newArrivalAt: timestamp("newArrivalAt"),
  price: int("price").notNull(),
  /** A set is still one purchasable catalog product; its inner pieces are kept as an ordered value list. */
  productType: mysqlEnum("productType", ["SINGLE", "SET"]).default("SINGLE").notNull(),
  setComponents: json("setComponents").$type<import("../shared/setProducts").SetProductComponent[]>(),
  /** Owner-selected base customer discounts. Seasonal sale modes temporarily override these values. */
  normalDiscountPercent: int("normalDiscountPercent").default(17).notNull(),
  vipDiscountPercent: int("vipDiscountPercent").default(20).notNull(),
  /** Legacy price remains the compatible original CNY price; explicit sale fields drive customer sale display. */
  priceOriginal: int("priceOriginal"),
  discountRate: int("discountRate"),
  priceSale: int("priceSale"),
  saleEnabled: int("saleEnabled").default(0).notNull(),
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
  /** UI-only thumbnail presentation. Never used for body/garment fit or generation prompts. */
  catalogDisplay: json("catalogDisplay").$type<import("../shared/catalogDisplay").CatalogDisplaySettings>(),
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
  /** Owner-managed public store name; customer pages fall back safely for legacy rows. */
  storeName: varchar("storeName", { length: 80 }).default("LESOUL LOOK").notNull(),
  storeTaglineEn: varchar("storeTaglineEn", { length: 180 }).default("A quieter way to discover your next LOOK.").notNull(),
  storeTaglineKo: varchar("storeTaglineKo", { length: 180 }).default("다음 LOOK을 더 조용하고 선명하게 발견하는 방법.").notNull(),
  storeTaglineZh: varchar("storeTaglineZh", { length: 180 }).default("以更安静、更清晰的方式发现你的下一套 LOOK。").notNull(),
  /** One centralized policy replaces legacy per-product sale and coupon calculations in every customer purchase flow. */
  pricingMode: mysqlEnum("pricingMode", ["BASE", "SEASON_FORMAT_1", "SEASON_FORMAT_2", "SEASON_FORMAT_3"]).default("BASE").notNull(),
  /** Owner option: seasonal/global sale discounts do not apply to products explicitly marked NEW. */
  excludeNewArrivalsFromSale: int("excludeNewArrivalsFromSale").default(0).notNull(),
  /** Display-only option: show current inventory beside the revealed product price. */
  showInventoryQuantity: int("showInventoryQuantity").default(0).notNull(),
  /** Customer devices process their own camera feed locally; the server stores only this owner-controlled alert configuration. */
  presenceAlertEnabled: int("presenceAlertEnabled").default(0).notNull(),
  presenceAlertSoundUrl: text("presenceAlertSoundUrl"),
  presenceAlertRepeatCount: int("presenceAlertRepeatCount").default(1).notNull(),
  /** Starts only when an administrator first opens the protected console. Customer access never reads these fields. */
  adminTrialStartedAt: timestamp("adminTrialStartedAt"),
  adminTrialDurationHours: int("adminTrialDurationHours").default(48).notNull(),
  adminTrialPaymentQrUrl: text("adminTrialPaymentQrUrl"),
  adminTrialUsageGuideQrUrl: text("adminTrialUsageGuideQrUrl"),
  adminTrialPaymentNoticeEn: varchar("adminTrialPaymentNoticeEn", { length: 800 }).default("Your administrator trial has ended. Please scan the QR code to arrange manual renewal, then contact the store owner for activation.").notNull(),
  adminTrialPaymentNoticeKo: varchar("adminTrialPaymentNoticeKo", { length: 800 }).default("관리자 체험 기간이 종료되었습니다. QR 코드를 스캔하여 수동 연장을 진행한 뒤, 스토어 소유자에게 활성화를 요청해 주세요.").notNull(),
  adminTrialPaymentNoticeZh: varchar("adminTrialPaymentNoticeZh", { length: 800 }).default("管理员体验已结束。请扫描二维码安排人工续费，然后联系店铺所有者开通权限。").notNull(),
  adminTrialUsageGuideNoticeEn: varchar("adminTrialUsageGuideNoticeEn", { length: 800 }).default("Scan the guide QR to view how to use the administrator console and submit a renewal request.").notNull(),
  adminTrialUsageGuideNoticeKo: varchar("adminTrialUsageGuideNoticeKo", { length: 800 }).default("사용 방법 QR을 스캔하여 관리자 콘솔 이용 방법과 연장 요청 절차를 확인해 주세요.").notNull(),
  adminTrialUsageGuideNoticeZh: varchar("adminTrialUsageGuideNoticeZh", { length: 800 }).default("请扫描使用指南二维码，查看管理员控制台使用方法和续费申请流程。").notNull(),
  /** Project-owned hourly cleanup job for expired isolated trial-store workspaces. */
  trialStoreResetCronTaskUid: varchar("trialStoreResetCronTaskUid", { length: 65 }),
  /** Prevent a deliberately emptied administrator catalog from being reseeded with demo products. */
  catalogInitialized: int("catalogInitialized").default(0).notNull(),
  releaseMode: mysqlEnum("releaseMode", ["PRIVATE", "BETA_PUBLIC", "REDEEM_CODE"]).default("PRIVATE").notNull(),
  betaCatalogLimit: int("betaCatalogLimit").default(12).notNull(),
  betaDailyVisitorLimit: int("betaDailyVisitorLimit").default(2).notNull(),
  betaFreeGenerationAllowance: int("betaFreeGenerationAllowance").default(3).notNull(),
  globalDailyGenerationLimit: int("globalDailyGenerationLimit").default(120).notNull(),
  monthlyGenerationLimit: int("monthlyGenerationLimit").default(2400).notNull(),
  generationEnabled: int("generationEnabled").default(1).notNull(),
  studioImageProcessingEnabled: int("studioImageProcessingEnabled").default(1).notNull(),
  /** Central AI policy settings. Monetary values are CNY fen and are always shown as estimates unless provider metadata supplies an actual amount. */
  normalAiGenerationLimit: int("normalAiGenerationLimit").default(3).notNull(),
  dailyAiRequestLimit: int("dailyAiRequestLimit").default(0).notNull(),
  monthlyAiBudgetFen: int("monthlyAiBudgetFen").default(0).notNull(),
  stopAiAtBudgetLimit: int("stopAiAtBudgetLimit").default(1).notNull(),
  monthlyActualAiCostFen: int("monthlyActualAiCostFen"),
  aiBodyModelEstimatedCostFen: int("aiBodyModelEstimatedCostFen").default(0).notNull(),
  aiFittingEstimatedCostFen: int("aiFittingEstimatedCostFen").default(0).notNull(),
  quickFitEstimatedCostFen: int("quickFitEstimatedCostFen").default(0).notNull(),
  regenerationEstimatedCostFen: int("regenerationEstimatedCostFen").default(0).notNull(),
  /** Central role-policy feature flags. Quick AI remains the existing Quick Fit pipeline. */
  quickAiAdminOnly: int("quickAiAdminOnly").default(1).notNull(),
  liyingAiVipEnabled: int("liyingAiVipEnabled").default(1).notNull(),
  /** Owner-uploaded VIP 李瀛 reference images keyed by petite, balanced, or volume. */
  liyingReferenceImageUrls: json("liyingReferenceImageUrls").$type<Partial<Record<import("../shared/fixedModels").FixedModelKey, string | null>>>(),
  normalStyleMatchEnabled: int("normalStyleMatchEnabled").default(1).notNull(),
  normalStyleMatchLimit: int("normalStyleMatchLimit").default(3).notNull(),
  purchaseMode: mysqlEnum("purchaseMode", ["PURCHASE_LIST", "QR", "DISABLED"]).default("PURCHASE_LIST").notNull(),
  purchaseListMaxItems: int("purchaseListMaxItems").default(10).notNull(),
  purchaseQrEnabled: int("purchaseQrEnabled").default(1).notNull(),
  purchaseNoticeEn: text("purchaseNoticeEn"),
  purchaseNoticeKo: text("purchaseNoticeKo"),
  purchaseNoticeZh: text("purchaseNoticeZh"),
  stylistIncludePreorder: int("stylistIncludePreorder").default(0).notNull(),
  curatedOutfitsPriority: int("curatedOutfitsPriority").default(1).notNull(),
  /** Owner preference only. Qwen cannot become effective until a server key is configured. */
  aiImageProviderPreference: mysqlEnum("aiImageProviderPreference", ["FORGE", "QWEN"]).default("FORGE").notNull(),
  aiTextProviderPreference: mysqlEnum("aiTextProviderPreference", ["FORGE", "QWEN"]).default("FORGE").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** A sandboxed store workspace that belongs to exactly one password-based STORE_TRIAL account. */
export const trialStores = mysqlTable("trialStores", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull().unique().references(() => users.id),
  status: mysqlEnum("status", ["ACTIVE", "EXPIRED"]).default("ACTIVE").notNull(),
  storeName: varchar("storeName", { length: 80 }).default("MY TRIAL STORE").notNull(),
  paymentQrUrl: text("paymentQrUrl"),
  purchaseNotice: text("purchaseNotice"),
  /** Each trial store controls its own sale policy without changing the owner catalog. */
  pricingMode: mysqlEnum("pricingMode", ["BASE", "SEASON_FORMAT_1", "SEASON_FORMAT_2", "SEASON_FORMAT_3"]).default("BASE").notNull(),
  excludeNewArrivalsFromSale: int("excludeNewArrivalsFromSale").default(0).notNull(),
  startedAt: timestamp("startedAt").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  resetAt: timestamp("resetAt"),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Trial-store products never read from or write to the production products catalog. */
export const trialStoreProducts = mysqlTable("trialStoreProducts", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull().references(() => trialStores.id),
  name: varchar("name", { length: 160 }).notNull(),
  brand: varchar("brand", { length: 120 }),
  category: mysqlEnum("category", ["top", "bottom", "outer", "dress", "shoes", "bag"]).default("top").notNull(),
  price: int("price").notNull(),
  status: mysqlEnum("status", ["IN_STOCK", "SOLD_OUT"]).default("IN_STOCK").notNull(),
  imageUrls: json("imageUrls").$type<string[]>().notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
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
  /** Optional future account link. Test-phase ownership is always visitorId. */
  userId: int("userId").references(() => users.id),
  visitorId: varchar("visitorId", { length: 96 }).notNull(),
  lookId: varchar("lookId", { length: 96 }).notNull(),
  lookCode: varchar("lookCode", { length: 48 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  snapshot: json("snapshot").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("savedLooks_visitor_look_unique").on(table.visitorId, table.lookId)]);

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

/** Administrator-validated real-product looks. Customer ranking always rechecks current product availability. */
export const curatedOutfits = mysqlTable("curatedOutfits", {
  id: int("id").autoincrement().primaryKey(),
  nameEn: varchar("nameEn", { length: 160 }).notNull(),
  nameKo: varchar("nameKo", { length: 160 }).notNull(),
  nameZh: varchar("nameZh", { length: 160 }).notNull(),
  reasonEn: text("reasonEn"),
  reasonKo: text("reasonKo"),
  reasonZh: text("reasonZh"),
  stylePresetKey: varchar("stylePresetKey", { length: 64 }).notNull(),
  isActive: int("isActive").default(1).notNull(),
  sortOrder: int("sortOrder").default(100).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Flexible actual product composition. Any included product may be an anchor for Style This Item. */
export const curatedOutfitItems = mysqlTable("curatedOutfitItems", {
  id: int("id").autoincrement().primaryKey(),
  outfitId: int("outfitId").notNull().references(() => curatedOutfits.id),
  productId: int("productId").notNull().references(() => products.id),
  isAnchor: int("isAnchor").default(1).notNull(),
  sortOrder: int("sortOrder").default(100).notNull(),
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

/** Store-display-only AI lookbook images grouped by product and generation batch. */
export const displayLookbookImages = mysqlTable("displayLookbookImages", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id),
  batchId: varchar("batchId", { length: 96 }).notNull(),
  shotIndex: int("shotIndex").notNull(),
  sceneType: mysqlEnum("sceneType", ["studio_front", "studio_side", "studio_full", "store_work", "store_customer", "store_walk"]).notNull(),
  sceneDescription: varchar("sceneDescription", { length: 300 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  storageKey: text("storageKey").notNull(),
  isApproved: int("isApproved").default(0).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type DisplayLookbookImage = typeof displayLookbookImages.$inferSelect;
/**
 * A request-level audit trail created only when the server is about to call an AI provider
 * (or when the existing rule-only Stylist completes). This is the source of truth for
 * cost estimation and the central access controller; UI button clicks are never written here.
 */
export const aiUsageEvents = mysqlTable("aiUsageEvents", {
  id: int("id").autoincrement().primaryKey(),
  visitorId: varchar("visitorId", { length: 96 }).notNull(),
  userId: int("userId").references(() => users.id),
  entitlementId: int("entitlementId").references(() => visitorEntitlements.id),
  generationId: varchar("generationId", { length: 96 }),
  featureType: mysqlEnum("featureType", ["AI_BODY_MODEL", "AI_FITTING", "LIYING_AI", "QUICK_FIT", "REGENERATION", "AI_STYLIST"]).notNull(),
  requestType: mysqlEnum("requestType", ["IMAGE_GENERATION", "RULE_ENGINE"]).notNull(),
  provider: varchar("provider", { length: 80 }).notNull(),
  model: varchar("model", { length: 120 }),
  status: mysqlEnum("status", ["REQUESTED", "SUCCESS", "FAILED", "CANCELLED", "BLOCKED_BY_LIMIT", "BLOCKED_BY_BUDGET", "PAUSED"]).default("REQUESTED").notNull(),
  estimatedCostFen: int("estimatedCostFen").default(0).notNull(),
  providerUsageMetadata: json("providerUsageMetadata").$type<Record<string, unknown> | null>(),
  durationMs: int("durationMs"),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Daily-deduplicated visits from a product link copied for WeChat sharing. Visitor IDs remain opaque and are never exposed in operations UI. */
export const productShareVisits = mysqlTable("productShareVisits", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id),
  visitorId: varchar("visitorId", { length: 96 }).notNull(),
  source: mysqlEnum("source", ["WECHAT_SHARE"]).default("WECHAT_SHARE").notNull(),
  visitDay: varchar("visitDay", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("product_share_visit_daily_unique").on(table.productId, table.visitorId, table.source, table.visitDay)]);

/** Anonymous customer-facing daily visits. The browser sends coarse categories only; no IP or raw User-Agent is retained. */
export const siteVisitSummaries = mysqlTable("siteVisitSummaries", {
  id: int("id").autoincrement().primaryKey(),
  visitorId: varchar("visitorId", { length: 96 }).notNull(),
  visitDay: varchar("visitDay", { length: 10 }).notNull(),
  deviceType: mysqlEnum("deviceType", ["phone", "tablet", "desktop", "unknown"]).default("unknown").notNull(),
  operatingSystem: varchar("operatingSystem", { length: 32 }).default("unknown").notNull(),
  browser: varchar("browser", { length: 32 }).default("unknown").notNull(),
  screenClass: varchar("screenClass", { length: 32 }).default("unknown").notNull(),
  locale: varchar("locale", { length: 8 }).default("en").notNull(),
  entryPath: varchar("entryPath", { length: 160 }).default("/").notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("site_visit_daily_unique").on(table.visitorId, table.visitDay)]);

/** Owner-controlled AI access pause for a concrete signed-in account or anonymous visitor ID. */
export const aiAccessBlocks = mysqlTable("aiAccessBlocks", {
  visitorId: varchar("visitorId", { length: 96 }).primaryKey(),
  userId: int("userId").references(() => users.id),
  reason: varchar("reason", { length: 240 }),
  isActive: int("isActive").default(1).notNull(),
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
export type CuratedOutfit = typeof curatedOutfits.$inferSelect;
export type CuratedOutfitItem = typeof curatedOutfitItems.$inferSelect;
export type GenerationLog = typeof generationLogs.$inferSelect;
export type AiUsageEvent = typeof aiUsageEvents.$inferSelect;
export type AiAccessBlock = typeof aiAccessBlocks.$inferSelect;
/** Anonymous, daily-deduplicated product funnel events. No raw contact, IP, or device identifier is stored. */
export const productEngagementEvents = mysqlTable("productEngagementEvents", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id),
  visitorId: varchar("visitorId", { length: 96 }).notNull(),
  eventType: mysqlEnum("eventType", ["DETAIL_VIEW", "PURCHASE_LIST_ADD"]).notNull(),
  eventDay: varchar("eventDay", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("product_engagement_daily_unique").on(table.productId, table.visitorId, table.eventType, table.eventDay)]);

export type SiteVisitSummary = typeof siteVisitSummaries.$inferSelect;
export type ProductEngagementEvent = typeof productEngagementEvents.$inferSelect;
