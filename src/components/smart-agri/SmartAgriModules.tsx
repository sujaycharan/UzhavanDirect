import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  CloudRain,
  Compass,
  Droplets,
  FlaskConical,
  RefreshCw,
  Send,
  ShieldAlert,
  Sprout,
  Thermometer,
  Wind,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Button,
  Card,
  DisclaimerNotice,
  Input,
  SelectField,
} from '@/src/components/ui/primitives';
import {
  ASSISTANT_QA_BANK,
  SIMULATED_WEATHER,
  evaluateCropRecommendations,
  evaluateDiseaseRisk,
  evaluateFertilizerGuidance,
  getWeatherAlerts,
  matchAssistantReply,
} from '@/src/data/smartAgriData';
import {
  TAMIL_NADU_DISTRICTS,
  UNIT_SHORT_MAP,
  type CropRecommendationInput,
  type DiseaseRiskInput,
  type DistrictWeather,
  type FarmingSeason,
  type FertilizerInput,
  type Language,
  type SoilTypeOption,
  type TamilNaduDistrict,
  type WaterAvailability,
} from '@/src/types';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAppData } from '@/src/context/AppDataContext';
import { formatINR } from '@/src/lib/utils';
import { toast } from 'sonner';

/* ── A. WEATHER DASHBOARD ── */
export function WeatherDashboardPanel({
  defaultDistrict = 'Trichy',
}: {
  defaultDistrict?: DistrictWeather['district'];
}) {
  const { t } = useLanguage();
  const [district, setDistrict] = useState<DistrictWeather['district']>(defaultDistrict);
  const weather = SIMULATED_WEATHER[district];
  const alerts = useMemo(() => getWeatherAlerts(weather), [weather]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#1F2937]">
            District Weather Monitoring & Alerts
          </h2>
          <p className="text-sm text-[#526058]">
            Select a Tamil Nadu demonstration district to inspect current conditions, alerts, and 7-day trends.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-lg bg-[#EEF4EB] p-1 self-start">
          {(['Trichy', 'Thanjavur', 'Madurai', 'Salem'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDistrict(d)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                district === d
                  ? 'bg-white text-[#166534] font-semibold shadow-xs'
                  : 'text-[#4B594F] hover:text-[#1F2937]'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <DisclaimerNotice text={t('weatherDisclaimer')} tone="warning" />

      {/* Current Weather Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card className="p-4">
          <p className="text-xs text-[#526058] flex items-center gap-1.5">
            <Thermometer className="h-3.5 w-3.5 text-[#166534]" />
            Temperature
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#1F2937] tabular-nums">
            {weather.temperature}°C
          </p>
          <p className="mt-1 text-xs text-[#6B786F] truncate">{weather.condition}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[#526058] flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5 text-[#166534]" />
            Humidity
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#1F2937] tabular-nums">
            {weather.humidity}%
          </p>
          <p className="mt-1 text-xs text-[#6B786F]">
            {weather.humidity >= 78 ? 'High moisture' : 'Moderate air'}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[#526058] flex items-center gap-1.5">
            <CloudRain className="h-3.5 w-3.5 text-[#166534]" />
            Rain Probability
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#166534] tabular-nums">
            {weather.rainProbability}%
          </p>
          <p className="mt-1 text-xs text-[#6B786F]">Next 24 hours</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[#526058] flex items-center gap-1.5">
            <CloudRain className="h-3.5 w-3.5 text-[#166534]" />
            Expected Rainfall
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#1F2937] tabular-nums">
            {weather.expectedRainfall} mm
          </p>
          <p className="mt-1 text-xs text-[#6B786F]">Simulated volume</p>
        </Card>
        <Card className="p-4 col-span-2 lg:col-span-1">
          <p className="text-xs text-[#526058] flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5 text-[#166534]" />
            Wind Speed
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#1F2937] tabular-nums">
            {weather.windSpeed} km/h
          </p>
          <p className="mt-1 text-xs text-[#6B786F]">
            {weather.windSpeed >= 18 ? 'Gusty breezes' : 'Light to steady'}
          </p>
        </Card>
      </div>

      {/* Weather Alerts */}
      <div className="space-y-3">
        <h3 className="font-display text-base font-semibold text-[#1F2937]">
          Active Weather Alerts for {weather.district}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {alerts.map((al) => (
            <Card key={al.id} className="p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-semibold text-[#1F2937] flex items-center gap-1.5">
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      al.severity === 'High'
                        ? 'text-[#DC2626]'
                        : al.severity === 'Moderate'
                        ? 'text-[#CA8A04]'
                        : 'text-[#166534]'
                    }`}
                  />
                  {al.title}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    al.severity === 'High'
                      ? 'text-[#DC2626]'
                      : al.severity === 'Moderate'
                      ? 'text-[#A16207]'
                      : 'text-[#166534]'
                  }`}
                >
                  {al.severity}
                </span>
              </div>
              <p className="text-xs text-[#4B594F]">{al.detail}</p>
              <p className="text-xs text-[#166534] font-medium pt-1">
                Field Advisory: {al.action}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast Table */}
      <Card className="p-5 overflow-x-auto">
        <h3 className="font-display text-base font-semibold text-[#1F2937] mb-4">
          7-Day Simulated Forecast ({weather.district})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weather.forecast.map((f) => (
            <div
              key={f.day}
              className="rounded-lg border border-[#EEF2EB] bg-[#F8FAF5] p-3 text-center"
            >
              <p className="text-xs font-semibold text-[#1F2937]">{f.day}</p>
              <p className="mt-1 text-[11px] text-[#526058] truncate">{f.condition}</p>
              <p className="mt-2 font-mono text-sm font-semibold text-[#166534] tabular-nums">
                {f.tempMax}° / {f.tempMin}°
              </p>
              <p className="mt-1 font-mono text-[11px] text-[#526058] tabular-nums">
                Rain {f.rainfall}mm · RH {f.humidity}%
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* 3 Charts: Temperature, Rainfall, Humidity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="font-display text-sm font-semibold text-[#1F2937] mb-3">
            Temperature Trend (°C)
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weather.forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EEE4" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#526058' }} />
                <YAxis tick={{ fontSize: 11, fill: '#526058' }} domain={[18, 40]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="tempMax"
                  name="Max °C"
                  stroke="#166534"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="tempMin"
                  name="Min °C"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-sm font-semibold text-[#1F2937] mb-3">
            Expected Rainfall (mm)
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weather.forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EEE4" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#526058' }} />
                <YAxis tick={{ fontSize: 11, fill: '#526058' }} />
                <Tooltip />
                <Bar dataKey="rainfall" name="Rainfall (mm)" fill="#166534" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-sm font-semibold text-[#1F2937] mb-3">
            Relative Humidity (%)
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weather.forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EEE4" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#526058' }} />
                <YAxis tick={{ fontSize: 11, fill: '#526058' }} domain={[40, 100]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity %"
                  stroke="#EAB308"
                  fill="#FEF08A"
                  fillOpacity={0.45}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── B. CROP DISEASE RISK ALERTS ── */
export function DiseaseRiskPanel() {
  const { t } = useLanguage();
  const [input, setInput] = useState<DiseaseRiskInput>({
    crop: 'Tomato',
    growthStage: 'Flowering',
    location: 'Trichy',
    temperature: 31,
    humidity: 82,
    rainfallCondition: 'Frequent Rainfall',
  });

  const result = useMemo(() => evaluateDiseaseRisk(input), [input]);

  const riskColor =
    result.riskLevel === 'High'
      ? 'text-[#DC2626]'
      : result.riskLevel === 'Moderate'
      ? 'text-[#A16207]'
      : 'text-[#166534]';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-[#1F2937]">
          Crop Disease Risk Simulator
        </h2>
        <p className="text-sm text-[#526058]">
          Adjust crop, growth stage, and simulated field weather to preview rule-based risk indicators and preventive scouting precautions.
        </p>
      </div>

      <DisclaimerNotice text={t('diseaseDisclaimer')} tone="warning" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Controls */}
        <Card className="lg:col-span-5 p-6 space-y-4">
          <h3 className="font-display text-base font-semibold text-[#1F2937]">
            Simulated Field Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#374151]">Crop</label>
              <SelectField
                value={input.crop}
                onChange={(e) =>
                  setInput({ ...input, crop: e.target.value as DiseaseRiskInput['crop'] })
                }
                className="mt-1"
              >
                {(['Tomato', 'Rice', 'Brinjal', 'Chilli', 'Banana', 'Groundnut'] as const).map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </SelectField>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151]">Growth Stage</label>
              <SelectField
                value={input.growthStage}
                onChange={(e) =>
                  setInput({
                    ...input,
                    growthStage: e.target.value as DiseaseRiskInput['growthStage'],
                  })
                }
                className="mt-1"
              >
                {(['Seedling', 'Vegetative', 'Flowering', 'Fruiting / Grain Filling'] as const).map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </SelectField>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#374151]">District</label>
              <SelectField
                value={input.location}
                onChange={(e) =>
                  setInput({ ...input, location: e.target.value as TamilNaduDistrict })
                }
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
              <label className="block text-xs font-medium text-[#374151]">Rainfall Condition</label>
              <SelectField
                value={input.rainfallCondition}
                onChange={(e) =>
                  setInput({
                    ...input,
                    rainfallCondition: e.target.value as DiseaseRiskInput['rainfallCondition'],
                  })
                }
                className="mt-1"
              >
                {(['Dry / No Rain', 'Light Showers', 'Frequent Rainfall', 'Heavy Downpour'] as const).map(
                  (r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  )
                )}
              </SelectField>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-[#374151]">
              <span>Temperature</span>
              <span className="font-mono tabular-nums">{input.temperature}°C</span>
            </div>
            <input
              type="range"
              min={18}
              max={42}
              value={input.temperature}
              onChange={(e) => setInput({ ...input, temperature: Number(e.target.value) })}
              className="mt-1.5 w-full accent-[#166534]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-[#374151]">
              <span>Relative Humidity</span>
              <span className="font-mono tabular-nums">{input.humidity}%</span>
            </div>
            <input
              type="range"
              min={35}
              max={98}
              value={input.humidity}
              onChange={(e) => setInput({ ...input, humidity: Number(e.target.value) })}
              className="mt-1.5 w-full accent-[#166534]"
            />
          </div>
        </Card>

        {/* Risk Result */}
        <Card className="lg:col-span-7 p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EEF2EB] pb-4">
            <div>
              <p className="text-xs text-[#526058]">
                {result.crop} · {input.growthStage} · {input.location}
              </p>
              <h3 className="mt-1 font-display text-xl font-bold text-[#1F2937]">
                {result.diseaseCategory}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#526058]">Simulated Risk Level</p>
              <p className={`mt-0.5 font-display text-lg font-bold flex items-center gap-1.5 justify-end ${riskColor}`}>
                <ShieldAlert className="h-5 w-5" />
                {result.riskLevel} Risk
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-[#1F2937]">Conditions Contributing to Risk</h4>
              <ul className="mt-1.5 list-disc pl-5 space-y-1 text-[#4B594F]">
                {result.contributingConditions.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1F2937]">Warning Signs to Monitor in Field</h4>
              <ul className="mt-1.5 list-disc pl-5 space-y-1 text-[#4B594F]">
                {result.warningSigns.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1F2937]">Preventive Precautions</h4>
              <ul className="mt-1.5 list-disc pl-5 space-y-1 text-[#166534]">
                {result.precautions.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-xs text-[#6B786F] border-t border-[#EEF2EB] pt-3">
            Note: Weather conditions alone never confirm a crop disease. Always verify field symptoms with a qualified agricultural specialist.
          </p>
        </Card>
      </div>
    </div>
  );
}

/* ── C. FERTILIZER RECOMMENDATION ── */
export function FertilizerGuidePanel() {
  const { t } = useLanguage();
  const { currentUser, pushNotification } = useAppData();

  const [input, setInput] = useState<FertilizerInput>({
    crop: 'Tomato',
    soilType: 'Red Loamy',
    hasSoilTest: true,
    soilPh: 6.7,
    nitrogen: 195,
    phosphorus: 16,
    potassium: 130,
    growthStage: 'Vegetative Growth',
  });

  const result = useMemo(() => evaluateFertilizerGuidance(input), [input]);

  const handleSaveGuidance = () => {
    if (currentUser) {
      pushNotification(
        currentUser.id,
        'Fertilizer Guidance Updated',
        `Saved simulated soil & nutrient checklist for ${input.crop} (${input.soilType}).`,
        'fertilizer',
        currentUser.role === 'farmer' ? '/farmer/fertilizer' : undefined
      );
    }
    toast.success(`Saved simulated fertilizer checklist for ${input.crop}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-[#1F2937]">
          Simulated Fertilizer & Soil Guidance
        </h2>
        <p className="text-sm text-[#526058]">
          Enter crop, soil type, and soil-test values to inspect general nutrient categories and application timing.
        </p>
      </div>

      <DisclaimerNotice text={t('fertilizerDisclaimer')} tone="warning" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Form Inputs */}
        <Card className="lg:col-span-5 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#374151]">Crop</label>
              <SelectField
                value={input.crop}
                onChange={(e) =>
                  setInput({ ...input, crop: e.target.value as FertilizerInput['crop'] })
                }
                className="mt-1"
              >
                {(['Tomato', 'Rice', 'Brinjal', 'Chilli', 'Banana', 'Groundnut', 'Onion'] as const).map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </SelectField>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151]">Soil Type</label>
              <SelectField
                value={input.soilType}
                onChange={(e) =>
                  setInput({ ...input, soilType: e.target.value as FertilizerInput['soilType'] })
                }
                className="mt-1"
              >
                {(['Alluvial', 'Red Loamy', 'Black Cotton', 'Sandy Loam', 'Clay Loam'] as const).map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </SelectField>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#374151]">Growth Stage</label>
            <SelectField
              value={input.growthStage}
              onChange={(e) =>
                setInput({
                  ...input,
                  growthStage: e.target.value as FertilizerInput['growthStage'],
                })
              }
              className="mt-1"
            >
              {(['Basal / Land Prep', 'Vegetative Growth', 'Flowering & Fruit Set', 'Maturity'] as const).map(
                (st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                )
              )}
            </SelectField>
          </div>

          <label className="flex items-center gap-2.5 rounded-lg border border-[#E2E8DF] bg-[#F8FAF5] p-3 text-xs font-medium text-[#1F2937] cursor-pointer">
            <input
              type="checkbox"
              checked={input.hasSoilTest}
              onChange={(e) => setInput({ ...input, hasSoilTest: e.target.checked })}
              className="h-4 w-4 accent-[#166534]"
            />
            I have soil-test values (pH and N-P-K readings)
          </label>

          {input.hasSoilTest ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#374151]">Soil pH (4.5–9.0)</label>
                <Input
                  type="number"
                  step="0.1"
                  min={4.5}
                  max={9.0}
                  value={input.soilPh ?? 6.8}
                  onChange={(e) => setInput({ ...input, soilPh: Number(e.target.value) })}
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151]">Nitrogen (kg/ha)</label>
                <Input
                  type="number"
                  min={0}
                  max={600}
                  value={input.nitrogen ?? 200}
                  onChange={(e) => setInput({ ...input, nitrogen: Number(e.target.value) })}
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151]">Phosphorus (kg/ha)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={input.phosphorus ?? 16}
                  onChange={(e) => setInput({ ...input, phosphorus: Number(e.target.value) })}
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151]">Potassium (kg/ha)</label>
                <Input
                  type="number"
                  min={0}
                  max={500}
                  value={input.potassium ?? 150}
                  onChange={(e) => setInput({ ...input, potassium: Number(e.target.value) })}
                  className="mt-1 font-mono"
                />
              </div>
            </div>
          ) : (
            <DisclaimerNotice
              tone="warning"
              text="Please obtain a soil test for a more reliable recommendation."
            />
          )}

          <Button type="button" variant="secondary" className="w-full" onClick={handleSaveGuidance}>
            <FlaskConical className="h-4 w-4" />
            Save Guidance to My Notifications
          </Button>
        </Card>

        {/* Output Panel */}
        <Card className="lg:col-span-7 p-6 space-y-5">
          <div className="border-b border-[#EEF2EB] pb-4">
            <p className="text-xs font-medium text-[#166534]">Simulated Demonstration Output</p>
            <h3 className="mt-1 font-display text-lg font-bold text-[#1F2937]">
              {result.soilSummary}
            </h3>
          </div>

          {/* Nutrient Indicators */}
          <div className="grid grid-cols-3 gap-3">
            {result.nutrients.map((n) => (
              <div
                key={n.name}
                className="rounded-lg border border-[#EEF2EB] bg-[#F8FAF5] p-3"
              >
                <p className="text-xs text-[#526058]">{n.name}</p>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    n.level === 'Low'
                      ? 'text-[#DC2626]'
                      : n.level === 'Medium'
                      ? 'text-[#A16207]'
                      : n.level === 'Adequate'
                      ? 'text-[#166534]'
                      : 'text-[#6B786F]'
                  }`}
                >
                  {n.level}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-[#6B786F] tabular-nums">
                  {n.valueLabel}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-[#1F2937]">Nutrient Observation</h4>
              <ul className="mt-1.5 list-disc pl-5 space-y-1 text-[#4B594F]">
                {result.possibleDeficiencies.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1F2937]">Suitable Fertilizer Categories (No Fixed Dosages)</h4>
              <ul className="mt-1.5 list-disc pl-5 space-y-1 text-[#166534]">
                {result.suitableCategories.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1F2937]">General Application Timing</h4>
              <ul className="mt-1.5 list-disc pl-5 space-y-1 text-[#4B594F]">
                {result.applicationTiming.map((tm) => (
                  <li key={tm}>{tm}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1F2937]">Precautionary Recommendations</h4>
              <ul className="mt-1.5 list-disc pl-5 space-y-1 text-[#6B786F]">
                {result.precautions.map((pr) => (
                  <li key={pr}>{pr}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── D. AI AGRICULTURAL ASSISTANT DEMO ── */
interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
}

export function AgriAssistantPanel() {
  const { language, t } = useLanguage();
  const [chatLang, setChatLang] = useState<Language>(language);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        language === 'ta'
          ? 'வணக்கம்! நான் உழவன் டைரக்ட் மாதிரி வேளாண் உதவியாளர். தக்காளி இலைகள், கனமழை, மண் வளம், அதிக ஈரப்பதம் அல்லது நீர் சிக்கனம் குறித்து கீழே உள்ள கேள்விகளைத் தேர்ந்தெடுக்கவும் அல்லது தட்டச்சு செய்யவும்.'
          : 'Hello! I am the Uzhavan Direct Agricultural Assistant demo. Select a suggested farming question below or type your own query in English or Tamil.',
    },
  ]);

  const sendQuestion = (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;
    const reply = matchAssistantReply(trimmed, chatLang);
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: trimmed },
      { id: `a-${Date.now() + 1}`, sender: 'assistant', text: reply },
    ]);
    setInput('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-[#1F2937]">
            Agricultural Assistant Demo (English & தமிழ்)
          </h2>
          <p className="text-sm text-[#526058]">
            Keyword-matched sample agricultural guidance supporting bilingual demonstration Q&A.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-lg bg-[#EEF4EB] p-1 self-start">
          <button
            type="button"
            onClick={() => setChatLang('en')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer ${
              chatLang === 'en'
                ? 'bg-white text-[#166534] font-semibold shadow-xs'
                : 'text-[#4B594F]'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setChatLang('ta')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer ${
              chatLang === 'ta'
                ? 'bg-white text-[#166534] font-semibold shadow-xs'
                : 'text-[#4B594F]'
            }`}
          >
            தமிழ் (Tamil)
          </button>
        </div>
      </div>

      <DisclaimerNotice text={t('chatbotDisclaimer')} />

      {/* Suggested Sample Questions */}
      <div className="flex flex-wrap gap-2">
        {ASSISTANT_QA_BANK.slice(0, 5).map((qa) => {
          const qText = chatLang === 'ta' ? qa.questionTa : qa.questionEn;
          return (
            <button
              key={qa.id}
              type="button"
              onClick={() => sendQuestion(qText)}
              className="rounded-lg border border-[#D5DFD0] bg-white px-3 py-2 text-left text-xs font-medium text-[#1F2937] hover:border-[#166534] hover:bg-[#F3F8F1] transition-colors cursor-pointer"
            >
              {qText}
            </button>
          );
        })}
      </div>

      {/* Chat Thread */}
      <Card className="overflow-hidden flex flex-col">
        <div className="h-96 overflow-y-auto p-5 space-y-4 bg-[#FAFDF8]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-[#166534] text-white'
                    : 'border border-[#E2E8DF] bg-white text-[#1F2937]'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[#166534]">
                    <Bot className="h-3.5 w-3.5" />
                    Uzhavan Assistant (Demo)
                  </p>
                )}
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendQuestion(input);
          }}
          className="border-t border-[#E2E8DF] bg-white p-3 flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              chatLang === 'ta'
                ? 'உங்கள் விவசாயக் கேள்வியைத் தட்டச்சு செய்யவும்...'
                : 'Ask about tomato leaves, rainfall, soil health, humidity, or water saving...'
            }
          />
          <Button type="submit" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}

/* ── E. SMART CROP RECOMMENDATION PANEL ── */
export function CropRecommendationPanel({
  defaultDistrict = 'Trichy',
  defaultArea = 4,
}: {
  defaultDistrict?: TamilNaduDistrict;
  defaultArea?: number;
}) {
  const { t } = useLanguage();
  const { currentUser, marketPrices, pushNotification } = useAppData();

  const initialInput: CropRecommendationInput = {
    district: defaultDistrict,
    landAreaAcres: defaultArea > 0 ? defaultArea : 4,
    soilType: 'Red Loamy',
    season: 'Samba / Thaladi (Aug–Jan)',
    waterAvailability: 'Moderate (Drip / Well)',
    temperature: 30,
    humidity: 72,
    soilPh: 6.7,
    rainfallMm: 12,
    budgetLevel: 'Moderate',
  };

  // Draft form state edited by user vs committed analyzed snapshot
  const [formInput, setFormInput] = useState<CropRecommendationInput>(initialInput);
  const [analyzedInput, setAnalyzedInput] = useState<CropRecommendationInput>(initialInput);

  const hasPendingChanges = useMemo(
    () => JSON.stringify(formInput) !== JSON.stringify(analyzedInput),
    [formInput, analyzedInput]
  );

  const recommendations = useMemo(
    () => evaluateCropRecommendations(analyzedInput),
    [analyzedInput]
  );
  const topRecommendations = recommendations.slice(0, 4);
  const chartData = recommendations.slice(0, 5).map((r) => ({
    name: r.cropName.split('(')[0].trim().slice(0, 16),
    score: r.score,
  }));

  const hasWeatherDistrict = ['Trichy', 'Thanjavur', 'Madurai', 'Salem'].includes(
    formInput.district
  );

  const handleAnalyzeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzedInput({ ...formInput });
    toast.success(`Updated crop recommendations for ${formInput.district} (${formInput.soilType})`);
  };

  const handleReset = () => {
    setFormInput(initialInput);
    setAnalyzedInput(initialInput);
    toast.success('Field parameters reset to defaults');
  };

  const handleSyncDistrictWeather = () => {
    const key = hasWeatherDistrict
      ? (formInput.district as DistrictWeather['district'])
      : 'Trichy';
    const w = SIMULATED_WEATHER[key];
    setFormInput((prev) => ({
      ...prev,
      temperature: w.temperature,
      humidity: w.humidity,
      rainfallMm: w.expectedRainfall,
    }));
    toast.success(
      `Loaded ${w.district} demo weather (${w.temperature}°C, ${w.humidity}% RH, ${w.expectedRainfall}mm). Click "Get Crop Recommendation" to apply.`
    );
  };

  const handleSaveRecommendation = () => {
    const best = topRecommendations[0];
    if (!best) return;
    if (currentUser) {
      pushNotification(
        currentUser.id,
        'Crop Recommendation Saved',
        `Top simulated planting match for ${analyzedInput.landAreaAcres} acres in ${analyzedInput.district} (${analyzedInput.soilType}): ${best.cropName} (${best.score}% match).`,
        'system',
        currentUser.role === 'farmer' ? '/farmer/crop-recommendation' : undefined
      );
    }
    toast.success(`Saved "${best.cropName}" planting recommendation to your alerts`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-[#1F2937]">
            Smart Crop Recommendation Advisor
          </h2>
          <p className="text-sm text-[#526058]">
            Set your district, land area, soil, water, and climate conditions below, then click{' '}
            <strong className="text-[#1F2937]">Get Crop Recommendation</strong> to generate ranked planting matches.
          </p>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={handleSyncDistrictWeather}>
          <RefreshCw className="h-3.5 w-3.5 text-[#166534]" />
          Fill {hasWeatherDistrict ? formInput.district : 'Trichy'} Demo Weather
        </Button>
      </div>

      <DisclaimerNotice text={t('cropRecDisclaimer')} tone="warning" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left: Farm & Climate Parameter Form */}
        <Card className="lg:col-span-5 p-6">
          <form onSubmit={handleAnalyzeSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEF2EB] pb-3">
              <h3 className="font-display text-base font-semibold text-[#1F2937] flex items-center gap-2">
                <Compass className="h-4.5 w-4.5 text-[#166534]" />
                Your Field Conditions
              </h3>
              <span className="font-mono text-xs text-[#526058] tabular-nums">
                {formInput.landAreaAcres} acres
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#374151]">
                  District / Location
                </label>
                <SelectField
                  value={formInput.district}
                  onChange={(e) =>
                    setFormInput({ ...formInput, district: e.target.value as TamilNaduDistrict })
                  }
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
                <label className="block text-xs font-medium text-[#374151]">
                  Land Area (Acres)
                </label>
                <Input
                  type="number"
                  min={0.25}
                  max={200}
                  step={0.25}
                  value={formInput.landAreaAcres}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      landAreaAcres: Math.max(0.25, Number(e.target.value) || 0.25),
                    })
                  }
                  className="mt-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#374151]">Soil Type</label>
                <SelectField
                  value={formInput.soilType}
                  onChange={(e) =>
                    setFormInput({ ...formInput, soilType: e.target.value as SoilTypeOption })
                  }
                  className="mt-1"
                >
                  {(['Alluvial', 'Red Loamy', 'Black Cotton', 'Sandy Loam', 'Clay Loam'] as const).map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
                </SelectField>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151]">Planting Season</label>
                <SelectField
                  value={formInput.season}
                  onChange={(e) =>
                    setFormInput({ ...formInput, season: e.target.value as FarmingSeason })
                  }
                  className="mt-1"
                >
                  {(
                    [
                      'Kuruvai (Jun–Sep)',
                      'Samba / Thaladi (Aug–Jan)',
                      'Navarai / Summer (Jan–May)',
                    ] as const
                  ).map((sn) => (
                    <option key={sn} value={sn}>
                      {sn}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#374151]">
                  Water / Irrigation Access
                </label>
                <SelectField
                  value={formInput.waterAvailability}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      waterAvailability: e.target.value as WaterAvailability,
                    })
                  }
                  className="mt-1"
                >
                  {(
                    [
                      'High (Canal / Borewell)',
                      'Moderate (Drip / Well)',
                      'Low (Rainfed / Dryland)',
                    ] as const
                  ).map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </SelectField>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151]">
                  Input Budget Level
                </label>
                <SelectField
                  value={formInput.budgetLevel}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      budgetLevel: e.target.value as CropRecommendationInput['budgetLevel'],
                    })
                  }
                  className="mt-1"
                >
                  <option value="Low">Low (Minimal Input)</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High (Orchard / Intensive)</option>
                </SelectField>
              </div>
            </div>

            {/* Climate & Soil Controls */}
            <div className="space-y-3 pt-2 border-t border-[#EEF2EB]">
              <div>
                <div className="flex justify-between text-xs font-medium text-[#374151]">
                  <span>Average Temperature</span>
                  <span className="font-mono tabular-nums">{formInput.temperature}°C</span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={42}
                  value={formInput.temperature}
                  onChange={(e) =>
                    setFormInput({ ...formInput, temperature: Number(e.target.value) })
                  }
                  className="mt-1 w-full accent-[#166534]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-[#374151]">
                  <span>Relative Humidity</span>
                  <span className="font-mono tabular-nums">{formInput.humidity}%</span>
                </div>
                <input
                  type="range"
                  min={35}
                  max={95}
                  value={formInput.humidity}
                  onChange={(e) =>
                    setFormInput({ ...formInput, humidity: Number(e.target.value) })
                  }
                  className="mt-1 w-full accent-[#166534]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#374151]">
                    Soil pH (4.5–9.0)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min={4.5}
                    max={9.0}
                    value={formInput.soilPh}
                    onChange={(e) =>
                      setFormInput({ ...formInput, soilPh: Number(e.target.value) || 6.5 })
                    }
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151]">
                    Expected Rain (mm)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formInput.rainfallMm}
                    onChange={(e) =>
                      setFormInput({
                        ...formInput,
                        rainfallMm: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="mt-1 font-mono"
                  />
                </div>
              </div>
            </div>

            {hasPendingChanges && (
              <p className="rounded-lg border border-[#F3DF99] bg-[#FEFCE8] px-3 py-2 text-xs text-[#713F12]">
                Inputs modified — click <strong>Get Crop Recommendation</strong> to update your results.
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Button type="submit" className="flex-1" size="lg">
                <Sprout className="h-4 w-4" />
                Get Crop Recommendation
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </form>
        </Card>

        {/* Right: Analyzed Snapshot Summary + Suitability Chart + Ranked Crop Recommendations */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-sm font-semibold text-[#1F2937]">
                  Top 5 Crop Suitability Comparison (Simulated %)
                </h3>
                <p className="mt-0.5 text-xs text-[#526058]">
                  Showing results for: <strong className="text-[#1F2937]">{analyzedInput.district}</strong> ·{' '}
                  {analyzedInput.landAreaAcres} ac · {analyzedInput.soilType} · {analyzedInput.temperature}°C ·{' '}
                  {analyzedInput.humidity}% RH · {analyzedInput.waterAvailability}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSaveRecommendation}
              >
                Save Top Pick
              </Button>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 12, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EEE4" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#526058' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={122}
                    tick={{ fontSize: 11, fill: '#1F2937' }}
                  />
                  <Tooltip formatter={(val) => [`${val}%`, 'Suitability Match']} />
                  <Bar dataKey="score" fill="#166534" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="space-y-4">
            {topRecommendations.map((rec, index) => {
              const refPrice = marketPrices.find((m) => m.cropKey === rec.cropKey);
              const isTop = index === 0;

              return (
                <Card
                  key={rec.id}
                  className={`p-5 space-y-3 ${isTop ? 'border-[#166534]/50 bg-[#FCFEFB]' : ''}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EEF2EB] pb-3">
                    <div>
                      <p className="text-xs font-medium text-[#526058]">
                        {isTop ? '01. Top Recommended Match' : `0${index + 1}. Strong Alternative`} ·{' '}
                        {rec.category} · {rec.durationDays}
                      </p>
                      <h3 className="mt-1 font-display text-lg font-bold text-[#1F2937]">
                        {rec.cropName}{' '}
                        <span className="text-sm font-medium text-[#526058]">({rec.tamilName})</span>
                      </h3>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-2xl font-bold text-[#166534] tabular-nums">
                        {rec.score}%
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          rec.suitabilityLabel === 'Highly Suitable'
                            ? 'text-[#166534]'
                            : rec.suitabilityLabel === 'Suitable'
                            ? 'text-[#15803D]'
                            : 'text-[#A16207]'
                        }`}
                      >
                        {rec.suitabilityLabel}
                      </p>
                    </div>
                  </div>

                  {/* Key agronomy metadata row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#526058]">
                    <span>
                      Water: <strong className="text-[#1F2937]">{rec.waterNeed}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Ideal Soils: <strong className="text-[#1F2937]">{rec.idealSoils.join(', ')}</strong>
                    </span>
                    {refPrice && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Demo Market Ref:{' '}
                          <strong className="text-[#166534]">
                            {formatINR(refPrice.referencePrice)}/{UNIT_SHORT_MAP[refPrice.unit]}
                          </strong>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Why it matches */}
                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-[#1F2937]">Why This Crop Fits Your Inputs</p>
                    <ul className="space-y-1 text-[#3F4F44]">
                      {rec.reasons.slice(0, 4).map((reason) => (
                        <li key={reason} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#166534]" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Area planning + Rotation tip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg bg-[#F4F8F2] p-3 text-xs">
                    <div>
                      <p className="font-semibold text-[#1F2937]">
                        Land Area Plan ({analyzedInput.landAreaAcres} ac)
                      </p>
                      <p className="mt-0.5 text-[#4B594F] leading-relaxed">{rec.areaNote}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1F2937]">Market & Crop Rotation Note</p>
                      <p className="mt-0.5 text-[#4B594F] leading-relaxed">
                        {rec.simulatedDemand} {rec.rotationTip}
                      </p>
                    </div>
                  </div>

                  {rec.cautions.length > 0 && (
                    <div className="text-xs text-[#713F12] bg-[#FEFCE8] border border-[#F3DF99] rounded-lg px-3 py-2">
                      <span className="font-semibold">Watch-out: </span>
                      {rec.cautions[0]}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

