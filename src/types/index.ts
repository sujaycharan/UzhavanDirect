export type UserRole = 'farmer' | 'customer' | 'admin';

export type Language = 'en' | 'ta';

export type ProductCategory =
  | 'Vegetables'
  | 'Fruits'
  | 'Grains'
  | 'Pulses'
  | 'Spices'
  | 'Other Agricultural Products';

export type MeasurementUnit = 'Kilogram' | 'Gram' | 'Quintal' | 'Tonne' | 'Piece' | 'Bag';

export type UnitShort = 'kg' | 'g' | 'qtl' | 't' | 'pc' | 'bag';

export type ProductQuality = 'Organic Certified (Demo)' | 'Farm Fresh Grade A' | 'Standard Export Grade' | 'Natural Homegrown';

export type ProductStatus = 'active' | 'unavailable' | 'disabled_by_admin';

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type FulfilmentOption = 'farmer_pickup' | 'local_delivery';

export type PaymentMethod = 'cod' | 'demo_upi';

export type TamilNaduDistrict =
  | 'Trichy'
  | 'Thanjavur'
  | 'Madurai'
  | 'Salem'
  | 'Coimbatore'
  | 'Erode'
  | 'Dindigul';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  district: TamilNaduDistrict;
  address: string;
  isDemoAccount: boolean;
  createdAt: string;
  // Farmer-specific fields
  farmName?: string;
  farmSizeAcres?: number;
  farmingExperienceYears?: number;
  primaryCrops?: string[];
  bio?: string;
  // Customer-specific fields
  favouriteProductIds?: string[];
}

export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  name: string;
  cropKey: string; // normalized key for price comparison e.g. 'tomato'
  category: ProductCategory;
  description: string;
  image: string;
  availableQuantity: number;
  unit: MeasurementUnit;
  sellingPrice: number;
  wholesalePrice?: number;
  minOrderQuantity: number;
  wholesaleMinQty?: number;
  harvestDate: string;
  district: TamilNaduDistrict;
  quality: ProductQuality;
  retailAvailable: boolean;
  wholesaleAvailable: boolean;
  status: ProductStatus;
  createdAt: string;
  isDemoListing?: boolean;
}

export interface MarketReferencePrice {
  crop: string;
  cropKey: string;
  category: ProductCategory;
  unit: MeasurementUnit;
  referencePrice: number;
  suggestedMin: number;
  suggestedMax: number;
  trend: 'rising' | 'stable' | 'softening';
  note: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  orderType: 'retail' | 'wholesale';
}

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  farmerId: string;
  farmerName: string;
  unit: MeasurementUnit;
  unitPrice: number;
  quantity: number;
  orderType: 'retail' | 'wholesale';
  subtotal: number;
  image: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  district: TamilNaduDistrict;
  farmerId: string;
  farmerName: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  fulfilmentOption: FulfilmentOption;
  paymentMethod: PaymentMethod;
  orderType: 'retail' | 'wholesale';
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  reviewed?: boolean;
  isDemoOrder?: boolean;
}

export interface ProductReview {
  id: string;
  orderId: string;
  productId: string;
  farmerId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReportedListing {
  id: string;
  productId: string;
  productName: string;
  farmerName: string;
  reportedBy: string;
  reason: string;
  status: 'open' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string; // specific userId or 'all_farmers' / 'all_admins'
  roleTarget?: UserRole;
  title: string;
  message: string;
  type: 'order' | 'listing' | 'stock' | 'weather' | 'disease' | 'fertilizer' | 'system';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ActivityLog {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  createdAt: string;
}

export interface DistrictWeather {
  district: 'Trichy' | 'Thanjavur' | 'Madurai' | 'Salem';
  temperature: number;
  humidity: number;
  rainProbability: number;
  expectedRainfall: number;
  windSpeed: number;
  condition: string;
  forecast: {
    day: string;
    tempMax: number;
    tempMin: number;
    rainfall: number;
    humidity: number;
    condition: string;
  }[];
}

export interface DiseaseRiskInput {
  crop: 'Rice' | 'Tomato' | 'Brinjal' | 'Chilli' | 'Banana' | 'Groundnut';
  growthStage: 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting / Grain Filling';
  location: TamilNaduDistrict;
  temperature: number;
  humidity: number;
  rainfallCondition: 'Dry / No Rain' | 'Light Showers' | 'Frequent Rainfall' | 'Heavy Downpour';
}

export interface DiseaseRiskResult {
  crop: string;
  diseaseCategory: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  contributingConditions: string[];
  warningSigns: string[];
  precautions: string[];
}

export interface FertilizerInput {
  crop: 'Rice' | 'Tomato' | 'Brinjal' | 'Chilli' | 'Banana' | 'Groundnut' | 'Onion';
  soilType: 'Alluvial' | 'Red Loamy' | 'Black Cotton' | 'Sandy Loam' | 'Clay Loam';
  hasSoilTest: boolean;
  soilPh?: number;
  nitrogen?: number; // kg/ha demo scale
  phosphorus?: number;
  potassium?: number;
  growthStage: 'Basal / Land Prep' | 'Vegetative Growth' | 'Flowering & Fruit Set' | 'Maturity';
}

export interface FertilizerResult {
  hasSoilTest: boolean;
  soilSummary: string;
  phStatus: 'Acidic' | 'Optimal' | 'Alkaline' | 'Unknown';
  nutrients: {
    name: string;
    level: 'Low' | 'Medium' | 'Adequate' | 'Not Tested';
    valueLabel: string;
  }[];
  possibleDeficiencies: string[];
  suitableCategories: string[];
  applicationTiming: string[];
  precautions: string[];
}

export type SoilTypeOption =
  | 'Alluvial'
  | 'Red Loamy'
  | 'Black Cotton'
  | 'Sandy Loam'
  | 'Clay Loam';

export type FarmingSeason =
  | 'Kuruvai (Jun–Sep)'
  | 'Samba / Thaladi (Aug–Jan)'
  | 'Navarai / Summer (Jan–May)';

export type WaterAvailability =
  | 'High (Canal / Borewell)'
  | 'Moderate (Drip / Well)'
  | 'Low (Rainfed / Dryland)';

export interface CropRecommendationInput {
  district: TamilNaduDistrict;
  landAreaAcres: number;
  soilType: SoilTypeOption;
  season: FarmingSeason;
  waterAvailability: WaterAvailability;
  temperature: number;
  humidity: number;
  soilPh: number;
  rainfallMm: number;
  budgetLevel: 'Low' | 'Moderate' | 'High';
}

export interface CropRecommendationItem {
  id: string;
  cropName: string;
  tamilName: string;
  category: ProductCategory;
  cropKey: string;
  score: number;
  suitabilityLabel: 'Highly Suitable' | 'Suitable' | 'Moderate Fit';
  durationDays: string;
  waterNeed: WaterAvailability;
  idealSoils: SoilTypeOption[];
  preferredDistricts: TamilNaduDistrict[];
  reasons: string[];
  cautions: string[];
  areaNote: string;
  rotationTip: string;
  simulatedDemand: string;
}

export const UNIT_SHORT_MAP: Record<MeasurementUnit, UnitShort> = {
  Kilogram: 'kg',
  Gram: 'g',
  Quintal: 'qtl',
  Tonne: 't',
  Piece: 'pc',
  Bag: 'bag',
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Vegetables',
  'Fruits',
  'Grains',
  'Pulses',
  'Spices',
  'Other Agricultural Products',
];

export const MEASUREMENT_UNITS: MeasurementUnit[] = [
  'Kilogram',
  'Gram',
  'Quintal',
  'Tonne',
  'Piece',
  'Bag',
];

export const TAMIL_NADU_DISTRICTS: TamilNaduDistrict[] = [
  'Trichy',
  'Thanjavur',
  'Madurai',
  'Salem',
  'Coimbatore',
  'Erode',
  'Dindigul',
];

export const PRODUCT_QUALITIES: ProductQuality[] = [
  'Farm Fresh Grade A',
  'Organic Certified (Demo)',
  'Natural Homegrown',
  'Standard Export Grade',
];

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'Pending',
  'Accepted',
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered',
];
