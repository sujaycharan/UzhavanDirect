import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Flag,
  Heart,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  User,
} from 'lucide-react';
import { PublicLayout } from '@/src/components/layout/PublicLayout';
import {
  Button,
  Card,
  DisclaimerNotice,
  EmptyState,
  ModalDialog,
  SafeImage,
  Textarea,
} from '@/src/components/ui/primitives';
import { useAppData } from '@/src/context/AppDataContext';
import { UNIT_SHORT_MAP } from '@/src/types';
import { formatDate, formatINR } from '@/src/lib/utils';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    products,
    users,
    reviews,
    marketPrices,
    currentUser,
    addToCart,
    toggleFavourite,
    reportListing,
  } = useAppData();

  const product = products.find((p) => p.id === id);

  const [orderType, setOrderType] = useState<'retail' | 'wholesale'>(
    product?.retailAvailable ? 'retail' : 'wholesale'
  );

  const effectiveMinQty = useMemo(() => {
    if (!product) return 1;
    return orderType === 'wholesale'
      ? product.wholesaleMinQty || Math.max(20, product.minOrderQuantity)
      : product.minOrderQuantity;
  }, [product, orderType]);

  const [quantity, setQuantity] = useState<number>(() => product?.minOrderQuantity ?? 1);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  if (!product) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-4xl px-4 py-16">
          <EmptyState
            icon={<ShoppingCart className="h-6 w-6" />}
            title="Product listing not found"
            description="This listing may have been removed by the farmer or reset."
            action={<Button onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>}
          />
        </div>
      </PublicLayout>
    );
  }

  const farmer = users.find((u) => u.id === product.farmerId);
  const unitShort = UNIT_SHORT_MAP[product.unit];
  const isAvailable = product.status === 'active' && product.availableQuantity > 0;
  const isOwnListing = currentUser?.id === product.farmerId;
  const isFav = (currentUser?.favouriteProductIds ?? []).includes(product.id);

  const activePrice =
    orderType === 'wholesale' && product.wholesalePrice
      ? product.wholesalePrice
      : product.sellingPrice;

  const comparableListings = products.filter(
    (p) =>
      p.id !== product.id &&
      p.cropKey === product.cropKey &&
      p.status === 'active' &&
      p.availableQuantity > 0
  );

  const marketRef = marketPrices.find((m) => m.cropKey === product.cropKey);
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const avgRating =
    productReviews.length > 0
      ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1)
      : null;

  const switchMode = (nextMode: 'retail' | 'wholesale') => {
    setOrderType(nextMode);
    const nextMin =
      nextMode === 'wholesale'
        ? product.wholesaleMinQty || Math.max(20, product.minOrderQuantity)
        : product.minOrderQuantity;
    setQuantity(Math.min(product.availableQuantity || nextMin, nextMin));
  };

  const handleAdd = (goToCheckout = false) => {
    const ok = addToCart(product.id, quantity, orderType);
    if (ok && goToCheckout) {
      navigate(currentUser?.role === 'customer' ? '/customer/cart' : '/cart');
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    reportListing(product.id, reportReason);
    setReportReason('');
    setReportOpen(false);
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#526058] hover:text-[#166534] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </button>

        {/* Sticky Gallery Left + Contiguous Purchase Module Right */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-[#E2E8DF] bg-[#EEF3EB] aspect-[4/3]">
              <SafeImage
                src={product.image}
                alt={product.name}
                fallbackLabel={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            <Card className="p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-[#1F2937]">
                Harvest Details & Description
              </h2>
              <p className="text-sm leading-relaxed text-[#4B594F]">{product.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#EEF2EB] text-sm">
                <div>
                  <p className="text-xs text-[#6B786F]">Harvest Date</p>
                  <p className="mt-0.5 font-medium text-[#1F2937] flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#166534]" />
                    {formatDate(product.harvestDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B786F]">District</p>
                  <p className="mt-0.5 font-medium text-[#1F2937] flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#166534]" />
                    {product.district}, Tamil Nadu
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B786F]">Quality Grade</p>
                  <p className="mt-0.5 font-medium text-[#1F2937]">{product.quality}</p>
                </div>
              </div>
            </Card>

            {/* Farmer Profile Card */}
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF4EB] text-[#166534]">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#526058]">Direct Farmer Profile</p>
                    <h3 className="font-display text-base font-semibold text-[#1F2937]">
                      {product.farmerName} · {product.farmName}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#6B786F]">
                      {product.district} District
                      {farmer?.farmSizeAcres ? ` · ${farmer.farmSizeAcres} Acres` : ''}
                      {farmer?.farmingExperienceYears
                        ? ` · ${farmer.farmingExperienceYears} Years Experience`
                        : ''}
                      {' · '}
                      {farmer?.isDemoAccount ? 'Demo Farmer Profile' : 'Registered Farmer'}
                    </p>
                  </div>
                </div>
              </div>
              {farmer?.bio && (
                <p className="mt-3 text-sm text-[#4B594F] leading-relaxed">{farmer.bio}</p>
              )}
            </Card>
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
            <Card className="p-6 space-y-5">
              <div>
                <p className="text-xs text-[#526058]">
                  {product.category} · {product.district}
                  {avgRating ? ` · ★ ${avgRating} (${productReviews.length} review${productReviews.length === 1 ? '' : 's'})` : ''}
                </p>
                <h1 className="mt-1.5 font-display text-2xl font-bold text-[#1F2937]">
                  {product.name}
                </h1>
              </div>

              {/* Retail / Wholesale Switcher */}
              {product.retailAvailable && product.wholesaleAvailable && (
                <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-[#EEF4EB] p-1">
                  <button
                    type="button"
                    onClick={() => switchMode('retail')}
                    className={`rounded-md py-2 text-xs font-medium transition-colors cursor-pointer ${
                      orderType === 'retail'
                        ? 'bg-white text-[#166534] font-semibold shadow-xs'
                        : 'text-[#4B594F]'
                    }`}
                  >
                    Retail ({formatINR(product.sellingPrice)}/{unitShort})
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('wholesale')}
                    className={`rounded-md py-2 text-xs font-medium transition-colors cursor-pointer ${
                      orderType === 'wholesale'
                        ? 'bg-white text-[#166534] font-semibold shadow-xs'
                        : 'text-[#4B594F]'
                    }`}
                  >
                    Wholesale ({formatINR(product.wholesalePrice || product.sellingPrice)}/{unitShort})
                  </button>
                </div>
              )}

              {/* Price & Availability */}
              <div className="flex items-baseline justify-between border-y border-[#EEF2EB] py-4">
                <div>
                  <p className="font-mono text-3xl font-bold text-[#166534] tabular-nums">
                    {formatINR(activePrice)}
                    <span className="text-sm font-normal text-[#526058]"> / {product.unit}</span>
                  </p>
                  <p className="mt-1 text-xs text-[#6B786F] tabular-nums">
                    Minimum {orderType} order: {effectiveMinQty} {unitShort}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-semibold ${
                      isAvailable ? 'text-[#166534]' : 'text-[#DC2626]'
                    }`}
                  >
                    {isAvailable ? 'In Stock' : 'Unavailable'}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-[#526058] tabular-nums">
                    {product.availableQuantity} {unitShort} available
                  </p>
                </div>
              </div>

              {/* Simulated Reference Price Context */}
              {marketRef && (
                <div className="rounded-lg bg-[#F4F8F2] p-3 text-xs text-[#3F4F44]">
                  <p>
                    Simulated reference benchmark for {marketRef.crop}:{' '}
                    <strong className="font-mono tabular-nums">
                      {formatINR(marketRef.referencePrice)}/{unitShort}
                    </strong>{' '}
                    (range {formatINR(marketRef.suggestedMin)}–{formatINR(marketRef.suggestedMax)}).
                  </p>
                  <p className="mt-1 text-[11px] text-[#6B786F]">
                    Demo market data – not live market prices.
                  </p>
                </div>
              )}

              {/* Quantity Stepper */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-[#374151]">
                  <span>Select Quantity ({product.unit})</span>
                  <span className="font-mono tabular-nums">
                    Line Total: {formatINR(activePrice * quantity)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="inline-flex items-center rounded-lg border border-[#D5DFD0] bg-white">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={quantity <= effectiveMinQty}
                      onClick={() => setQuantity((q) => Math.max(effectiveMinQty, q - 1))}
                      className="flex h-10 w-10 items-center justify-center text-[#374151] hover:bg-[#F3F7F0] disabled:opacity-40 cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min={effectiveMinQty}
                      max={product.availableQuantity}
                      value={quantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!Number.isNaN(val)) {
                          setQuantity(
                            Math.max(effectiveMinQty, Math.min(product.availableQuantity, val))
                          );
                        }
                      }}
                      className="h-10 w-20 border-x border-[#E2E8DF] text-center font-mono text-sm font-semibold text-[#1F2937] tabular-nums focus:outline-none"
                    />
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={quantity >= product.availableQuantity}
                      onClick={() =>
                        setQuantity((q) => Math.min(product.availableQuantity, q + 1))
                      }
                      className="flex h-10 w-10 items-center justify-center text-[#374151] hover:bg-[#F3F7F0] disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {isOwnListing && (
                <DisclaimerNotice
                  tone="warning"
                  text="This is your own produce listing. Farmers cannot purchase their own listings."
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  disabled={!isAvailable || isOwnListing}
                  onClick={() => handleAdd(false)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  disabled={!isAvailable || isOwnListing}
                  onClick={() => handleAdd(true)}
                >
                  Buy Now
                </Button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#EEF2EB] text-xs">
                <button
                  type="button"
                  onClick={() => toggleFavourite(product.id)}
                  className="inline-flex items-center gap-1.5 font-medium text-[#374151] hover:text-[#166534] cursor-pointer"
                >
                  <Heart
                    className={`h-4 w-4 ${isFav ? 'fill-[#DC2626] text-[#DC2626]' : ''}`}
                  />
                  {isFav ? 'Saved in Favourites' : 'Save to Favourites'}
                </button>
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[#6B786F] hover:text-[#DC2626] cursor-pointer"
                >
                  <Flag className="h-3.5 w-3.5" />
                  Report Listing
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* Multi-Farmer Price Comparison */}
        {comparableListings.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#1F2937]">
                Compare Other Farmers Selling Similar Produce
              </h2>
              <p className="text-sm text-[#526058]">
                Direct price and harvest transparency across Tamil Nadu districts.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {comparableListings.map((other) => {
                const diff = other.sellingPrice - product.sellingPrice;
                return (
                  <Card key={other.id} className="p-4 flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#526058]">
                        {other.district} · {other.quality}
                      </p>
                      <h3 className="mt-1 font-display text-base font-semibold text-[#1F2937]">
                        {other.name}
                      </h3>
                      <p className="text-xs text-[#6B786F]">
                        {other.farmerName} ({other.farmName})
                      </p>
                    </div>
                    <div className="flex items-end justify-between pt-3 border-t border-[#EEF2EB]">
                      <div>
                        <p className="font-mono text-lg font-semibold text-[#166534] tabular-nums">
                          {formatINR(other.sellingPrice)}/{UNIT_SHORT_MAP[other.unit]}
                        </p>
                        <p className="text-xs text-[#526058] tabular-nums">
                          {diff === 0
                            ? 'Same price'
                            : diff < 0
                            ? `${formatINR(Math.abs(diff))} lower`
                            : `${formatINR(diff)} higher`}
                        </p>
                      </div>
                      <Link
                        to={`/product/${other.id}`}
                        className="text-xs font-semibold text-[#166534] hover:underline"
                      >
                        Compare →
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Customer Reviews */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-[#1F2937]">
            Customer Reviews ({productReviews.length})
          </h2>
          {productReviews.length === 0 ? (
            <Card className="p-6 text-sm text-[#526058]">
              No customer reviews yet for this lot. Completed orders can be reviewed from the Customer Dashboard.
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {productReviews.map((rev) => (
                <Card key={rev.id} className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1F2937]">{rev.customerName}</span>
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#CA8A04]">
                      <Star className="h-3.5 w-3.5 fill-[#EAB308] text-[#EAB308]" />
                      {rev.rating}/5
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#4B594F] leading-relaxed">{rev.comment}</p>
                  <p className="mt-2 text-xs text-[#7A877D]">{formatDate(rev.createdAt)}</p>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Report Listing Modal */}
        <ModalDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          title="Report Produce Listing"
          description="Submit a demo moderation note for the platform administrator to review."
        >
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937]">Reason for report</label>
              <Textarea
                required
                rows={3}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe pricing discrepancy, missing harvest details, or stock concern..."
                className="mt-1.5"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setReportOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Report</Button>
            </div>
          </form>
        </ModalDialog>
      </div>
    </PublicLayout>
  );
}
