export interface StoreOffer {
  id: string;
  productId: string;
  storeName: string;
  storeLogo?: string;
  price: number;
  originalPrice?: number;
  pixDiscountPrice?: number;
  installmentText?: string;
  shippingPrice: number;
  deliveryDays: number;
  rating: number;
  reviewCount: number;
  isIdentical: boolean;
  productUrl: string;
  inStock: boolean;
  couponCode?: string;
  couponDiscount?: string;
  lastUpdated: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  storeName: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  ean?: string;
  category: string;
  image: string;
  description?: string;
  currentLowestPrice: number;
  historicalLowestPrice: number;
  historicalHighestPrice: number;
  targetPrice?: number;
  isMonitored?: boolean;
  offers: StoreOffer[];
  priceHistory: PriceHistoryPoint[];
  coupons?: Coupon[];
}

export interface Coupon {
  id: string;
  storeName: string;
  code: string;
  discountText: string;
  discountValue?: string;
  minPurchase?: number;
  category: string;
  expiryDate: string;
  verified: boolean;
  terms?: string;
}

export interface MonitoredItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  currentLowestPrice: number;
  targetPrice: number;
  collection: string;
  alertFrequency: 'immediate' | 'daily' | 'weekly';
  notificationsEnabled: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'price_drop' | 'new_coupon' | 'stock';
  productId?: string;
  read: boolean;
}

export type SortOption = 'price_asc' | 'price_shipping' | 'rating_desc' | 'delivery_asc';
