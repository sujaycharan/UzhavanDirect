import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CloudRain,
  Compass,
  FlaskConical,
  IndianRupee,
  Package,
  ShieldAlert,
  ShoppingBag,
  ShoppingCart,
  Store,
  Users,
} from 'lucide-react';
import { PublicLayout } from '@/src/components/layout/PublicLayout';
import { Button, Card, DisclaimerNotice, SafeImage } from '@/src/components/ui/primitives';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAppData } from '@/src/context/AppDataContext';
import { ASSET_IMAGES } from '@/src/data/seedData';
import { UNIT_SHORT_MAP } from '@/src/types';
import { formatINR } from '@/src/lib/utils';

export function LandingPage() {
  const { t } = useLanguage();
  const { users, products, orders, addToCart } = useAppData();
  const navigate = useNavigate();

  const activeProducts = products.filter((p) => p.status === 'active');
  const featuredProducts = activeProducts.slice(0, 6);
  const farmerCount = users.filter((u) => u.role === 'farmer').length;
  const customerCount = users.filter((u) => u.role === 'customer').length;
  const uniqueConnections = new Set(orders.map((o) => `${o.customerId}-${o.farmerId}`)).size;

  const features = [
    {
      title: 'Direct Farmer-to-Customer Marketplace',
      desc: 'Browse fresh vegetables, fruits, grains, pulses, and spices listed directly by Tamil Nadu farmers without hidden intermediary markups.',
      icon: <Store className="h-5 w-5 text-[#166534]" />,
      span: 'lg:col-span-2',
      to: '/marketplace',
    },
    {
      title: 'Smart Market Price Assistance',
      desc: 'Simulated reference prices and suggested competitive ranges help farmers price produce fairly and transparently.',
      icon: <IndianRupee className="h-5 w-5 text-[#166534]" />,
      span: 'lg:col-span-1',
      to: '/login',
    },
    {
      title: 'Weather Monitoring & Alerts',
      desc: 'District-level simulated forecasts for Trichy, Thanjavur, Madurai, and Salem with rainfall, wind, and temperature alerts.',
      icon: <CloudRain className="h-5 w-5 text-[#166534]" />,
      span: 'lg:col-span-1',
      to: '/smart-agriculture',
    },
    {
      title: 'Crop Disease Risk Alerts',
      desc: 'Rule-based fungal and stress risk simulations across Rice, Tomato, Brinjal, Chilli, Banana, and Groundnut growth stages.',
      icon: <ShieldAlert className="h-5 w-5 text-[#166534]" />,
      span: 'lg:col-span-1',
      to: '/smart-agriculture?tab=disease',
    },
    {
      title: 'Fertilizer Guidance',
      desc: 'Soil type, pH, and NPK analysis demonstrating nutrient categories, general timing, and responsible soil-testing reminders.',
      icon: <FlaskConical className="h-5 w-5 text-[#166534]" />,
      span: 'lg:col-span-1',
      to: '/smart-agriculture?tab=fertilizer',
    },
    {
      title: 'Smart Crop Recommendation',
      desc: 'Match the right crop to plant based on Tamil Nadu district, land area, soil type, water availability, temperature, and humidity.',
      icon: <Compass className="h-5 w-5 text-[#166534]" />,
      span: 'lg:col-span-1',
      to: '/smart-agriculture?tab=crop-recommendation',
    },
    {
      title: 'Retail & Wholesale Orders',
      desc: 'Support both daily household baskets and bulk catering or shop quantities with clear minimum order rules and live stock tracking.',
      icon: <Package className="h-5 w-5 text-[#166534]" />,
      span: 'lg:col-span-2',
      to: '/marketplace?type=wholesale',
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="border-b border-[#E2E8DF] bg-[#F8FAF5]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-sm font-medium text-[#166534]">
                Tamil Nadu Direct AgriTech Prototype · {t('tagline')}
              </p>
              <h1
                className="mt-4 font-display font-bold tracking-tight text-[#1F2937]"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.6rem)',
                  lineHeight: 1.08,
                  textWrap: 'balance',
                }}
              >
                {t('heroHeading')}
              </h1>
              <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-[#4B594F]">
                {t('heroDescription')}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Button size="lg" onClick={() => navigate('/marketplace')}>
                  {t('exploreMarketplace')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/register?role=farmer')}
                >
                  {t('joinAsFarmer')}
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#526058]">
                <span>7 Tamil Nadu Districts</span>
                <span aria-hidden="true">·</span>
                <span>Retail & Wholesale Pricing</span>
                <span aria-hidden="true">·</span>
                <span>English & தமிழ் Support</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[300px] sm:min-h-[380px] overflow-hidden rounded-2xl border border-[#DCE5D8] bg-[#E8EFE4]">
                <SafeImage
                  src={ASSET_IMAGES.heroFarmer}
                  alt="Tamil Nadu farmer inspecting lush green crops at sunrise"
                  fallbackLabel="Tamil Nadu Cauvery Delta Farmer"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0D2114]/85 via-[#0D2114]/40 to-transparent p-6 text-white">
                  <p className="text-xs font-medium text-[#D9F0DF]">
                    Cauvery Delta · Trichy & Thanjavur Demo Network
                  </p>
                  <p className="mt-1 font-display text-base font-semibold">
                    Direct farm-gate listings paired with daily crop advisories
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width Prototype Impact Strip below hero */}
          <div className="mt-12 rounded-xl border border-[#E2E8DF] bg-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[#EEF2EB]">
              <h2 className="font-display text-base font-semibold text-[#1F2937]">
                {t('impactTitle')}
              </h2>
              <span className="text-xs text-[#6B786F]">{t('impactNote')}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-6 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium text-[#526058]">{t('farmersRegistered')}</p>
                <p className="mt-1 font-mono text-2xl sm:text-3xl font-semibold text-[#166534] tabular-nums">
                  {farmerCount}
                </p>
                <p className="mt-0.5 text-xs text-[#6B786F]">Across 7 TN districts (demo)</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#526058]">{t('productsListed')}</p>
                <p className="mt-1 font-mono text-2xl sm:text-3xl font-semibold text-[#166534] tabular-nums">
                  {activeProducts.length}
                </p>
                <p className="mt-0.5 text-xs text-[#6B786F]">Active live catalog lots</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#526058]">{t('ordersPlaced')}</p>
                <p className="mt-1 font-mono text-2xl sm:text-3xl font-semibold text-[#166534] tabular-nums">
                  {orders.length}
                </p>
                <p className="mt-0.5 text-xs text-[#6B786F]">Retail & bulk demo orders</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#526058]">{t('customerConnections')}</p>
                <p className="mt-1 font-mono text-2xl sm:text-3xl font-semibold text-[#166534] tabular-nums">
                  {Math.max(customerCount, uniqueConnections)}
                </p>
                <p className="mt-0.5 text-xs text-[#6B786F]">Direct farmer-buyer pairs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-20 bg-white border-b border-[#E2E8DF]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2937]">
              {t('howItWorksTitle')}
            </h2>
            <p className="mt-2.5 text-base text-[#526058]">{t('howItWorksSubtitle')}</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { title: t('step1Title'), desc: t('step1Desc') },
              { title: t('step2Title'), desc: t('step2Desc') },
              { title: t('step3Title'), desc: t('step3Desc') },
            ].map((step) => (
              <div key={step.title} className="border-t border-[#D7E1D3] pt-5">
                <h3 className="font-display text-lg font-semibold text-[#1F2937]">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#526058]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products (Live from Marketplace) */}
      <section className="py-16 lg:py-20 bg-[#F8FAF5] border-b border-[#E2E8DF]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2937]">
                {t('featuredProductsTitle')}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#526058]">
                {t('featuredProductsSubtitle')}
              </p>
            </div>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#166534] hover:underline whitespace-nowrap"
            >
              {t('viewAllProduce')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <Card
                key={product.id}
                className="group overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#C5D5BF] flex flex-col"
              >
                <Link to={`/product/${product.id}`} className="block aspect-[4/3] overflow-hidden bg-[#EEF3EB]">
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    fallbackLabel={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </Link>
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
                    By {product.farmerName} ({product.farmName})
                  </p>

                  <div className="mt-4 pt-4 border-t border-[#EEF2EB] flex items-end justify-between gap-2">
                    <div>
                      <p className="font-mono text-lg font-semibold text-[#166534] tabular-nums">
                        {formatINR(product.sellingPrice)}
                        <span className="text-xs font-normal text-[#526058]">
                          /{UNIT_SHORT_MAP[product.unit]}
                        </span>
                      </p>
                      <p className="text-xs text-[#6B786F] tabular-nums">
                        Stock: {product.availableQuantity} {UNIT_SHORT_MAP[product.unit]}
                      </p>
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
                        onClick={() =>
                          addToCart(product.id, product.minOrderQuantity, 'retail')
                        }
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features Bento Grid */}
      <section className="py-16 lg:py-20 bg-white border-b border-[#E2E8DF]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2937]">
              {t('featuresTitle')}
            </h2>
            <p className="mt-2 text-base text-[#526058]">{t('featuresSubtitle')}</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {features.map((feat) => (
              <Link
                key={feat.title}
                to={feat.to}
                className={`${feat.span} group rounded-xl border border-[#E2E8DF] bg-[#F8FAF5] p-6 transition-colors hover:border-[#166534]/50 hover:bg-white`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6F1E3]">
                  {feat.icon}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-[#1F2937] group-hover:text-[#166534]">
                  {feat.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#526058]">{feat.desc}</p>
              </Link>
            ))}
          </div>

          {/* Demo CTA & Transparency Banner */}
          <div className="mt-12 rounded-2xl bg-[#166534] p-8 sm:p-10 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                Test Farmer, Customer & Admin Workflows Instantly
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#D9F0DF] leading-relaxed">
                Use one-click demo login on the sign-in screen to publish produce, compare prices, place synchronized orders, and test bilingual Smart Agriculture tools.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="accent"
                size="lg"
                onClick={() => navigate('/login')}
              >
                <Users className="h-4 w-4" />
                Open Demo Accounts
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={() => navigate('/smart-agriculture')}
              >
                <ShoppingBag className="h-4 w-4" />
                Try Smart Agriculture
              </Button>
            </div>
          </div>

          <DisclaimerNotice text={t('prototypeDisclaimer')} className="mt-8" />
        </div>
      </section>
    </PublicLayout>
  );
}
