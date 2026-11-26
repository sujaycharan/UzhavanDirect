import React, { useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bot,
  CloudRain,
  Compass,
  Edit3,
  Eye,
  FlaskConical,
  IndianRupee,
  LayoutDashboard,
  Package,
  PlusCircle,
  ShieldAlert,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Upload,
  User,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardLayout, type SidebarNavItem } from '@/src/components/layout/DashboardLayout';
import {
  Button,
  Card,
  ConfirmDialog,
  DisclaimerNotice,
  EmptyState,
  Input,
  ModalDialog,
  OrderStatusLabel,
  SafeImage,
  SelectField,
  Textarea,
} from '@/src/components/ui/primitives';
import {
  AgriAssistantPanel,
  CropRecommendationPanel,
  DiseaseRiskPanel,
  FertilizerGuidePanel,
  WeatherDashboardPanel,
} from '@/src/components/smart-agri/SmartAgriModules';
import { useAppData } from '@/src/context/AppDataContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { ASSET_IMAGES, PRESET_PRODUCE_IMAGES } from '@/src/data/seedData';
import { SIMULATED_WEATHER, getWeatherAlerts } from '@/src/data/smartAgriData';
import {
  MEASUREMENT_UNITS,
  ORDER_STATUS_FLOW,
  PRODUCT_CATEGORIES,
  PRODUCT_QUALITIES,
  TAMIL_NADU_DISTRICTS,
  UNIT_SHORT_MAP,
  type MeasurementUnit,
  type OrderStatus,
  type Product,
  type ProductCategory,
  type ProductQuality,
  type TamilNaduDistrict,
} from '@/src/types';
import { compressImageFile, formatDate, formatINR } from '@/src/lib/utils';
import { toast } from 'sonner';

function getPriceComparison(sellingPrice: number, min: number, max: number) {
  if (!sellingPrice || sellingPrice <= 0) {
    return { label: 'Enter price', tone: 'text-[#6B786F]' };
  }
  if (sellingPrice < min) {
    return { label: 'Below suggested range (Fast-moving)', tone: 'text-[#1D4ED8]' };
  }
  if (sellingPrice <= max) {
    return { label: 'Competitive within suggested range', tone: 'text-[#166534]' };
  }
  return { label: 'Above suggested demo range', tone: 'text-[#A16207]' };
}

/* ── Farmer Overview ── */
function FarmerOverview() {
  const { currentUser, products, orders } = useAppData();
  const navigate = useNavigate();

  const myProducts = products.filter((p) => p.farmerId === currentUser?.id);
  const activeListings = myProducts.filter((p) => p.status === 'active');
  const myOrders = orders.filter((o) => o.farmerId === currentUser?.id);
  const pendingOrders = myOrders.filter((o) =>
    ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(o.status)
  );
  const completedOrders = myOrders.filter((o) => o.status === 'Delivered');
  const nonCancelledOrders = myOrders.filter((o) => o.status !== 'Cancelled');
  const totalSales = nonCancelledOrders.reduce((s, o) => s + o.subtotal, 0);
  const completedEarnings = completedOrders.reduce((s, o) => s + o.subtotal, 0);

  // Sales chart grouped by product
  const productSalesData = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; qty: number }> = {};
    for (const ord of nonCancelledOrders) {
      for (const it of ord.items) {
        const shortName = it.productName.split('(')[0].trim().slice(0, 18);
        if (!map[it.productId]) map[it.productId] = { name: shortName, revenue: 0, qty: 0 };
        map[it.productId].revenue += it.subtotal;
        map[it.productId].qty += it.quantity;
      }
    }
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [nonCancelledOrders]);

  const weatherDistrict =
    currentUser?.district &&
    ['Trichy', 'Thanjavur', 'Madurai', 'Salem'].includes(currentUser.district)
      ? (currentUser.district as 'Trichy' | 'Thanjavur' | 'Madurai' | 'Salem')
      : 'Trichy';
  const weather = SIMULATED_WEATHER[weatherDistrict];
  const weatherAlerts = getWeatherAlerts(weather);

  return (
    <div className="space-y-6">
      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {[
          { label: 'Total Products', value: myProducts.length, sub: 'All lots' },
          { label: 'Active Listings', value: activeListings.length, sub: 'Live in market' },
          { label: 'Pending Orders', value: pendingOrders.length, sub: 'Needs fulfillment' },
          { label: 'Completed Orders', value: completedOrders.length, sub: 'Delivered' },
          { label: 'Total Sales', value: formatINR(totalSales), sub: 'Active + delivered' },
          { label: 'Estimated Earnings', value: formatINR(completedEarnings), sub: 'Completed lots' },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-xs text-[#526058]">{kpi.label}</p>
            <p className="mt-1.5 font-mono text-xl font-bold text-[#166534] tabular-nums">
              {kpi.value}
            </p>
            <p className="mt-0.5 text-[11px] text-[#6B786F]">{kpi.sub}</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => navigate('/farmer/add-product')}>
          <PlusCircle className="h-4 w-4" />
          Add New Produce
        </Button>
        <Button variant="outline" onClick={() => navigate('/farmer/orders')}>
          Manage Incoming Orders ({pendingOrders.length})
        </Button>
        <Button variant="outline" onClick={() => navigate('/farmer/market-prices')}>
          Check Market Prices
        </Button>
        <Button variant="outline" onClick={() => navigate('/farmer/crop-recommendation')}>
          <Compass className="h-4 w-4 text-[#166534]" />
          Crop Recommendation
        </Button>
        <Button variant="outline" onClick={() => navigate('/farmer/smart-agriculture')}>
          Ask Agri Assistant
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sales Analytics Chart */}
        <Card className="lg:col-span-7 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-[#1F2937]">
                Top-Selling Produce Revenue
              </h2>
              <p className="text-xs text-[#526058]">Calculated dynamically from live LocalStorage orders</p>
            </div>
            <Link
              to="/farmer/analytics"
              className="text-xs font-semibold text-[#166534] hover:underline"
            >
              Full Analytics →
            </Link>
          </div>
          {productSalesData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-[#6B786F]">
              No sales recorded yet. Publish produce listings to receive customer orders.
            </div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EEE4" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#526058' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#526058' }} />
                  <Tooltip formatter={(val) => [formatINR(Number(val ?? 0)), 'Sales']} />
                  <Bar dataKey="revenue" fill="#166534" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Weather & Agricultural Alerts Summary */}
        <Card className="lg:col-span-5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#1F2937]">
                Weather & Crop Alerts ({weather.district})
              </h2>
              <p className="text-[11px] text-[#6B786F]">Simulated weather data for demonstration</p>
            </div>
            <Link
              to="/farmer/weather"
              className="text-xs font-semibold text-[#166534] hover:underline"
            >
              7-Day View →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#F4F8F2] p-3 text-center">
            <div>
              <p className="text-[11px] text-[#526058]">Temp</p>
              <p className="font-mono text-base font-bold text-[#1F2937] tabular-nums">
                {weather.temperature}°C
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#526058]">Humidity</p>
              <p className="font-mono text-base font-bold text-[#1F2937] tabular-nums">
                {weather.humidity}%
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#526058]">Rain Prob</p>
              <p className="font-mono text-base font-bold text-[#166534] tabular-nums">
                {weather.rainProbability}%
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {weatherAlerts.slice(0, 2).map((al) => (
              <div key={al.id} className="rounded-lg border border-[#E2E8DF] p-3 text-xs">
                <p className="font-semibold text-[#1F2937]">{al.title}</p>
                <p className="mt-0.5 text-[#526058]">{al.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-[#1F2937]">
            Recent Incoming Orders
          </h2>
          <Link to="/farmer/orders" className="text-xs font-semibold text-[#166534] hover:underline">
            View All Orders →
          </Link>
        </div>

        {myOrders.length === 0 ? (
          <p className="text-sm text-[#526058] py-4">No orders received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2E8DF] text-xs text-[#526058]">
                  <th className="py-2.5 pr-4 font-medium">Order ID</th>
                  <th className="py-2.5 pr-4 font-medium">Customer</th>
                  <th className="py-2.5 pr-4 font-medium">Items</th>
                  <th className="py-2.5 pr-4 font-medium text-right">Amount</th>
                  <th className="py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2EB]">
                {myOrders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAFDF8]">
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#166534]">
                      #{ord.id}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-[#1F2937]">{ord.customerName}</p>
                      <p className="text-xs text-[#6B786F]">{ord.district} · {ord.orderType}</p>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#4B594F]">
                      {ord.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono font-semibold tabular-nums">
                      {formatINR(ord.subtotal)}
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
    </div>
  );
}

/* ── Product Creation / Edit Form ── */
function FarmerProductForm({
  editingProduct,
  onDone,
}: {
  editingProduct?: Product;
  onDone?: () => void;
}) {
  const { currentUser, marketPrices, addProduct, updateProduct } = useAppData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState(editingProduct?.name ?? '');
  const [cropKey, setCropKey] = useState(editingProduct?.cropKey ?? 'tomato');
  const [category, setCategory] = useState<ProductCategory>(editingProduct?.category ?? 'Vegetables');
  const [description, setDescription] = useState(editingProduct?.description ?? '');
  const [image, setImage] = useState(editingProduct?.image ?? ASSET_IMAGES.tomatoes);
  const [availableQuantity, setAvailableQuantity] = useState(
    String(editingProduct?.availableQuantity ?? 100)
  );
  const [unit, setUnit] = useState<MeasurementUnit>(editingProduct?.unit ?? 'Kilogram');
  const [sellingPrice, setSellingPrice] = useState(String(editingProduct?.sellingPrice ?? 25));
  const [wholesalePrice, setWholesalePrice] = useState(
    String(editingProduct?.wholesalePrice ?? 21)
  );
  const [minOrderQuantity, setMinOrderQuantity] = useState(
    String(editingProduct?.minOrderQuantity ?? 1)
  );
  const [wholesaleMinQty, setWholesaleMinQty] = useState(
    String(editingProduct?.wholesaleMinQty ?? 25)
  );
  const [harvestDate, setHarvestDate] = useState(
    editingProduct?.harvestDate ?? new Date().toISOString().slice(0, 10)
  );
  const [district, setDistrict] = useState<TamilNaduDistrict>(
    editingProduct?.district ?? currentUser?.district ?? 'Trichy'
  );
  const [quality, setQuality] = useState<ProductQuality>(
    editingProduct?.quality ?? 'Farm Fresh Grade A'
  );
  const [retailAvailable, setRetailAvailable] = useState(editingProduct?.retailAvailable ?? true);
  const [wholesaleAvailable, setWholesaleAvailable] = useState(
    editingProduct?.wholesaleAvailable ?? true
  );
  const [error, setError] = useState('');

  const matchedRef = marketPrices.find((m) => m.cropKey === cropKey);
  const priceNum = Number(sellingPrice);
  const comparison = matchedRef
    ? getPriceComparison(priceNum, matchedRef.suggestedMin, matchedRef.suggestedMax)
    : null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file);
      setImage(dataUrl);
      toast.success('Photo uploaded and optimized for prototype storage');
    } catch {
      toast.error('Could not process that image file.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const qty = Number(availableQuantity);
    const price = Number(sellingPrice);
    const wsPrice = Number(wholesalePrice);
    const moq = Number(minOrderQuantity);
    const wsMoq = Number(wholesaleMinQty);

    if (!name.trim() || !description.trim()) {
      setError('Product name and description are required.');
      return;
    }
    if (Number.isNaN(price) || price <= 0) {
      setError('Selling price must be greater than ₹0.');
      return;
    }
    if (Number.isNaN(qty) || qty < 0) {
      setError('Available stock cannot be negative.');
      return;
    }
    if (Number.isNaN(moq) || moq <= 0) {
      setError('Minimum order quantity must be at least 1.');
      return;
    }
    if (!retailAvailable && !wholesaleAvailable) {
      setError('Enable at least one of Retail or Wholesale availability.');
      return;
    }
    if (wholesaleAvailable && (Number.isNaN(wsPrice) || wsPrice <= 0)) {
      setError('Enter a valid positive wholesale price.');
      return;
    }

    const payload = {
      name: name.trim(),
      cropKey,
      category,
      description: description.trim(),
      image,
      availableQuantity: qty,
      unit,
      sellingPrice: price,
      wholesalePrice: wholesaleAvailable ? wsPrice : undefined,
      minOrderQuantity: moq,
      wholesaleMinQty: wholesaleAvailable ? Math.max(moq, wsMoq || 20) : undefined,
      harvestDate,
      district,
      quality,
      retailAvailable,
      wholesaleAvailable,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      onDone?.();
    } else {
      const created = addProduct(payload);
      if (created) navigate('/farmer/products');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
      <Card className="lg:col-span-8 p-6">
        <h2 className="font-display text-lg font-semibold text-[#1F2937]">
          {editingProduct ? `Edit "${editingProduct.name}"` : 'Create New Produce Listing'}
        </h2>
        <p className="mt-1 text-xs text-[#526058]">
          Published listings appear immediately in the Customer Marketplace and sync via LocalStorage.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#374151]">Product Name *</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Fresh Country Tomato (Nattu Thakkali)"
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151]">
                Crop Reference (for Price Advice & Comparison)
              </label>
              <SelectField
                value={cropKey}
                onChange={(e) => setCropKey(e.target.value)}
                className="mt-1"
              >
                {marketPrices.map((m) => (
                  <option key={m.cropKey} value={m.cropKey}>
                    {m.crop} (Demo Ref: ₹{m.referencePrice}/{UNIT_SHORT_MAP[m.unit]})
                  </option>
                ))}
                <option value="other">Other Crop</option>
              </SelectField>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#374151]">Category *</label>
              <SelectField
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="mt-1"
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </SelectField>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151]">Measurement Unit *</label>
              <SelectField
                value={unit}
                onChange={(e) => setUnit(e.target.value as MeasurementUnit)}
                className="mt-1"
              >
                {MEASUREMENT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </SelectField>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151]">Product Quality *</label>
              <SelectField
                value={quality}
                onChange={(e) => setQuality(e.target.value as ProductQuality)}
                className="mt-1"
              >
                {PRODUCT_QUALITIES.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#374151]">Description *</label>
            <Textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe harvest freshness, cultivation method, grading, and packaging..."
              className="mt-1"
            />
          </div>

          {/* Pricing & Quantity */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#374151]">
                Selling Price (₹/{UNIT_SHORT_MAP[unit]}) *
              </label>
              <Input
                type="number"
                min="1"
                step="0.5"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151]">
                Available Stock ({UNIT_SHORT_MAP[unit]}) *
              </label>
              <Input
                type="number"
                min="0"
                required
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(e.target.value)}
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151]">Min Order Qty *</label>
              <Input
                type="number"
                min="1"
                required
                value={minOrderQuantity}
                onChange={(e) => setMinOrderQuantity(e.target.value)}
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151]">Harvest Date *</label>
              <Input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#374151]">Farm Location *</label>
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
            <div className="flex items-end pb-2 gap-5 sm:col-span-2">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#1F2937] cursor-pointer">
                <input
                  type="checkbox"
                  checked={retailAvailable}
                  onChange={(e) => setRetailAvailable(e.target.checked)}
                  className="h-4 w-4 accent-[#166534]"
                />
                Retail Available
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#1F2937] cursor-pointer">
                <input
                  type="checkbox"
                  checked={wholesaleAvailable}
                  onChange={(e) => setWholesaleAvailable(e.target.checked)}
                  className="h-4 w-4 accent-[#166534]"
                />
                Wholesale Available
              </label>
            </div>
          </div>

          {wholesaleAvailable && (
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#E2E8DF] bg-[#F8FAF5] p-3.5">
              <div>
                <label className="block text-xs font-medium text-[#374151]">
                  Wholesale Price (₹/{UNIT_SHORT_MAP[unit]})
                </label>
                <Input
                  type="number"
                  min="1"
                  step="0.5"
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151]">
                  Wholesale Min Qty ({UNIT_SHORT_MAP[unit]})
                </label>
                <Input
                  type="number"
                  min="5"
                  value={wholesaleMinQty}
                  onChange={(e) => setWholesaleMinQty(e.target.value)}
                  className="mt-1 font-mono"
                />
              </div>
            </div>
          )}

          {/* Product Photograph Upload + Preset Picker */}
          <div className="space-y-2.5 pt-2 border-t border-[#EEF2EB]">
            <label className="block text-xs font-medium text-[#374151]">
              Product Photograph (Upload local photo or pick farm sample)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-[#D5DFD0] bg-white px-3.5 py-2 text-xs font-medium text-[#1F2937] hover:bg-[#F3F7F0] cursor-pointer">
                <Upload className="h-3.5 w-3.5 text-[#166534]" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PRODUCE_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={`rounded-md border px-2.5 py-1.5 text-[11px] font-medium cursor-pointer ${
                      image === preset.url
                        ? 'border-[#166534] bg-[#EEF4EB] text-[#166534]'
                        : 'border-[#E2E8DF] text-[#526058] hover:border-[#166534]/50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-[#DC2626]">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" size="lg">
              {editingProduct ? 'Save Product Changes' : 'Publish Produce to Marketplace'}
            </Button>
            {onDone && (
              <Button type="button" variant="outline" onClick={onDone}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Right Column: Live Preview + Smart Market Price Assistance */}
      <div className="lg:col-span-4 space-y-5">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4.5 w-4.5 text-[#166534]" />
            <h3 className="font-display text-base font-semibold text-[#1F2937]">
              Smart Price Recommendation
            </h3>
          </div>

          {matchedRef ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#F4F8F2] p-3">
                <div>
                  <p className="text-[11px] text-[#526058]">Reference Price</p>
                  <p className="font-mono text-lg font-bold text-[#166534] tabular-nums">
                    {formatINR(matchedRef.referencePrice)}/{UNIT_SHORT_MAP[matchedRef.unit]}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#526058]">Suggested Range</p>
                  <p className="font-mono text-sm font-semibold text-[#1F2937] tabular-nums mt-1">
                    {formatINR(matchedRef.suggestedMin)}–{formatINR(matchedRef.suggestedMax)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#526058]">Your Entered Selling Price</p>
                <p className="font-mono text-base font-bold text-[#1F2937] tabular-nums">
                  {priceNum > 0 ? formatINR(priceNum) : '—'} / {UNIT_SHORT_MAP[unit]}
                </p>
                {comparison && (
                  <p className={`mt-1 text-xs font-semibold ${comparison.tone}`}>
                    {comparison.label}
                  </p>
                )}
              </div>

              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setSellingPrice(String(matchedRef.referencePrice))}
              >
                Use Suggested ₹{matchedRef.referencePrice}
              </Button>

              <p className="text-[11px] text-[#6B786F]">{matchedRef.note}</p>
            </div>
          ) : (
            <p className="text-xs text-[#526058]">
              Select a common crop reference on the left to view simulated benchmark guidance.
            </p>
          )}

          <DisclaimerNotice text={t('marketPriceDisclaimer')} />
        </Card>

        <Card className="overflow-hidden">
          <div className="aspect-[4/3] bg-[#EEF3EB]">
            <SafeImage
              src={image}
              alt={name || 'Produce preview'}
              fallbackLabel={name || 'Produce Preview'}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-4">
            <p className="text-xs text-[#526058]">
              {category} · {district} · {quality}
            </p>
            <p className="mt-1 font-display text-sm font-semibold text-[#1F2937]">
              {name || 'Your Produce Title'}
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-[#166534] tabular-nums">
              {priceNum > 0 ? formatINR(priceNum) : '₹0'}/{UNIT_SHORT_MAP[unit]}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── Farmer My Products ── */
function FarmerProductsList() {
  const { currentUser, products, updateProduct, deleteProduct, toggleProductAvailability } =
    useAppData();
  const navigate = useNavigate();

  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [stockDraft, setStockDraft] = useState<Record<string, string>>({});

  const myProducts = products.filter((p) => p.farmerId === currentUser?.id);

  if (editing) {
    return <FarmerProductForm editingProduct={editing} onDone={() => setEditing(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#1F2937]">
            My Produce Listings ({myProducts.length})
          </h2>
          <p className="text-sm text-[#526058]">
            Update available stock, pause listings, or edit prices in real time.
          </p>
        </div>
        <Button onClick={() => navigate('/farmer/add-product')}>
          <PlusCircle className="h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {myProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No produce listed yet"
          description="Publish your first harvest lot so local retail and wholesale customers can purchase directly."
          action={
            <Button onClick={() => navigate('/farmer/add-product')}>
              Create First Listing
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {myProducts.map((p) => {
            const unitShort = UNIT_SHORT_MAP[p.unit];
            const draftVal = stockDraft[p.id] ?? String(p.availableQuantity);

            return (
              <Card key={p.id} className="p-4 flex flex-col sm:flex-row gap-4">
                <div className="h-32 sm:w-36 shrink-0 overflow-hidden rounded-lg bg-[#EEF3EB]">
                  <SafeImage
                    src={p.image}
                    alt={p.name}
                    fallbackLabel={p.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-base font-semibold text-[#1F2937] truncate">
                        {p.name}
                      </h3>
                      <span
                        className={`text-xs font-semibold shrink-0 ${
                          p.status === 'active'
                            ? 'text-[#166534]'
                            : p.status === 'disabled_by_admin'
                            ? 'text-[#DC2626]'
                            : 'text-[#6B786F]'
                        }`}
                      >
                        {p.status === 'active'
                          ? 'Active'
                          : p.status === 'disabled_by_admin'
                          ? 'Admin Disabled'
                          : 'Unavailable'}
                      </span>
                    </div>
                    <p className="text-xs text-[#526058]">
                      {p.category} · {p.district} · Harvested {formatDate(p.harvestDate)}
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold text-[#166534] tabular-nums">
                      Retail {formatINR(p.sellingPrice)}/{unitShort}
                      {p.wholesaleAvailable && p.wholesalePrice
                        ? ` · Wholesale ${formatINR(p.wholesalePrice)}/${unitShort}`
                        : ''}
                    </p>
                  </div>

                  {/* Quick Stock Update */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EEF2EB]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#526058]">Stock:</span>
                      <input
                        type="number"
                        min="0"
                        value={draftVal}
                        onChange={(e) =>
                          setStockDraft((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        className="h-8 w-20 rounded-md border border-[#D5DFD0] px-2 font-mono text-xs tabular-nums"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 px-2.5 text-xs"
                        onClick={() => {
                          const num = Number(draftVal);
                          if (Number.isNaN(num) || num < 0) {
                            toast.error('Enter a valid non-negative stock value');
                            return;
                          }
                          updateProduct(p.id, { availableQuantity: num });
                        }}
                      >
                        Save
                      </Button>
                    </div>

                    <div className="ml-auto flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5"
                        onClick={() => toggleProductAvailability(p.id)}
                      >
                        {p.status === 'active' ? 'Pause' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        title="Edit product"
                        onClick={() => setEditing(p)}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        title="View in Marketplace"
                        onClick={() => navigate(`/product/${p.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-[#DC2626] hover:bg-[#FEF2F2]"
                        title="Delete product"
                        onClick={() => setDeleting(p)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete Produce Listing?"
        description={`Are you sure you want to permanently delete "${deleting?.name}" from the marketplace?`}
        confirmLabel="Delete Listing"
        destructive
        onConfirm={() => deleting && deleteProduct(deleting.id)}
      />
    </div>
  );
}

/* ── Farmer Orders Management ── */
function FarmerOrdersView() {
  const { currentUser, orders, updateOrderStatus } = useAppData();
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');

  const myOrders = useMemo(
    () =>
      orders
        .filter((o) => o.farmerId === currentUser?.id)
        .filter((o) => statusFilter === 'All' || o.status === statusFilter),
    [orders, currentUser, statusFilter]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-[#1F2937]">
            Incoming Customer Orders ({myOrders.length})
          </h2>
          <p className="text-sm text-[#526058]">
            Status updates sync immediately with the Customer Dashboard and send in-app notifications.
          </p>
        </div>

        <SelectField
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'All' | OrderStatus)}
          className="w-48"
        >
          <option value="All">All Statuses</option>
          {[...ORDER_STATUS_FLOW, 'Cancelled' as const].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectField>
      </div>

      {myOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="No orders match this status"
          description="Incoming retail and wholesale customer orders will appear here automatically."
        />
      ) : (
        <div className="space-y-4">
          {myOrders.map((ord) => (
            <Card key={ord.id} className="p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EEF2EB] pb-3">
                <div>
                  <p className="font-mono text-sm font-bold text-[#166534]">#{ord.id}</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#1F2937]">
                    {ord.customerName} · {ord.customerPhone}
                  </p>
                  <p className="text-xs text-[#526058]">
                    {ord.deliveryAddress} ({ord.district}) ·{' '}
                    {ord.fulfilmentOption === 'farmer_pickup' ? 'Farmer Pickup' : 'Local Delivery'} ·{' '}
                    <span className="capitalize">{ord.orderType}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <OrderStatusLabel status={ord.status} />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-[#526058]">Update Status:</label>
                    <SelectField
                      aria-label={`Update status for ${ord.id}`}
                      value={ord.status}
                      disabled={ord.status === 'Cancelled' || ord.status === 'Delivered'}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="h-8 w-44 text-xs"
                    >
                      {[...ORDER_STATUS_FLOW, 'Cancelled' as const].map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[#EEF2EB] text-sm">
                {ord.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.orderType}`}
                    className="py-2 flex items-center justify-between gap-4"
                  >
                    <span>
                      {item.productName} ·{' '}
                      <strong className="font-mono tabular-nums">
                        {item.quantity} {UNIT_SHORT_MAP[item.unit]}
                      </strong>{' '}
                      @ {formatINR(item.unitPrice)} ({item.orderType})
                    </span>
                    <span className="font-mono font-semibold tabular-nums">
                      {formatINR(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EEF2EB] text-xs text-[#526058]">
                <span>Placed {formatDate(ord.createdAt)}</span>
                <span className="font-mono text-sm font-bold text-[#166534] tabular-nums">
                  Farmer Payout (Produce Subtotal): {formatINR(ord.subtotal)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Smart Market Price Recommendation Module ── */
function FarmerMarketPricesView() {
  const { marketPrices } = useAppData();
  const { t } = useLanguage();
  const [selectedPrices, setSelectedPrices] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    marketPrices.forEach((m) => {
      init[m.cropKey] = m.referencePrice;
    });
    return init;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-[#1F2937]">
          Smart Market Price Recommendation
        </h2>
        <p className="text-sm text-[#526058]">
          Compare your planned direct-selling price against simulated regional benchmarks before listing produce.
        </p>
      </div>

      <DisclaimerNotice text={t('marketPriceDisclaimer')} tone="warning" />

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#E2E8DF] bg-[#F8FAF5] text-xs text-[#526058]">
              <th className="px-4 py-3 font-medium">Crop</th>
              <th className="px-4 py-3 font-medium text-right">Reference Price</th>
              <th className="px-4 py-3 font-medium text-right">Min Suggested</th>
              <th className="px-4 py-3 font-medium text-right">Max Suggested</th>
              <th className="px-4 py-3 font-medium">Your Test Selling Price</th>
              <th className="px-4 py-3 font-medium">Comparison Indicator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF2EB]">
            {marketPrices.map((m) => {
              const myVal = selectedPrices[m.cropKey] ?? m.referencePrice;
              const cmp = getPriceComparison(myVal, m.suggestedMin, m.suggestedMax);
              const u = UNIT_SHORT_MAP[m.unit];
              return (
                <tr key={m.cropKey} className="hover:bg-[#FAFDF8]">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#1F2937]">{m.crop}</p>
                    <p className="text-xs text-[#6B786F]">{m.category}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-[#166534] tabular-nums">
                    {formatINR(m.referencePrice)}/{u}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#374151]">
                    {formatINR(m.suggestedMin)}/{u}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#374151]">
                    {formatINR(m.suggestedMax)}/{u}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#526058]">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={myVal}
                        onChange={(e) =>
                          setSelectedPrices((prev) => ({
                            ...prev,
                            [m.cropKey]: Number(e.target.value),
                          }))
                        }
                        className="h-8 w-20 rounded-md border border-[#D5DFD0] px-2 font-mono text-xs tabular-nums"
                      />
                      <span className="text-xs text-[#526058]">/{u}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${cmp.tone}`}>{cmp.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ── Farmer Income Analytics ── */
function FarmerIncomeAnalytics() {
  const { currentUser, orders } = useAppData();
  const myOrders = orders.filter(
    (o) => o.farmerId === currentUser?.id && o.status !== 'Cancelled'
  );

  const retailTotal = myOrders
    .filter((o) => o.orderType === 'retail')
    .reduce((s, o) => s + o.subtotal, 0);
  const wholesaleTotal = myOrders
    .filter((o) => o.orderType === 'wholesale')
    .reduce((s, o) => s + o.subtotal, 0);
  const deliveredTotal = myOrders
    .filter((o) => o.status === 'Delivered')
    .reduce((s, o) => s + o.subtotal, 0);

  const byCrop = useMemo(() => {
    const map: Record<string, { crop: string; sales: number; units: number }> = {};
    for (const o of myOrders) {
      for (const it of o.items) {
        const key = it.productName.split('(')[0].trim();
        if (!map[key]) map[key] = { crop: key, sales: 0, units: 0 };
        map[key].sales += it.subtotal;
        map[key].units += it.quantity;
      }
    }
    return Object.values(map);
  }, [myOrders]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-[#526058]">Delivered Earnings</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#166534] tabular-nums">
            {formatINR(deliveredTotal)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-[#526058]">Retail Order Sales</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#1F2937] tabular-nums">
            {formatINR(retailTotal)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-[#526058]">Wholesale Order Sales</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#1F2937] tabular-nums">
            {formatINR(wholesaleTotal)}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-base font-semibold text-[#1F2937] mb-4">
          Revenue Breakdown by Crop
        </h2>
        {byCrop.length === 0 ? (
          <p className="text-sm text-[#526058]">No order revenue recorded yet.</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCrop}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EEE4" />
                <XAxis dataKey="crop" tick={{ fontSize: 11, fill: '#526058' }} />
                <YAxis tick={{ fontSize: 11, fill: '#526058' }} />
                <Tooltip formatter={(v) => [formatINR(Number(v ?? 0)), 'Sales']} />
                <Bar dataKey="sales" fill="#166534" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ── Farmer Profile ── */
function FarmerProfileView() {
  const { currentUser, updateProfile } = useAppData();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [farmName, setFarmName] = useState(currentUser?.farmName ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [district, setDistrict] = useState<TamilNaduDistrict>(currentUser?.district ?? 'Trichy');
  const [address, setAddress] = useState(currentUser?.address ?? '');
  const [farmSizeAcres, setFarmSizeAcres] = useState(String(currentUser?.farmSizeAcres ?? 5));
  const [bio, setBio] = useState(currentUser?.bio ?? '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      farmName: farmName.trim(),
      phone: phone.trim(),
      district,
      address: address.trim(),
      farmSizeAcres: Number(farmSizeAcres) || 2,
      bio: bio.trim(),
    });
  };

  return (
    <Card className="max-w-2xl p-6">
      <div className="flex items-center justify-between border-b border-[#EEF2EB] pb-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#1F2937]">Farmer Profile</h2>
          <p className="text-xs text-[#526058]">
            {currentUser?.email} ·{' '}
            {currentUser?.isDemoAccount ? 'Seeded Demo Farmer Account' : 'User-Registered Account'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#374151]">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151]">Farm Name</label>
            <Input
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#374151]">Phone</label>
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
          <div>
            <label className="block text-xs font-medium text-[#374151]">Farm Size (Acres)</label>
            <Input
              type="number"
              step="0.5"
              value={farmSizeAcres}
              onChange={(e) => setFarmSizeAcres(e.target.value)}
              className="mt-1 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151]">Farm Address</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#374151]">Farm Bio (Visible to Customers)</label>
          <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1" />
        </div>

        <Button type="submit">Save Profile Changes</Button>
      </form>
    </Card>
  );
}

/* ── Main Farmer Dashboard Router ── */
export function FarmerDashboard() {
  const { currentUser, orders } = useAppData();
  const { t } = useLanguage();

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'farmer') {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/customer'} replace />;
  }

  const pendingCount = orders.filter(
    (o) => o.farmerId === currentUser.id && o.status === 'Pending'
  ).length;

  const navItems: SidebarNavItem[] = [
    { to: '/farmer', label: t('overview'), icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/farmer/products', label: t('myProducts'), icon: <Package className="h-4 w-4" /> },
    { to: '/farmer/add-product', label: t('addNewProduct'), icon: <PlusCircle className="h-4 w-4" /> },
    {
      to: '/farmer/orders',
      label: t('orders'),
      icon: <ShoppingBag className="h-4 w-4" />,
      badge: pendingCount,
    },
    { to: '/farmer/market-prices', label: t('marketPrices'), icon: <IndianRupee className="h-4 w-4" /> },
    { to: '/farmer/crop-recommendation', label: t('cropRecommendation'), icon: <Compass className="h-4 w-4" /> },
    { to: '/farmer/smart-agriculture', label: t('smartAgriculture'), icon: <Bot className="h-4 w-4" /> },
    { to: '/farmer/weather', label: t('weatherAlerts'), icon: <CloudRain className="h-4 w-4" /> },
    { to: '/farmer/disease-risk', label: t('diseaseRisk'), icon: <ShieldAlert className="h-4 w-4" /> },
    { to: '/farmer/fertilizer', label: t('fertilizerGuide'), icon: <FlaskConical className="h-4 w-4" /> },
    { to: '/farmer/analytics', label: t('incomeAnalytics'), icon: <BarChart3 className="h-4 w-4" /> },
    { to: '/farmer/profile', label: t('profile'), icon: <User className="h-4 w-4" /> },
  ];

  const defaultWeatherDistrict = ['Trichy', 'Thanjavur', 'Madurai', 'Salem'].includes(
    currentUser.district
  )
    ? (currentUser.district as 'Trichy' | 'Thanjavur' | 'Madurai' | 'Salem')
    : 'Trichy';

  return (
    <Routes>
      <Route
        index
        element={
          <DashboardLayout roleTitle="Farmer Dashboard" pageTitle={t('overview')} navItems={navItems}>
            <FarmerOverview />
          </DashboardLayout>
        }
      />
      <Route
        path="products"
        element={
          <DashboardLayout roleTitle="Farmer Dashboard" pageTitle={t('myProducts')} navItems={navItems}>
            <FarmerProductsList />
          </DashboardLayout>
        }
      />
      <Route
        path="add-product"
        element={
          <DashboardLayout roleTitle="Farmer Dashboard" pageTitle={t('addNewProduct')} navItems={navItems}>
            <FarmerProductForm />
          </DashboardLayout>
        }
      />
      <Route
        path="orders"
        element={
          <DashboardLayout roleTitle="Farmer Dashboard" pageTitle={t('orders')} navItems={navItems}>
            <FarmerOrdersView />
          </DashboardLayout>
        }
      />
      <Route
        path="market-prices"
        element={
          <DashboardLayout roleTitle="Farmer Dashboard" pageTitle={t('marketPrices')} navItems={navItems}>
            <FarmerMarketPricesView />
          </DashboardLayout>
        }
      />
      <Route
        path="crop-recommendation"
        element={
          <DashboardLayout
            roleTitle="Farmer Dashboard"
            pageTitle={t('cropRecommendation')}
            navItems={navItems}
          >
            <CropRecommendationPanel
              defaultDistrict={currentUser.district}
              defaultArea={currentUser.farmSizeAcres ?? 4}
            />
          </DashboardLayout>
        }
      />
      <Route
        path="smart-agriculture"
        element={
          <DashboardLayout roleTitle="Farmer Dashboard" pageTitle={t('smartAgriculture')} navItems={navItems}>
            <AgriAssistantPanel />
          </DashboardLayout>
        }
      />
      <Route
        path="weather"
        element={
          <DashboardLayout roleTitle="Farmer Dashboard" pageTitle={t('weatherAlerts')} navItems={navItems}>
            <WeatherDashboardPanel defaultDistrict={defaultWeatherDistrict} />
          </DashboardLayout>
        }
      />
      <Route
        path="disease-risk"
        element={
          <DashboardLayout roleTitle="Farmer Dashboard" pageTitle={t('diseaseRisk')} navItems={navItems}>
            <DiseaseRiskPanel />
          </DashboardLayout>
        }
      />
      <Route
        path="fertilizer"
        element={
          <DashboardLayout roleTitle="Farmer Dashboard" pageTitle={t('fertilizerGuide')} navItems={navItems}>
            <FertilizerGuidePanel />
          </DashboardLayout>
        }
      />
      <Route
        path="analytics"
        element={
          <DashboardLayout roleTitle="Farmer Dashboard" pageTitle={t('incomeAnalytics')} navItems={navItems}>
            <FarmerIncomeAnalytics />
          </DashboardLayout>
        }
      />
      <Route
        path="profile"
        element={
          <DashboardLayout roleTitle="Farmer Dashboard" pageTitle={t('profile')} navItems={navItems}>
            <FarmerProfileView />
          </DashboardLayout>
        }
      />
    </Routes>
  );
}
