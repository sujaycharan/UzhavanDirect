import React, { useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Heart,
  History,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  User,
  XCircle,
} from 'lucide-react';
import { DashboardLayout, type SidebarNavItem } from '@/src/components/layout/DashboardLayout';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  ModalDialog,
  OrderStatusLabel,
  SafeImage,
  SelectField,
  Textarea,
} from '@/src/components/ui/primitives';
import { MarketplaceContent } from '@/src/pages/MarketplacePage';
import { CartCheckoutContent } from '@/src/pages/CartCheckoutPage';
import { useAppData } from '@/src/context/AppDataContext';
import { useLanguage } from '@/src/context/LanguageContext';
import {
  ORDER_STATUS_FLOW,
  TAMIL_NADU_DISTRICTS,
  UNIT_SHORT_MAP,
  type Order,
  type TamilNaduDistrict,
} from '@/src/types';
import { formatDate, formatINR } from '@/src/lib/utils';

/* ── Customer Overview ── */
function CustomerOverview() {
  const { currentUser, orders, products, addToCart } = useAppData();
  const navigate = useNavigate();

  const myOrders = orders.filter((o) => o.customerId === currentUser?.id);
  const pendingOrders = myOrders.filter((o) =>
    ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(o.status)
  );
  const completedOrders = myOrders.filter((o) => o.status === 'Delivered');
  const favProducts = products.filter((p) =>
    (currentUser?.favouriteProductIds ?? []).includes(p.id)
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-[#526058]">Total Orders</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-[#166534] tabular-nums">
            {myOrders.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[#526058]">Active / Pending Orders</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-[#A16207] tabular-nums">
            {pendingOrders.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[#526058]">Completed Orders</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-[#166534] tabular-nums">
            {completedOrders.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[#526058]">Favourite Products</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-[#1F2937] tabular-nums">
            {favProducts.length}
          </p>
        </Card>
      </div>

      {/* Recent Purchases */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-[#1F2937]">Recent Purchases</h2>
          <Link to="/customer/orders" className="text-xs font-semibold text-[#166534] hover:underline">
            Track All Orders →
          </Link>
        </div>

        {myOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="No purchases yet"
            description="Browse fresh farm produce listed directly by Tamil Nadu farmers."
            action={
              <Button onClick={() => navigate('/customer/marketplace')}>Explore Marketplace</Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2E8DF] text-xs text-[#526058]">
                  <th className="py-2.5 pr-4 font-medium">Order ID</th>
                  <th className="py-2.5 pr-4 font-medium">Farmer</th>
                  <th className="py-2.5 pr-4 font-medium">Items</th>
                  <th className="py-2.5 pr-4 font-medium text-right">Total</th>
                  <th className="py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2EB]">
                {myOrders.slice(0, 5).map((ord) => (
                  <tr key={ord.id}>
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#166534]">
                      #{ord.id}
                    </td>
                    <td className="py-3 pr-4 text-sm text-[#1F2937]">{ord.farmerName}</td>
                    <td className="py-3 pr-4 text-xs text-[#526058]">
                      {ord.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono font-semibold tabular-nums">
                      {formatINR(ord.totalAmount)}
                    </td>
                    <td className="py-3">
                      <OrderStatusLabel status={ord.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Favourite Products Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-[#1F2937]">
            Saved Favourite Produce
          </h2>
          <Link
            to="/customer/favourites"
            className="text-xs font-semibold text-[#166534] hover:underline"
          >
            View All Favourites →
          </Link>
        </div>

        {favProducts.length === 0 ? (
          <Card className="p-5 text-sm text-[#526058]">
            Tap the heart icon on any marketplace listing to save your favourite farm produce here.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {favProducts.slice(0, 3).map((p) => (
              <Card key={p.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`/product/${p.id}`}
                    className="font-display text-sm font-semibold text-[#1F2937] hover:text-[#166534] block truncate"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-[#526058] truncate">
                    {p.farmerName} · {p.district}
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold text-[#166534] tabular-nums">
                    {formatINR(p.sellingPrice)}/{UNIT_SHORT_MAP[p.unit]}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => addToCart(p.id, p.minOrderQuantity, 'retail')}
                >
                  Add
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Orders & Tracking View (Shared for Active Orders & Order History) ── */
function CustomerOrdersSection({ mode }: { mode: 'active' | 'history' }) {
  const { currentUser, orders, cancelOrder, submitReview } = useAppData();
  const navigate = useNavigate();

  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const filtered = orders.filter((o) => {
    if (o.customerId !== currentUser?.id) return false;
    if (mode === 'active') {
      return !['Delivered', 'Cancelled'].includes(o.status);
    }
    return ['Delivered', 'Cancelled'].includes(o.status);
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder || !comment.trim()) return;
    const firstItem = reviewOrder.items[0];
    if (!firstItem) return;
    submitReview(reviewOrder.id, firstItem.productId, reviewOrder.farmerId, rating, comment);
    setReviewOrder(null);
    setComment('');
    setRating(5);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-[#1F2937]">
          {mode === 'active'
            ? `Active Orders & Live Tracking (${filtered.length})`
            : `Order History (${filtered.length})`}
        </h2>
        <p className="text-sm text-[#526058]">
          {mode === 'active'
            ? 'Track fulfillment milestones updated directly by the farmer. Pending orders can be cancelled.'
            : 'View completed deliveries and leave farmer product reviews.'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={mode === 'active' ? <ShoppingBag className="h-6 w-6" /> : <History className="h-6 w-6" />}
          title={mode === 'active' ? 'No active orders right now' : 'No completed or cancelled orders yet'}
          description="Place a direct farm order from the marketplace to track it here."
          action={
            <Button onClick={() => navigate('/customer/marketplace')}>Explore Marketplace</Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((ord) => {
            const currentStepIdx = ORDER_STATUS_FLOW.indexOf(ord.status);

            return (
              <Card key={ord.id} className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EEF2EB] pb-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-[#166534]">#{ord.id}</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#1F2937]">
                      Farmer: {ord.farmerName}
                    </p>
                    <p className="text-xs text-[#526058]">
                      Placed {formatDate(ord.createdAt)} ·{' '}
                      {ord.fulfilmentOption === 'farmer_pickup' ? 'Farmer Pickup' : 'Local Delivery'}{' '}
                      · {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Demo Payment'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <OrderStatusLabel status={ord.status} />
                    <p className="font-mono text-base font-bold text-[#1F2937] tabular-nums">
                      {formatINR(ord.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Visual Tracking Stepper for non-cancelled orders */}
                {ord.status !== 'Cancelled' && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 py-2">
                    {ORDER_STATUS_FLOW.map((step, idx) => {
                      const reached = idx <= currentStepIdx;
                      return (
                        <div key={step} className="space-y-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              reached ? 'bg-[#166534]' : 'bg-[#E2E8DF]'
                            }`}
                          />
                          <p
                            className={`text-[11px] leading-tight ${
                              reached ? 'font-semibold text-[#166534]' : 'text-[#7A877D]'
                            }`}
                          >
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="divide-y divide-[#EEF2EB] text-sm">
                  {ord.items.map((it) => (
                    <div
                      key={`${it.productId}-${it.orderType}`}
                      className="py-2 flex items-center justify-between gap-3"
                    >
                      <span className="text-[#1F2937]">
                        {it.productName} ×{' '}
                        <strong className="font-mono tabular-nums">
                          {it.quantity} {UNIT_SHORT_MAP[it.unit]}
                        </strong>{' '}
                        ({it.orderType})
                      </span>
                      <span className="font-mono tabular-nums text-[#374151]">
                        {formatINR(it.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EEF2EB]">
                  <p className="text-xs text-[#6B786F]">
                    Delivery: {ord.deliveryAddress} ({ord.district})
                  </p>
                  <div className="flex items-center gap-2">
                    {ord.status === 'Pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#DC2626] border-[#FCA5A5] hover:bg-[#FEF2F2]"
                        onClick={() => setCancellingOrder(ord)}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancel Order
                      </Button>
                    )}
                    {ord.status === 'Delivered' && !ord.reviewed && (
                      <Button size="sm" variant="secondary" onClick={() => setReviewOrder(ord)}>
                        <Star className="h-3.5 w-3.5" />
                        Write Review
                      </Button>
                    )}
                    {ord.status === 'Delivered' && ord.reviewed && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#166534]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Reviewed
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancellingOrder)}
        onOpenChange={(o) => !o && setCancellingOrder(null)}
        title="Cancel Pending Order?"
        description={`Cancel order #${cancellingOrder?.id}? Reserved produce quantities will be returned to the farmer's live inventory.`}
        confirmLabel="Confirm Cancellation"
        destructive
        onConfirm={() => cancellingOrder && cancelOrder(cancellingOrder.id)}
      />

      <ModalDialog
        open={Boolean(reviewOrder)}
        onOpenChange={(o) => !o && setReviewOrder(null)}
        title={`Review Order #${reviewOrder?.id}`}
        description={`Share your experience with produce from ${reviewOrder?.farmerName}.`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating ? 'fill-[#EAB308] text-[#EAB308]' : 'text-[#D1DCCB]'
                    }`}
                  />
                </button>
              ))}
              <span className="font-mono text-xs font-semibold text-[#1F2937]">{rating}/5</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#374151]">Your Feedback *</label>
            <Textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the freshness, packaging, and direct farm pricing?"
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setReviewOrder(null)}>
              Cancel
            </Button>
            <Button type="submit">Publish Review</Button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}

/* ── Favourite Products ── */
function CustomerFavouritesView() {
  const { currentUser, products, toggleFavourite, addToCart } = useAppData();
  const navigate = useNavigate();

  const favs = products.filter(
    (p) =>
      (currentUser?.favouriteProductIds ?? []).includes(p.id) &&
      p.status !== 'disabled_by_admin'
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-[#1F2937]">
          Favourite Produce ({favs.length})
        </h2>
        <p className="text-sm text-[#526058]">
          Quickly re-order your favourite harvests from trusted Tamil Nadu farms.
        </p>
      </div>

      {favs.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="No saved favourites yet"
          description="Tap the heart button on any marketplace produce card to save it here."
          action={
            <Button onClick={() => navigate('/customer/marketplace')}>Browse Marketplace</Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favs.map((p) => (
            <Card key={p.id} className="overflow-hidden flex flex-col">
              <div className="aspect-[4/3] bg-[#EEF3EB]">
                <SafeImage
                  src={p.image}
                  alt={p.name}
                  fallbackLabel={p.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <p className="text-xs text-[#526058]">
                    {p.district} · {p.farmerName}
                  </p>
                  <Link
                    to={`/product/${p.id}`}
                    className="mt-1 font-display text-base font-semibold text-[#1F2937] hover:text-[#166534] block"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-1 font-mono text-base font-bold text-[#166534] tabular-nums">
                    {formatINR(p.sellingPrice)}/{UNIT_SHORT_MAP[p.unit]}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-[#EEF2EB]">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={p.status !== 'active' || p.availableQuantity <= 0}
                    onClick={() => addToCart(p.id, p.minOrderQuantity, 'retail')}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleFavourite(p.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Customer Profile ── */
function CustomerProfileView() {
  const { currentUser, updateProfile } = useAppData();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [district, setDistrict] = useState<TamilNaduDistrict>(currentUser?.district ?? 'Trichy');
  const [address, setAddress] = useState(currentUser?.address ?? '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      district,
      address: address.trim(),
    });
  };

  return (
    <Card className="max-w-xl p-6">
      <div className="border-b border-[#EEF2EB] pb-4">
        <h2 className="font-display text-lg font-semibold text-[#1F2937]">Customer Profile</h2>
        <p className="text-xs text-[#526058]">
          {currentUser?.email} ·{' '}
          {currentUser?.isDemoAccount ? 'Seeded Demo Customer Account' : 'User-Registered Account'}
        </p>
      </div>
      <form onSubmit={handleSave} className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#374151]">Full Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#374151]">Phone Number</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151]">District</label>
            <SelectField
              value={district}
              onChange={(e) => setDistrict(e.target.value as TamilNaduDistrict)}
              className="mt-1"
            >
              {TAMIL_NADU_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </SelectField>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#374151]">Default Delivery Address</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" />
        </div>
        <Button type="submit">Save Profile Changes</Button>
      </form>
    </Card>
  );
}

/* ── Main Customer Dashboard Router ── */
export function CustomerDashboard() {
  const { currentUser, cartCount, orders } = useAppData();
  const { t } = useLanguage();

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'customer') {
    return <Navigate to={currentUser.role === 'farmer' ? '/farmer' : '/admin'} replace />;
  }

  const activeOrderCount = orders.filter(
    (o) =>
      o.customerId === currentUser.id && !['Delivered', 'Cancelled'].includes(o.status)
  ).length;

  const navItems: SidebarNavItem[] = [
    { to: '/customer', label: t('overview'), icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/customer/marketplace', label: t('exploreMarketplace'), icon: <Store className="h-4 w-4" /> },
    {
      to: '/customer/cart',
      label: t('myCart'),
      icon: <ShoppingCart className="h-4 w-4" />,
      badge: cartCount,
    },
    {
      to: '/customer/orders',
      label: t('myOrders'),
      icon: <ShoppingBag className="h-4 w-4" />,
      badge: activeOrderCount,
    },
    { to: '/customer/history', label: t('orderHistory'), icon: <History className="h-4 w-4" /> },
    { to: '/customer/favourites', label: t('favourites'), icon: <Heart className="h-4 w-4" /> },
    { to: '/customer/profile', label: t('profile'), icon: <User className="h-4 w-4" /> },
  ];

  return (
    <Routes>
      <Route
        index
        element={
          <DashboardLayout roleTitle="Customer Dashboard" pageTitle={t('overview')} navItems={navItems}>
            <CustomerOverview />
          </DashboardLayout>
        }
      />
      <Route
        path="marketplace"
        element={
          <DashboardLayout roleTitle="Customer Dashboard" pageTitle={t('exploreMarketplace')} navItems={navItems}>
            <MarketplaceContent embedded />
          </DashboardLayout>
        }
      />
      <Route
        path="cart"
        element={
          <DashboardLayout roleTitle="Customer Dashboard" pageTitle={t('myCart')} navItems={navItems}>
            <CartCheckoutContent embedded />
          </DashboardLayout>
        }
      />
      <Route
        path="orders"
        element={
          <DashboardLayout roleTitle="Customer Dashboard" pageTitle={t('myOrders')} navItems={navItems}>
            <CustomerOrdersSection mode="active" />
          </DashboardLayout>
        }
      />
      <Route
        path="history"
        element={
          <DashboardLayout roleTitle="Customer Dashboard" pageTitle={t('orderHistory')} navItems={navItems}>
            <CustomerOrdersSection mode="history" />
          </DashboardLayout>
        }
      />
      <Route
        path="favourites"
        element={
          <DashboardLayout roleTitle="Customer Dashboard" pageTitle={t('favourites')} navItems={navItems}>
            <CustomerFavouritesView />
          </DashboardLayout>
        }
      />
      <Route
        path="profile"
        element={
          <DashboardLayout roleTitle="Customer Dashboard" pageTitle={t('profile')} navItems={navItems}>
            <CustomerProfileView />
          </DashboardLayout>
        }
      />
    </Routes>
  );
}
