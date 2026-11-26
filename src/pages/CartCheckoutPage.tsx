import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
} from 'lucide-react';
import { PublicLayout } from '@/src/components/layout/PublicLayout';
import {
  Button,
  Card,
  DisclaimerNotice,
  EmptyState,
  Input,
  SafeImage,
  SelectField,
} from '@/src/components/ui/primitives';
import { useAppData } from '@/src/context/AppDataContext';
import { useLanguage } from '@/src/context/LanguageContext';
import {
  TAMIL_NADU_DISTRICTS,
  UNIT_SHORT_MAP,
  type FulfilmentOption,
  type Order,
  type PaymentMethod,
  type TamilNaduDistrict,
} from '@/src/types';
import { calculateDeliveryCharge, formatINR } from '@/src/lib/utils';

export function CartCheckoutContent({ embedded = false }: { embedded?: boolean }) {
  const {
    cart,
    products,
    currentUser,
    updateCartItemQuantity,
    removeFromCart,
    placeOrder,
  } = useAppData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(currentUser?.name ?? '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone ?? '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address ?? '');
  const [district, setDistrict] = useState<TamilNaduDistrict>(currentUser?.district ?? 'Trichy');
  const [fulfilmentOption, setFulfilmentOption] = useState<FulfilmentOption>('local_delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [error, setError] = useState('');
  const [confirmedOrders, setConfirmedOrders] = useState<Order[] | null>(null);

  const enrichedItems = useMemo(() => {
    return cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        const unitPrice =
          item.orderType === 'wholesale' && product.wholesalePrice
            ? product.wholesalePrice
            : product.sellingPrice;
        return {
          ...item,
          product,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [cart, products]);

  const subtotal = enrichedItems.reduce((s, i) => s + i.lineTotal, 0);
  const hasWholesale = enrichedItems.some((i) => i.orderType === 'wholesale');
  const farmerGroupCount = new Set(enrichedItems.map((i) => i.product.farmerId)).size;

  // Delivery charge mirrors per-farmer split rule
  const estimatedDelivery = useMemo(() => {
    if (enrichedItems.length === 0) return 0;
    const byFarmer: Record<string, { sub: number; ws: boolean }> = {};
    for (const item of enrichedItems) {
      const fId = item.product.farmerId;
      if (!byFarmer[fId]) byFarmer[fId] = { sub: 0, ws: false };
      byFarmer[fId].sub += item.lineTotal;
      if (item.orderType === 'wholesale') byFarmer[fId].ws = true;
    }
    return Object.values(byFarmer).reduce(
      (sum, g) => sum + calculateDeliveryCharge(g.sub, fulfilmentOption, g.ws),
      0
    );
  }, [enrichedItems, fulfilmentOption]);

  const grandTotal = subtotal + estimatedDelivery;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setError('Please complete your name, demo phone number, and delivery address.');
      return;
    }

    const res = placeOrder({
      customerName,
      customerPhone,
      deliveryAddress,
      district,
      fulfilmentOption,
      paymentMethod,
    });

    if (!res.ok) {
      setError(res.error || 'Could not place order.');
      return;
    }

    setConfirmedOrders(res.orders ?? []);
  };

  if (confirmedOrders) {
    return (
      <div className={embedded ? 'space-y-6' : 'mx-auto max-w-3xl px-4 py-12 sm:px-6'}>
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-[#1F2937]">
                Order Confirmed (Demo)
              </h1>
              <p className="mt-1 text-sm text-[#526058]">
                Your direct farm order has been saved, product stock has been reduced, and the farmer's pending orders have been updated.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {confirmedOrders.map((ord) => (
              <div
                key={ord.id}
                className="rounded-xl border border-[#E2E8DF] bg-[#F8FAF5] p-4 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-[#166534]">
                    Order ID: #{ord.id}
                  </span>
                  <span className="text-xs font-medium text-[#526058]">
                    Farmer: {ord.farmerName} · {ord.fulfilmentOption === 'farmer_pickup' ? 'Farmer Pickup' : 'Local Delivery'}
                  </span>
                </div>
                <div className="divide-y divide-[#E2E8DF] text-sm">
                  {ord.items.map((it) => (
                    <div key={`${it.productId}-${it.orderType}`} className="py-2 flex justify-between">
                      <span>
                        {it.productName} × {it.quantity} {UNIT_SHORT_MAP[it.unit]} ({it.orderType})
                      </span>
                      <span className="font-mono tabular-nums">{formatINR(it.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#DCE5D8] flex justify-between text-sm font-semibold">
                  <span>Total ({ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Demo Payment'})</span>
                  <span className="font-mono text-[#166534] tabular-nums">
                    {formatINR(ord.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <DisclaimerNotice text={t('demoPaymentNote')} />

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/customer/orders')}>
              Track My Orders
            </Button>
            <Button variant="outline" onClick={() => navigate('/marketplace')}>
              Continue Shopping
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={embedded ? 'space-y-6' : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6'}>
      {!embedded && (
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F2937]">
            Shopping Cart & Demo Checkout
          </h1>
          <p className="mt-1 text-sm text-[#526058]">
            Review retail or wholesale produce quantities before placing your direct farm order.
          </p>
        </div>
      )}

      {enrichedItems.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="h-6 w-6" />}
          title="Your cart is empty"
          description="Browse fresh vegetables, fruits, grains, and spices listed directly by Tamil Nadu farmers."
          action={
            <Button onClick={() => navigate(embedded ? '/customer/marketplace' : '/marketplace')}>
              Explore Marketplace
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-7 space-y-4">
            {enrichedItems.map((item) => {
              const unitShort = UNIT_SHORT_MAP[item.product.unit];
              const minQty =
                item.orderType === 'wholesale'
                  ? item.product.wholesaleMinQty || Math.max(20, item.product.minOrderQuantity)
                  : item.product.minOrderQuantity;

              return (
                <Card key={`${item.productId}-${item.orderType}`} className="p-4 flex gap-4">
                  <Link
                    to={`/product/${item.product.id}`}
                    className="h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-[#EEF3EB]"
                  >
                    <SafeImage
                      src={item.product.image}
                      alt={item.product.name}
                      fallbackLabel={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-[#526058]">
                          {item.product.farmerName} · {item.product.district} ·{' '}
                          <span className="capitalize font-medium text-[#166534]">
                            {item.orderType}
                          </span>
                        </p>
                        <Link
                          to={`/product/${item.product.id}`}
                          className="font-display text-base font-semibold text-[#1F2937] hover:text-[#166534] line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeFromCart(item.productId, item.orderType)}
                        className="rounded-lg p-1.5 text-[#6B786F] hover:bg-[#FEF2F2] hover:text-[#DC2626] cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-lg border border-[#D5DFD0] bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItemQuantity(
                              item.productId,
                              item.orderType,
                              Math.max(minQty, item.quantity - 1)
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center hover:bg-[#F3F7F0] cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 font-mono text-xs font-semibold tabular-nums">
                          {item.quantity} {unitShort}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItemQuantity(
                              item.productId,
                              item.orderType,
                              Math.min(item.product.availableQuantity, item.quantity + 1)
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center hover:bg-[#F3F7F0] cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-[#166534] tabular-nums">
                          {formatINR(item.lineTotal)}
                        </p>
                        <p className="font-mono text-[11px] text-[#6B786F] tabular-nums">
                          {formatINR(item.unitPrice)}/{unitShort} · Stock: {item.product.availableQuantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {farmerGroupCount > 1 && (
              <DisclaimerNotice
                text={`Your cart includes produce from ${farmerGroupCount} different farmers. Separate synchronized farm orders will be generated automatically upon checkout.`}
              />
            )}
          </div>

          {/* Checkout Form & Order Summary */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="p-6 space-y-5">
              <h2 className="font-display text-lg font-semibold text-[#1F2937]">
                Order Summary & Checkout
              </h2>

              <div className="space-y-2 border-b border-[#EEF2EB] pb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#526058]">Items Subtotal</span>
                  <span className="font-mono font-medium tabular-nums">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#526058]">
                    Estimated Delivery ({fulfilmentOption === 'farmer_pickup' ? 'Pickup' : 'Local Rule'})
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    {estimatedDelivery === 0 ? 'Free' : formatINR(estimatedDelivery)}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B786F]">
                  Demo delivery rule: Free for Farmer Pickup or retail orders ≥ ₹1,000 ({hasWholesale ? 'wholesale ≥ ₹2,500' : '₹40–₹60 below threshold'}).
                </p>
                <div className="flex justify-between pt-2 border-t border-[#EEF2EB] text-base font-bold text-[#1F2937]">
                  <span>Final Total</span>
                  <span className="font-mono text-[#166534] tabular-nums">
                    {formatINR(grandTotal)}
                  </span>
                </div>
              </div>

              {!currentUser ? (
                <div className="space-y-3">
                  <DisclaimerNotice
                    tone="warning"
                    text="Please sign in with the Demo Customer account (or register) to complete checkout and track your orders."
                  />
                  <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
                    Sign In to Complete Order
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#374151]">Customer Name *</label>
                    <Input
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#374151]">
                        Phone Number (Demo) *
                      </label>
                      <Input
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98401 00000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#374151]">District *</label>
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
                    <label className="block text-xs font-medium text-[#374151]">Delivery Address *</label>
                    <Input
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Door No, Street, Area, PIN"
                      className="mt-1"
                    />
                  </div>

                  {/* Fulfilment Option */}
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1.5">
                      Fulfilment Option
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFulfilmentOption('local_delivery')}
                        className={`rounded-lg border p-2.5 text-left text-xs transition-colors cursor-pointer ${
                          fulfilmentOption === 'local_delivery'
                            ? 'border-[#166534] bg-[#EEF4EB] text-[#166534] font-semibold'
                            : 'border-[#D5DFD0] text-[#374151]'
                        }`}
                      >
                        <Truck className="h-4 w-4 mb-1" />
                        Local Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setFulfilmentOption('farmer_pickup')}
                        className={`rounded-lg border p-2.5 text-left text-xs transition-colors cursor-pointer ${
                          fulfilmentOption === 'farmer_pickup'
                            ? 'border-[#166534] bg-[#EEF4EB] text-[#166534] font-semibold'
                            : 'border-[#D5DFD0] text-[#374151]'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4 mb-1" />
                        Farmer Pickup (₹0)
                      </button>
                    </div>
                  </div>

                  {/* Simulated Payment Method */}
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1.5">
                      Payment Method (Simulated)
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2.5 rounded-lg border border-[#D5DFD0] px-3 py-2.5 text-xs cursor-pointer hover:bg-[#F8FAF5]">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="accent-[#166534]"
                        />
                        <span>Cash on Delivery (Simulated)</span>
                      </label>
                      <label className="flex items-center gap-2.5 rounded-lg border border-[#D5DFD0] px-3 py-2.5 text-xs cursor-pointer hover:bg-[#F8FAF5]">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'demo_upi'}
                          onChange={() => setPaymentMethod('demo_upi')}
                          className="accent-[#166534]"
                        />
                        <span>Demo Instant Payment (No real transaction)</span>
                      </label>
                    </div>
                  </div>

                  {error && (
                    <p role="alert" className="text-xs font-medium text-[#DC2626]">
                      {error}
                    </p>
                  )}

                  <Button type="submit" className="w-full" size="lg">
                    Place Demo Order · {formatINR(grandTotal)}
                  </Button>

                  <DisclaimerNotice text={t('demoPaymentNote')} />
                </form>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export function CartCheckoutPage() {
  return (
    <PublicLayout>
      <CartCheckoutContent />
    </PublicLayout>
  );
}
