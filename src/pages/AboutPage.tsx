import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/src/components/layout/PublicLayout';
import { Button, Card, DisclaimerNotice } from '@/src/components/ui/primitives';
import { useLanguage } from '@/src/context/LanguageContext';

export function AboutPage() {
  const { t } = useLanguage();

  const transparencyItems = [
    {
      title: 'Market Reference Prices',
      detail: 'All crop reference prices and suggested competitive ranges are predefined demonstration figures, not live APMC or mandi quotations.',
    },
    {
      title: 'Weather Forecasts & Alerts',
      detail: 'District weather metrics for Trichy, Thanjavur, Madurai, and Salem are simulated datasets illustrating how farmers receive rainfall and heat advisories.',
    },
    {
      title: 'Crop Disease-Risk Alerts',
      detail: 'Risk ratings (Low, Moderate, High) are computed by predefined rule scenarios based on crop and simulated weather — never real agronomic diagnoses.',
    },
    {
      title: 'Fertilizer Guidance',
      detail: 'Soil-analysis responses demonstrate general nutrient categories and timing without fabricating exact dosages. Farmers are advised to obtain lab soil tests.',
    },
    {
      title: 'Agricultural Assistant Demo',
      detail: 'The English and Tamil chatbot uses local predefined keyword-matched Q&A templates rather than an external live AI API.',
    },
    {
      title: 'Payments & Accounts',
      detail: 'Checkout and authentication run locally in your browser via LocalStorage. No real money, payment gateways, or production credentials are processed.',
    },
  ];

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-[#166534]">About Uzhavan Direct</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1F2937]">
            Direct Farm Access & Smart Agricultural Guidance for Tamil Nadu
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#4B594F]">
            {t('tagline')} Uzhavan Direct is an interactive prototype built to demonstrate how smallholder farmers across districts like Trichy, Thanjavur, Madurai, Salem, Coimbatore, Erode, and Dindigul can list produce directly for households and wholesale buyers while receiving daily decision support.
          </p>
        </div>

        <DisclaimerNotice text={t('prototypeDisclaimer')} tone="warning" />

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-[#1F2937]">
            Prototype Transparency & Simulated Modules
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {transparencyItems.map((item) => (
              <Card key={item.title} className="p-5">
                <h3 className="font-display text-base font-semibold text-[#1F2937]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#526058]">{item.detail}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="privacy" className="scroll-mt-24 space-y-4">
          <Card className="p-6 space-y-3">
            <h2 className="font-display text-xl font-semibold text-[#1F2937]">
              Privacy & Demonstration Terms
            </h2>
            <p className="text-sm leading-relaxed text-[#526058]">
              All profiles, listings, shopping carts, and orders you create during this demonstration are saved exclusively in your browser's LocalStorage on your own device. No personal information or payment data is transmitted to external servers. Administrators can reset all data back to the initial demonstration seed at any time from the Admin Dashboard.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/marketplace">
                <Button>Explore Marketplace</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">Try Demo Accounts</Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </PublicLayout>
  );
}
