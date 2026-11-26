import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type {
  ActivityLog,
  AppNotification,
  CartItem,
  FulfilmentOption,
  MarketReferencePrice,
  Order,
  OrderItemSnapshot,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductCategory,
  ProductQuality,
  ProductReview,
  ReportedListing,
  TamilNaduDistrict,
  UserAccount,
  UserRole,
  MeasurementUnit,
} from '@/src/types';
import {
  SEED_ACTIVITY_LOGS,
  SEED_MARKET_PRICES,
  SEED_NOTIFICATIONS,
  SEED_ORDERS,
  SEED_PRODUCTS,
  SEED_REPORTS,
  SEED_REVIEWS,
  SEED_USERS,
} from '@/src/data/seedData';
import { calculateDeliveryCharge, generateDemoOrderId } from '@/src/lib/utils';

const STORAGE_KEY = 'uzhavan_direct_store_v1';
const SESSION_KEY = 'uzhavan_direct_session_v1';

interface PersistedStore {
  users: UserAccount[];
  products: Product[];
  marketPrices: MarketReferencePrice[];
  orders: Order[];
  reviews: ProductReview[];
  reports: ReportedListing[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  cartByUser: Record<string, CartItem[]>;
}

function createInitialStore(): PersistedStore {
  return {
    users: SEED_USERS,
    products: SEED_PRODUCTS,
    marketPrices: SEED_MARKET_PRICES,
    orders: SEED_ORDERS,
    reviews: SEED_REVIEWS,
    reports: SEED_REPORTS,
    notifications: SEED_NOTIFICATIONS,
    activityLogs: SEED_ACTIVITY_LOGS,
    cartByUser: {},
  };
}

function loadStore(): PersistedStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createInitialStore();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Partial<PersistedStore>;
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.products)) {
      const seeded = createInitialStore();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return {
      users: parsed.users,
      products: parsed.products,
      marketPrices: Array.isArray(parsed.marketPrices) ? parsed.marketPrices : SEED_MARKET_PRICES,
      orders: Array.isArray(parsed.orders) ? parsed.orders : SEED_ORDERS,
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : SEED_REVIEWS,
      reports: Array.isArray(parsed.reports) ? parsed.reports : SEED_REPORTS,
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : SEED_NOTIFICATIONS,
      activityLogs: Array.isArray(parsed.activityLogs) ? parsed.activityLogs : SEED_ACTIVITY_LOGS,
      cartByUser: parsed.cartByUser && typeof parsed.cartByUser === 'object' ? parsed.cartByUser : {},
    };
  } catch {
    return createInitialStore();
  }
}

export interface NewProductInput {
  name: string;
  cropKey: string;
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
}

export interface CheckoutInput {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  district: TamilNaduDistrict;
  fulfilmentOption: FulfilmentOption;
  paymentMethod: PaymentMethod;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: 'farmer' | 'customer';
  phone: string;
  district: TamilNaduDistrict;
  address: string;
  farmName?: string;
  farmSizeAcres?: number;
}

interface AppDataContextValue {
  users: UserAccount[];
  products: Product[];
  marketPrices: MarketReferencePrice[];
  orders: Order[];
  reviews: ProductReview[];
  reports: ReportedListing[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  currentUser: UserAccount | null;
  cart: CartItem[];
  cartCount: number;
  userNotifications: AppNotification[];
  unreadNotificationCount: number;
  // Auth
  login: (email: string, password: string) => { ok: boolean; error?: string; role?: UserRole };
  register: (input: RegisterInput) => { ok: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<UserAccount>) => void;
  // Products
  addProduct: (input: NewProductInput) => Product | null;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  toggleProductAvailability: (productId: string) => void;
  adminToggleProductStatus: (productId: string) => void;
  // Cart
  addToCart: (productId: string, quantity: number, orderType: 'retail' | 'wholesale') => boolean;
  updateCartItemQuantity: (productId: string, orderType: 'retail' | 'wholesale', quantity: number) => void;
  removeFromCart: (productId: string, orderType: 'retail' | 'wholesale') => void;
  clearCart: () => void;
  // Orders
  placeOrder: (checkout: CheckoutInput) => { ok: boolean; orders?: Order[]; error?: string };
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;
  // Customer interactions
  toggleFavourite: (productId: string) => void;
  submitReview: (orderId: string, productId: string, farmerId: string, rating: number, comment: string) => void;
  reportListing: (productId: string, reason: string) => void;
  // Admin interactions
  updateReportStatus: (reportId: string, status: ReportedListing['status']) => void;
  resetDemoData: () => void;
  // Notifications
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  pushNotification: (
    userId: string,
    title: string,
    message: string,
    type: AppNotification['type'],
    link?: string
  ) => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<PersistedStore>(() => loadStore());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      toast.error('Browser storage is full. Try using smaller product photos or resetting demo data.');
    }
  }, [store]);

  useEffect(() => {
    try {
      if (currentUserId) {
        localStorage.setItem(SESSION_KEY, currentUserId);
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // ignore
    }
  }, [currentUserId]);

  const currentUser = useMemo(
    () => store.users.find((u) => u.id === currentUserId) ?? null,
    [store.users, currentUserId]
  );

  const activeCartKey = currentUser ? currentUser.id : 'guest';
  const cart = store.cartByUser[activeCartKey] ?? [];
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return store.notifications
      .filter((n) => n.userId === currentUser.id || (n.roleTarget === currentUser.role && n.userId === 'broadcast'))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [store.notifications, currentUser]);

  const unreadNotificationCount = useMemo(
    () => userNotifications.filter((n) => !n.read).length,
    [userNotifications]
  );

  const login = (email: string, password: string) => {
    const cleanedEmail = email.trim().toLowerCase();
    const user = store.users.find((u) => u.email.toLowerCase() === cleanedEmail);
    if (!user) {
      return { ok: false, error: 'No demo account found for that email address.' };
    }
    if (user.password !== password) {
      return { ok: false, error: 'Incorrect password. Use the demo credentials listed below.' };
    }

    // Merge guest cart into customer cart upon login
    setStore((prev) => {
      const guestCart = prev.cartByUser.guest ?? [];
      if (guestCart.length === 0 || user.role !== 'customer') return prev;
      const existing = prev.cartByUser[user.id] ?? [];
      const merged = [...existing];
      for (const gItem of guestCart) {
        const idx = merged.findIndex(
          (i) => i.productId === gItem.productId && i.orderType === gItem.orderType
        );
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], quantity: merged[idx].quantity + gItem.quantity };
        } else {
          merged.push(gItem);
        }
      }
      return {
        ...prev,
        cartByUser: {
          ...prev.cartByUser,
          [user.id]: merged,
          guest: [],
        },
      };
    });

    setCurrentUserId(user.id);
    toast.success(`Welcome back, ${user.name}`);
    return { ok: true, role: user.role };
  };

  const register = (input: RegisterInput) => {
    const cleanedEmail = input.email.trim().toLowerCase();
    if (store.users.some((u) => u.email.toLowerCase() === cleanedEmail)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    if (input.password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters.' };
    }

    const newUser: UserAccount = {
      id: `${input.role}-${Date.now()}`,
      name: input.name.trim(),
      email: cleanedEmail,
      password: input.password,
      role: input.role,
      phone: input.phone.trim(),
      district: input.district,
      address: input.address.trim(),
      isDemoAccount: false,
      createdAt: new Date().toISOString(),
      ...(input.role === 'farmer'
        ? {
            farmName: input.farmName?.trim() || `${input.name.trim()}'s Farm`,
            farmSizeAcres: input.farmSizeAcres || 3,
            farmingExperienceYears: 5,
            primaryCrops: ['Vegetables'],
            bio: 'Newly registered Tamil Nadu farmer on Uzhavan Direct prototype.',
          }
        : {
            favouriteProductIds: [],
          }),
    };

    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      actorName: newUser.name,
      actorRole: newUser.role,
      action: 'Account Registered',
      details: `New ${newUser.role} registered from ${newUser.district} (user-created account).`,
      createdAt: new Date().toISOString(),
    };

    setStore((prev) => ({
      ...prev,
      users: [newUser, ...prev.users],
      activityLogs: [newLog, ...prev.activityLogs],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: newUser.id,
          title: 'Welcome to Uzhavan Direct',
          message:
            newUser.role === 'farmer'
              ? 'Your farmer account is active. Add your first produce listing or explore Smart Agriculture.'
              : 'Your customer account is active. Browse fresh Tamil Nadu farm produce directly.',
          type: 'system',
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...prev.notifications,
      ],
    }));

    setCurrentUserId(newUser.id);
    toast.success(`Account created! Welcome, ${newUser.name}`);
    return { ok: true };
  };

  const logout = () => {
    setCurrentUserId(null);
    toast.success('Signed out successfully');
  };

  const updateProfile = (updates: Partial<UserAccount>) => {
    if (!currentUser) return;
    setStore((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u)),
      products:
        updates.name || updates.farmName
          ? prev.products.map((p) =>
              p.farmerId === currentUser.id
                ? {
                    ...p,
                    farmerName: updates.name ?? p.farmerName,
                    farmName: updates.farmName ?? p.farmName,
                  }
                : p
            )
          : prev.products,
    }));
    toast.success('Profile updated');
  };

  const addProduct = (input: NewProductInput): Product | null => {
    if (!currentUser || currentUser.role !== 'farmer') {
      toast.error('Only logged-in farmers can publish listings.');
      return null;
    }
    if (input.sellingPrice <= 0 || input.availableQuantity < 0 || input.minOrderQuantity <= 0) {
      toast.error('Price and minimum order quantity must be positive, and stock cannot be negative.');
      return null;
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmName: currentUser.farmName || `${currentUser.name}'s Farm`,
      ...input,
      status: input.availableQuantity > 0 ? 'active' : 'unavailable',
      createdAt: new Date().toISOString(),
      isDemoListing: false,
    };

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Product Listing Published',
      message: `${newProduct.name} (₹${newProduct.sellingPrice}/${newProduct.unit}) is now live in the marketplace.`,
      type: 'listing',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/farmer/products',
    };

    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      actorName: currentUser.name,
      actorRole: 'farmer',
      action: 'Listing Published',
      details: `Listed ${newProduct.name} (${newProduct.availableQuantity} ${newProduct.unit}) at ₹${newProduct.sellingPrice}.`,
      createdAt: new Date().toISOString(),
    };

    setStore((prev) => ({
      ...prev,
      products: [newProduct, ...prev.products],
      notifications: [notif, ...prev.notifications],
      activityLogs: [log, ...prev.activityLogs],
    }));

    toast.success(`Published "${newProduct.name}" to the marketplace!`);
    return newProduct;
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    if (updates.sellingPrice !== undefined && updates.sellingPrice <= 0) {
      toast.error('Selling price must be greater than zero.');
      return;
    }
    if (updates.availableQuantity !== undefined && updates.availableQuantity < 0) {
      toast.error('Available stock cannot be negative.');
      return;
    }

    setStore((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== productId) return p;
        const nextQty = updates.availableQuantity ?? p.availableQuantity;
        const nextStatus =
          updates.status ??
          (nextQty === 0 && p.status === 'active'
            ? 'unavailable'
            : nextQty > 0 && p.status === 'unavailable' && updates.availableQuantity !== undefined
            ? 'active'
            : p.status);
        return { ...p, ...updates, status: nextStatus };
      }),
    }));
    toast.success('Product listing updated');
  };

  const deleteProduct = (productId: string) => {
    const target = store.products.find((p) => p.id === productId);
    setStore((prev) => {
      const cleanedCarts: Record<string, CartItem[]> = {};
      for (const [k, items] of Object.entries(prev.cartByUser)) {
        cleanedCarts[k] = items.filter((i) => i.productId !== productId);
      }
      return {
        ...prev,
        products: prev.products.filter((p) => p.id !== productId),
        cartByUser: cleanedCarts,
        activityLogs: target
          ? [
              {
                id: `act-${Date.now()}`,
                actorName: currentUser?.name ?? 'Farmer',
                actorRole: currentUser?.role ?? 'farmer',
                action: 'Listing Deleted',
                details: `Removed listing "${target.name}".`,
                createdAt: new Date().toISOString(),
              },
              ...prev.activityLogs,
            ]
          : prev.activityLogs,
      };
    });
    toast.success('Product deleted');
  };

  const toggleProductAvailability = (productId: string) => {
    setStore((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== productId) return p;
        if (p.status === 'disabled_by_admin') {
          toast.error('This listing was disabled by an administrator.');
          return p;
        }
        const nextStatus = p.status === 'active' ? 'unavailable' : 'active';
        return { ...p, status: nextStatus };
      }),
    }));
  };

  const adminToggleProductStatus = (productId: string) => {
    const product = store.products.find((p) => p.id === productId);
    if (!product) return;
    const isCurrentlyDisabled = product.status === 'disabled_by_admin';
    const nextStatus = isCurrentlyDisabled ? 'active' : 'disabled_by_admin';

    setStore((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === productId ? { ...p, status: nextStatus } : p)),
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: product.farmerId,
          title: isCurrentlyDisabled ? 'Listing Restored by Admin' : 'Listing Disabled by Admin',
          message: isCurrentlyDisabled
            ? `Your listing "${product.name}" has been re-enabled in the marketplace.`
            : `Your listing "${product.name}" was temporarily disabled during demo moderation.`,
          type: 'system',
          read: false,
          createdAt: new Date().toISOString(),
          link: '/farmer/products',
        },
        ...prev.notifications,
      ],
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          actorName: currentUser?.name ?? 'Administrator',
          actorRole: 'admin',
          action: isCurrentlyDisabled ? 'Listing Re-enabled' : 'Listing Disabled',
          details: `${isCurrentlyDisabled ? 'Restored' : 'Disabled'} "${product.name}" by ${product.farmerName}.`,
          createdAt: new Date().toISOString(),
        },
        ...prev.activityLogs,
      ],
    }));

    toast.success(isCurrentlyDisabled ? 'Listing re-enabled' : 'Listing disabled');
  };

  const addToCart = (productId: string, quantity: number, orderType: 'retail' | 'wholesale'): boolean => {
    const product = store.products.find((p) => p.id === productId);
    if (!product) {
      toast.error('Product not found.');
      return false;
    }
    if (product.status !== 'active' || product.availableQuantity <= 0) {
      toast.error('This product is currently unavailable.');
      return false;
    }
    if (currentUser && product.farmerId === currentUser.id) {
      toast.error('Farmers cannot purchase their own produce listings.');
      return false;
    }
    if (currentUser && currentUser.role === 'admin') {
      toast.error('Switch to a Customer account to place orders.');
      return false;
    }

    const minQty =
      orderType === 'wholesale'
        ? product.wholesaleMinQty || Math.max(20, product.minOrderQuantity)
        : product.minOrderQuantity;

    if (quantity < minQty) {
      toast.error(`Minimum ${orderType} order quantity is ${minQty} ${product.unit}.`);
      return false;
    }

    const existing = cart.find((c) => c.productId === productId && c.orderType === orderType);
    const totalRequested = (existing?.quantity ?? 0) + quantity;
    if (totalRequested > product.availableQuantity) {
      toast.error(`Only ${product.availableQuantity} ${product.unit} available in stock.`);
      return false;
    }

    setStore((prev) => {
      const userCart = prev.cartByUser[activeCartKey] ?? [];
      const idx = userCart.findIndex((c) => c.productId === productId && c.orderType === orderType);
      const nextCart =
        idx >= 0
          ? userCart.map((item, i) =>
              i === idx ? { ...item, quantity: item.quantity + quantity } : item
            )
          : [...userCart, { productId, quantity, orderType }];
      return {
        ...prev,
        cartByUser: {
          ...prev.cartByUser,
          [activeCartKey]: nextCart,
        },
      };
    });

    toast.success(`Added ${quantity} ${product.unit} of ${product.name} to cart`);
    return true;
  };

  const updateCartItemQuantity = (
    productId: string,
    orderType: 'retail' | 'wholesale',
    quantity: number
  ) => {
    const product = store.products.find((p) => p.id === productId);
    if (!product) return;

    const minQty =
      orderType === 'wholesale'
        ? product.wholesaleMinQty || Math.max(20, product.minOrderQuantity)
        : product.minOrderQuantity;

    if (quantity < minQty) {
      toast.error(`Minimum ${orderType} quantity is ${minQty} ${product.unit}.`);
      return;
    }
    if (quantity > product.availableQuantity) {
      toast.error(`Only ${product.availableQuantity} ${product.unit} left in stock.`);
      return;
    }

    setStore((prev) => ({
      ...prev,
      cartByUser: {
        ...prev.cartByUser,
        [activeCartKey]: (prev.cartByUser[activeCartKey] ?? []).map((item) =>
          item.productId === productId && item.orderType === orderType
            ? { ...item, quantity }
            : item
        ),
      },
    }));
  };

  const removeFromCart = (productId: string, orderType: 'retail' | 'wholesale') => {
    setStore((prev) => ({
      ...prev,
      cartByUser: {
        ...prev.cartByUser,
        [activeCartKey]: (prev.cartByUser[activeCartKey] ?? []).filter(
          (item) => !(item.productId === productId && item.orderType === orderType)
        ),
      },
    }));
    toast.success('Removed item from cart');
  };

  const clearCart = () => {
    setStore((prev) => ({
      ...prev,
      cartByUser: {
        ...prev.cartByUser,
        [activeCartKey]: [],
      },
    }));
  };

  const placeOrder = (checkout: CheckoutInput) => {
    if (!currentUser) {
      return { ok: false, error: 'Please log in as a Customer to complete checkout.' };
    }
    if (currentUser.role === 'admin') {
      return { ok: false, error: 'Admin accounts cannot place marketplace orders.' };
    }
    if (cart.length === 0) {
      return { ok: false, error: 'Your shopping cart is empty.' };
    }

    // Re-validate every item against latest live stock & self-purchase rule
    const stockDeductions: Record<string, number> = {};
    const groupedByFarmer: Record<string, { farmerName: string; items: OrderItemSnapshot[] }> = {};

    for (const item of cart) {
      const product = store.products.find((p) => p.id === item.productId);
      if (!product || product.status !== 'active') {
        return { ok: false, error: `A product in your cart is no longer available.` };
      }
      if (product.farmerId === currentUser.id) {
        return { ok: false, error: `You cannot purchase your own listing (${product.name}).` };
      }
      const totalForProd = (stockDeductions[product.id] ?? 0) + item.quantity;
      if (totalForProd > product.availableQuantity) {
        return {
          ok: false,
          error: `Insufficient stock for ${product.name} (${product.availableQuantity} ${product.unit} available).`,
        };
      }
      stockDeductions[product.id] = totalForProd;

      const unitPrice =
        item.orderType === 'wholesale' && product.wholesalePrice
          ? product.wholesalePrice
          : product.sellingPrice;

      const snapshot: OrderItemSnapshot = {
        productId: product.id,
        productName: product.name,
        farmerId: product.farmerId,
        farmerName: product.farmerName,
        unit: product.unit,
        unitPrice,
        quantity: item.quantity,
        orderType: item.orderType,
        subtotal: unitPrice * item.quantity,
        image: product.image,
      };

      if (!groupedByFarmer[product.farmerId]) {
        groupedByFarmer[product.farmerId] = { farmerName: product.farmerName, items: [] };
      }
      groupedByFarmer[product.farmerId].items.push(snapshot);
    }

    const now = new Date().toISOString();
    const createdOrders: Order[] = [];
    const newNotifications: AppNotification[] = [];
    const newLogs: ActivityLog[] = [];

    Object.entries(groupedByFarmer).forEach(([farmerId, group]) => {
      const subtotal = group.items.reduce((sum, i) => sum + i.subtotal, 0);
      const isWholesaleOrder = group.items.some((i) => i.orderType === 'wholesale');
      const deliveryCharge = calculateDeliveryCharge(
        subtotal,
        checkout.fulfilmentOption,
        isWholesaleOrder
      );
      const orderId = generateDemoOrderId();

      const order: Order = {
        id: orderId,
        customerId: currentUser.id,
        customerName: checkout.customerName.trim(),
        customerPhone: checkout.customerPhone.trim(),
        deliveryAddress: checkout.deliveryAddress.trim(),
        district: checkout.district,
        farmerId,
        farmerName: group.farmerName,
        items: group.items,
        subtotal,
        deliveryCharge,
        totalAmount: subtotal + deliveryCharge,
        fulfilmentOption: checkout.fulfilmentOption,
        paymentMethod: checkout.paymentMethod,
        orderType: isWholesaleOrder ? 'wholesale' : 'retail',
        status: 'Pending',
        createdAt: now,
        updatedAt: now,
        isDemoOrder: false,
      };

      createdOrders.push(order);

      newNotifications.push({
        id: `notif-f-${orderId}`,
        userId: farmerId,
        title: 'New Order Received',
        message: `${order.customerName} placed ${order.orderType} order #${orderId} (₹${order.totalAmount}).`,
        type: 'order',
        read: false,
        createdAt: now,
        link: '/farmer/orders',
      });

      newNotifications.push({
        id: `notif-c-${orderId}`,
        userId: currentUser.id,
        title: 'Order Confirmed (Demo)',
        message: `Order #${orderId} with ${group.farmerName} (₹${order.totalAmount}) has been placed.`,
        type: 'order',
        read: false,
        createdAt: now,
        link: '/customer/orders',
      });

      newLogs.push({
        id: `act-${orderId}`,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'Order Placed',
        details: `Placed ${order.orderType} order #${orderId} (₹${order.totalAmount}) from ${group.farmerName}.`,
        createdAt: now,
      });
    });

    // Deduct stock and emit low stock warnings when <= 25 units left
    const updatedProducts = store.products.map((p) => {
      const deducted = stockDeductions[p.id];
      if (!deducted) return p;
      const remaining = Math.max(0, p.availableQuantity - deducted);
      if (remaining <= 25) {
        newNotifications.push({
          id: `notif-low-${p.id}-${Date.now()}`,
          userId: p.farmerId,
          title: 'Product Stock Running Low',
          message: `"${p.name}" has only ${remaining} ${p.unit} remaining after recent orders.`,
          type: 'stock',
          read: false,
          createdAt: now,
          link: '/farmer/products',
        });
      }
      return {
        ...p,
        availableQuantity: remaining,
        status: remaining === 0 ? ('unavailable' as const) : p.status,
      };
    });

    setStore((prev) => ({
      ...prev,
      products: updatedProducts,
      orders: [...createdOrders, ...prev.orders],
      notifications: [...newNotifications, ...prev.notifications],
      activityLogs: [...newLogs, ...prev.activityLogs],
      cartByUser: {
        ...prev.cartByUser,
        [activeCartKey]: [],
      },
    }));

    toast.success(
      createdOrders.length === 1
        ? `Order #${createdOrders[0].id} placed successfully!`
        : `${createdOrders.length} farm orders placed successfully!`
    );
    return { ok: true, orders: createdOrders };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const existing = store.orders.find((o) => o.id === orderId);
    if (!existing) return;

    const now = new Date().toISOString();
    const restoredStock = status === 'Cancelled' && existing.status !== 'Cancelled';

    setStore((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId ? { ...o, status, updatedAt: now } : o
      ),
      products: restoredStock
        ? prev.products.map((p) => {
            const matched = existing.items.find((i) => i.productId === p.id);
            if (!matched) return p;
            const nextQty = p.availableQuantity + matched.quantity;
            return {
              ...p,
              availableQuantity: nextQty,
              status: p.status === 'unavailable' && nextQty > 0 ? 'active' : p.status,
            };
          })
        : prev.products,
      notifications: [
        {
          id: `notif-st-${Date.now()}`,
          userId: existing.customerId,
          title: `Order ${status}`,
          message: `Order #${existing.id} from ${existing.farmerName} is now "${status}".`,
          type: 'order',
          read: false,
          createdAt: now,
          link: '/customer/orders',
        },
        ...prev.notifications,
      ],
      activityLogs: [
        {
          id: `act-st-${Date.now()}`,
          actorName: currentUser?.name ?? existing.farmerName,
          actorRole: currentUser?.role ?? 'farmer',
          action: `Order ${status}`,
          details: `Order #${existing.id} moved from ${existing.status} to ${status}.`,
          createdAt: now,
        },
        ...prev.activityLogs,
      ],
    }));

    toast.success(`Order #${orderId} updated to ${status}`);
  };

  const cancelOrder = (orderId: string) => {
    const existing = store.orders.find((o) => o.id === orderId);
    if (!existing) return;
    if (existing.status !== 'Pending') {
      toast.error('Only Pending orders can be cancelled by customers.');
      return;
    }

    const now = new Date().toISOString();
    setStore((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'Cancelled', updatedAt: now } : o
      ),
      products: prev.products.map((p) => {
        const matched = existing.items.find((i) => i.productId === p.id);
        if (!matched) return p;
        const nextQty = p.availableQuantity + matched.quantity;
        return {
          ...p,
          availableQuantity: nextQty,
          status: p.status === 'unavailable' && nextQty > 0 ? 'active' : p.status,
        };
      }),
      notifications: [
        {
          id: `notif-can-${Date.now()}`,
          userId: existing.farmerId,
          title: 'Order Cancelled by Customer',
          message: `${existing.customerName} cancelled pending order #${existing.id}. Stock has been restored.`,
          type: 'order',
          read: false,
          createdAt: now,
          link: '/farmer/orders',
        },
        ...prev.notifications,
      ],
      activityLogs: [
        {
          id: `act-can-${Date.now()}`,
          actorName: currentUser?.name ?? existing.customerName,
          actorRole: 'customer',
          action: 'Order Cancelled',
          details: `Cancelled pending order #${existing.id}; stock restored.`,
          createdAt: now,
        },
        ...prev.activityLogs,
      ],
    }));

    toast.success(`Order #${orderId} cancelled and farm stock restored.`);
  };

  const toggleFavourite = (productId: string) => {
    if (!currentUser) {
      toast.error('Log in to save favourite products.');
      return;
    }
    const currentFavs = currentUser.favouriteProductIds ?? [];
    const exists = currentFavs.includes(productId);
    const nextFavs = exists
      ? currentFavs.filter((id) => id !== productId)
      : [productId, ...currentFavs];

    setStore((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === currentUser.id ? { ...u, favouriteProductIds: nextFavs } : u
      ),
    }));

    toast.success(exists ? 'Removed from favourites' : 'Saved to favourites');
  };

  const submitReview = (
    orderId: string,
    productId: string,
    farmerId: string,
    rating: number,
    comment: string
  ) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const review: ProductReview = {
      id: `rev-${Date.now()}`,
      orderId,
      productId,
      farmerId,
      customerId: currentUser.id,
      customerName: currentUser.name,
      rating,
      comment: comment.trim(),
      createdAt: now,
    };

    setStore((prev) => ({
      ...prev,
      reviews: [review, ...prev.reviews],
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, reviewed: true } : o)),
      notifications: [
        {
          id: `notif-rev-${Date.now()}`,
          userId: farmerId,
          title: 'New Customer Review',
          message: `${currentUser.name} left a ${rating}/5 review on order #${orderId}.`,
          type: 'order',
          read: false,
          createdAt: now,
          link: '/farmer/orders',
        },
        ...prev.notifications,
      ],
    }));
    toast.success('Thank you! Your review has been published.');
  };

  const reportListing = (productId: string, reason: string) => {
    const product = store.products.find((p) => p.id === productId);
    if (!product) return;
    const now = new Date().toISOString();
    const report: ReportedListing = {
      id: `rep-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      farmerName: product.farmerName,
      reportedBy: currentUser?.name ?? 'Guest Visitor',
      reason: reason.trim(),
      status: 'open',
      createdAt: now,
    };

    setStore((prev) => ({
      ...prev,
      reports: [report, ...prev.reports],
      notifications: [
        {
          id: `notif-rep-${Date.now()}`,
          userId: 'admin-1',
          title: 'Listing Reported',
          message: `"${product.name}" was flagged: ${reason.trim().slice(0, 80)}`,
          type: 'system',
          read: false,
          createdAt: now,
          link: '/admin/reports',
        },
        ...prev.notifications,
      ],
    }));
    toast.success('Report submitted to the demo moderation queue.');
  };

  const updateReportStatus = (reportId: string, status: ReportedListing['status']) => {
    setStore((prev) => ({
      ...prev,
      reports: prev.reports.map((r) => (r.id === reportId ? { ...r, status } : r)),
    }));
    toast.success(`Report marked as ${status}`);
  };

  const resetDemoData = () => {
    const fresh = createInitialStore();
    setStore(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    // Keep admin logged in if they triggered reset
    toast.success('All demonstration data has been reset to defaults.');
  };

  const markNotificationRead = (notificationId: string) => {
    setStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.userId === currentUser.id ? { ...n, read: true } : n
      ),
    }));
  };

  const pushNotification = (
    userId: string,
    title: string,
    message: string,
    type: AppNotification['type'],
    link?: string
  ) => {
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      link,
    };
    setStore((prev) => ({
      ...prev,
      notifications: [notif, ...prev.notifications],
    }));
  };

  return (
    <AppDataContext.Provider
      value={{
        users: store.users,
        products: store.products,
        marketPrices: store.marketPrices,
        orders: store.orders,
        reviews: store.reviews,
        reports: store.reports,
        notifications: store.notifications,
        activityLogs: store.activityLogs,
        currentUser,
        cart,
        cartCount,
        userNotifications,
        unreadNotificationCount,
        login,
        register,
        logout,
        updateProfile,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        adminToggleProductStatus,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        updateOrderStatus,
        cancelOrder,
        toggleFavourite,
        submitReview,
        reportListing,
        updateReportStatus,
        resetDemoData,
        markNotificationRead,
        markAllNotificationsRead,
        pushNotification,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
