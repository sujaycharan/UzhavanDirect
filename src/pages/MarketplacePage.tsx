import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, Search, ShoppingCart, SlidersHorizontal, Sprout } from 'lucide-react';
import { PublicLayout } from '@/src/components/layout/PublicLayout';
import {
  Button,
  Card,
  EmptyState,
  Input,
  SafeImage,
  SelectField,
} from '@/src/components/ui/primitives';
import { useAppData } from '@/src/context/AppDataContext';
import { useLanguage } from '@/src/context/LanguageContext';
import {
  PRODUCT_CATEGORIES,
  TAMIL_NADU_DISTRICTS,
  UNIT_SHORT_MAP,
  type ProductCategory,
  type TamilNaduDistrict,
} from '@/src/types';
import { formatDate, formatINR } from '@/src/lib/utils';

export function MarketplaceContent({ embedded = false }: { embedded?: boolean }) {
  const { products, currentUser, addToCart, toggleFavourite } = useAppData();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'All'>('All');
  const [district, setDistrict] = useState<TamilNaduDistrict | 'All'>('All');
  const [orderMode, setOrderMode] = useState<'all' | 'retail' | 'wholesale'>(
    searchParams.get('type') === 'wholesale' ? 'wholesale' : 'all'
  );
  const [availability, setAvailability] = useState<'available' | 'all'>('available');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => {
        if (p.status === 'disabled_by_admin') return false;
        if (availability === 'available' && (p.status !== 'active' || p.availableQuantity <= 0)) {
          return false;
        }
        if (category !== 'All' && p.category !== category) return false;
        if (district !== 'All' && p.district !== district) return false;
        if (orderMode === 'retail' && !p.retailAvailable) return false;
        if (orderMode === 'wholesale' && !p.wholesaleAvailable) return false;
        if (q) {
          const hay = `${p.name} ${p.farmerName} ${p.farmName} ${p.district} ${p.category} ${p.description}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.sellingPrice - b.sellingPrice;
        if (sortBy === 'price_desc') return b.sellingPrice - a.sellingPrice;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, search, category, district, orderMode, availability, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setDistrict('All');
    setOrderMode('all');
    setAvailability('available');
    setSortBy('newest');
  };

  const favIds = currentUser?.favouriteProductIds ?? [];

  return (
    <div className={embedded ? 'space-y-6' : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6'}>
      {!embedded && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2937]">
              Direct Farm Marketplace
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-[#526058]">
              Compare harvest prices directly across Tamil Nadu farmers for retail and wholesale orders.
            </p>
          </div>
          <p className="font-mono text-xs text-[#526058] tabular-nums">
            Showing {filteredProducts.length} produce listing{filteredProducts.length === 1 ? '' : 's'}
          </p>
        </div>
      )}

      {/* Filter Bar */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B786F]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-9"
            />
          </div>

          <div className="md:col-span-2">
            <SelectField
              aria-label="Filter by category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory | 'All')}
            >
              <option value="All">{t('allCategories')}</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="md:col-span-2">
            <SelectField
              aria-label="Filter by district"
              value={district}
              onChange={(e) => setDistrict(e.target.value as TamilNaduDistrict | 'All')}
            >
              <option value="All">{t('allDistricts')}</option>
              {TAMIL_NADU_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="md:col-span-3">
            <SelectField
              aria-label="Sort listings"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="newest">Sort: Newest Harvests</option>
              <option value="price_asc">Price: Lowest First</option>
              <option value="price_desc">Price: Highest First</option>
            </SelectField>
          </div>
        </div>

        {/* Segmented Order Type + Availability Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EEF2EB]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#526058] mr-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Order Type:
            </span>
            <div className="inline-flex items-center gap-1 rounded-lg bg-[#EEF4EB] p-1">
              {(['all', 'retail', 'wholesale'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setOrderMode(mode)}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors cursor-pointer ${
                    orderMode === mode
                      ? 'bg-white text-[#166534] font-semibold shadow-xs'
                      : 'text-[#4B594F] hover:text-[#1F2937]'
                  }`}
                >
                  {mode === 'all' ? 'All Orders' : mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-[#374151] cursor-pointer">
              <input
                type="checkbox"
                checked={availability === 'available'}
                onChange={(e) => setAvailability(e.target.checked ? 'available' : 'all')}
                className="h-4 w-4 rounded border-[#C5D5BF] accent-[#166534]"
              />
              In-stock listings only
            </label>
            {(search || category !== 'All' || district !== 'All' || orderMode !== 'all') && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-[#166534] hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Sprout className="h-6 w-6" />}
          title="No produce matches your filters"
          description="Try broadening your search keywords, district, or category filter to view available harvests."
          action={<Button onClick={resetFilters}>Reset All Filters</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const isFav = favIds.includes(product.id);
            const isAvailable = product.status === 'active' && product.availableQuantity > 0;
            const unitShort = UNIT_SHORT_MAP[product.unit];
            const isOwnProduct = currentUser?.id === product.farmerId;

            return (
              <Card
                key={product.id}
                className="group overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#C2D3BC]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#EEF3EB]">
                  <Link to={`/product/${product.id}`} className="block h-full w-full">
                    <SafeImage
                      src={product.image}
                      alt={product.name}
                      fallbackLabel={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </Link>
                  <button
                    type="button"
                    aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
                    onClick={() => toggleFavourite(product.id)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-[#374151] hover:bg-white shadow-xs cursor-pointer"
                  >
                    <Heart
                      className={`h-4 w-4 ${isFav ? 'fill-[#DC2626] text-[#DC2626]' : ''}`}
                    />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs text-[#526058]">
                    {product.category} · {product.district} · {product.quality}
                  </p>

                  <Link
                    to={`/product/${product.id}`}
                    className="mt-1.5 font-display text-base font-semibold text-[#1F2937] hover:text-[#166534] line-clamp-1"
                  >
                    {product.name}
                  </Link>

                  <p className="mt-1 text-xs text-[#6B786F]">
                    Farmer: <span className="font-medium text-[#374151]">{product.farmerName}</span> · Harvested {formatDate(product.harvestDate)}
                  </p>

                  <div className="mt-3 text-xs text-[#526058] flex items-center justify-between tabular-nums">
                    <span>
                      Available: <strong className="text-[#1F2937]">{product.availableQuantity} {unitShort}</strong>
                    </span>
                    <span>
                      {product.retailAvailable && product.wholesaleAvailable
                        ? 'Retail & Wholesale'
                        : product.wholesaleAvailable
                        ? 'Wholesale'
                        : 'Retail'}
                    </span>
                  </div>

                  <div className="mt-auto pt-4 mt-4 border-t border-[#EEF2EB] flex items-end justify-between gap-2">
                    <div>
                      <p className="font-mono text-lg font-semibold text-[#166534] tabular-nums">
                        {formatINR(product.sellingPrice)}
                        <span className="text-xs font-normal text-[#526058]">/{unitShort}</span>
                      </p>
                      {product.wholesaleAvailable && product.wholesalePrice && (
                        <p className="font-mono text-[11px] text-[#526058] tabular-nums">
                          Wholesale: {formatINR(product.wholesalePrice)}/{unitShort} (min {product.wholesaleMinQty || 20})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {t('viewDetails')}
                      </Button>
                      <Button
                        size="sm"
                        disabled={!isAvailable || isOwnProduct}
                        onClick={() =>
                          addToCart(
                            product.id,
                            orderMode === 'wholesale' && product.wholesaleAvailable
                              ? product.wholesaleMinQty || 20
                              : product.minOrderQuantity,
                            orderMode === 'wholesale' && product.wholesaleAvailable
                              ? 'wholesale'
                              : 'retail'
                          )
                        }
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        {isAvailable ? 'Add' : 'Out'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MarketplacePage() {
  return (
    <PublicLayout>
      <MarketplaceContent />
    </PublicLayout>
  );
}
