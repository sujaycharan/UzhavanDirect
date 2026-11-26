import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, CloudRain, Compass, FlaskConical, ShieldAlert } from 'lucide-react';
import { PublicLayout } from '@/src/components/layout/PublicLayout';
import {
  AgriAssistantPanel,
  CropRecommendationPanel,
  DiseaseRiskPanel,
  FertilizerGuidePanel,
  WeatherDashboardPanel,
} from '@/src/components/smart-agri/SmartAgriModules';

type SmartTab = 'crop-recommendation' | 'weather' | 'disease' | 'fertilizer' | 'assistant';

export function SmartAgriculturePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as SmartTab) || 'crop-recommendation';
  const [activeTab, setActiveTab] = useState<SmartTab>(
    ['crop-recommendation', 'weather', 'disease', 'fertilizer', 'assistant'].includes(initialTab)
      ? initialTab
      : 'crop-recommendation'
  );

  const switchTab = (tab: SmartTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs: { id: SmartTab; label: string; icon: React.ReactNode }[] = [
    { id: 'crop-recommendation', label: 'Crop Recommendation', icon: <Compass className="h-4 w-4" /> },
    { id: 'weather', label: 'Weather Alerts', icon: <CloudRain className="h-4 w-4" /> },
    { id: 'disease', label: 'Disease Risk', icon: <ShieldAlert className="h-4 w-4" /> },
    { id: 'fertilizer', label: 'Fertilizer Guide', icon: <FlaskConical className="h-4 w-4" /> },
    { id: 'assistant', label: 'AI Agri Assistant', icon: <Bot className="h-4 w-4" /> },
  ];

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#166534]">Smart Agriculture Assistance</p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2937]">
              Decision Support Tools for Farmers
            </h1>
            <p className="mt-1.5 text-sm text-[#526058]">
              Explore crop planting recommendations, simulated district weather, disease-risk models, soil guidance, and bilingual English/Tamil farming assistance.
            </p>
          </div>

          <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-[#EEF4EB] p-1 self-start">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                type="button"
                onClick={() => switchTab(tb.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tb.id
                    ? 'bg-white text-[#166534] font-semibold shadow-xs'
                    : 'text-[#4B594F] hover:text-[#1F2937]'
                }`}
              >
                {tb.icon}
                {tb.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          {activeTab === 'crop-recommendation' && <CropRecommendationPanel />}
          {activeTab === 'weather' && <WeatherDashboardPanel />}
          {activeTab === 'disease' && <DiseaseRiskPanel />}
          {activeTab === 'fertilizer' && <FertilizerGuidePanel />}
          {activeTab === 'assistant' && <AgriAssistantPanel />}
        </div>
      </div>
    </PublicLayout>
  );
}
