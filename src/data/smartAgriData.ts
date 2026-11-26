import type {
  CropRecommendationInput,
  CropRecommendationItem,
  DiseaseRiskInput,
  DiseaseRiskResult,
  DistrictWeather,
  FarmingSeason,
  FertilizerInput,
  FertilizerResult,
  Language,
  ProductCategory,
  SoilTypeOption,
  TamilNaduDistrict,
  WaterAvailability,
} from '@/src/types';

export const SIMULATED_WEATHER: Record<DistrictWeather['district'], DistrictWeather> = {
  Trichy: {
    district: 'Trichy',
    temperature: 32,
    humidity: 78,
    rainProbability: 75,
    expectedRainfall: 18,
    windSpeed: 16,
    condition: 'Humid with Evening Showers',
    forecast: [
      { day: 'Today', tempMax: 32, tempMin: 25, rainfall: 18, humidity: 78, condition: 'Rain Likely' },
      { day: 'Thu', tempMax: 31, tempMin: 24, rainfall: 22, humidity: 82, condition: 'Heavy Showers' },
      { day: 'Fri', tempMax: 30, tempMin: 24, rainfall: 14, humidity: 79, condition: 'Scattered Rain' },
      { day: 'Sat', tempMax: 32, tempMin: 25, rainfall: 6, humidity: 74, condition: 'Partly Cloudy' },
      { day: 'Sun', tempMax: 33, tempMin: 25, rainfall: 4, humidity: 70, condition: 'Warm & Breezy' },
      { day: 'Mon', tempMax: 34, tempMin: 26, rainfall: 2, humidity: 68, condition: 'Mostly Sunny' },
      { day: 'Tue', tempMax: 33, tempMin: 25, rainfall: 10, humidity: 73, condition: 'Light Showers' },
    ],
  },
  Thanjavur: {
    district: 'Thanjavur',
    temperature: 30,
    humidity: 85,
    rainProbability: 80,
    expectedRainfall: 25,
    windSpeed: 19,
    condition: 'Heavy Monsoon Cloud Cover',
    forecast: [
      { day: 'Today', tempMax: 30, tempMin: 24, rainfall: 25, humidity: 85, condition: 'Heavy Rain' },
      { day: 'Thu', tempMax: 29, tempMin: 23, rainfall: 32, humidity: 88, condition: 'Downpour' },
      { day: 'Fri', tempMax: 30, tempMin: 24, rainfall: 16, humidity: 84, condition: 'Moderate Rain' },
      { day: 'Sat', tempMax: 31, tempMin: 24, rainfall: 9, humidity: 80, condition: 'Cloudy' },
      { day: 'Sun', tempMax: 31, tempMin: 25, rainfall: 5, humidity: 77, condition: 'Humid' },
      { day: 'Mon', tempMax: 32, tempMin: 25, rainfall: 8, humidity: 78, condition: 'Light Rain' },
      { day: 'Tue', tempMax: 31, tempMin: 24, rainfall: 14, humidity: 82, condition: 'Showers' },
    ],
  },
  Madurai: {
    district: 'Madurai',
    temperature: 34,
    humidity: 65,
    rainProbability: 20,
    expectedRainfall: 2,
    windSpeed: 11,
    condition: 'Warm & Partly Sunny',
    forecast: [
      { day: 'Today', tempMax: 34, tempMin: 25, rainfall: 2, humidity: 65, condition: 'Warm & Sunny' },
      { day: 'Thu', tempMax: 35, tempMin: 26, rainfall: 0, humidity: 60, condition: 'Hot Afternoon' },
      { day: 'Fri', tempMax: 36, tempMin: 26, rainfall: 1, humidity: 58, condition: 'Dry Heat' },
      { day: 'Sat', tempMax: 35, tempMin: 25, rainfall: 4, humidity: 63, condition: 'Partly Cloudy' },
      { day: 'Sun', tempMax: 34, tempMin: 25, rainfall: 6, humidity: 66, condition: 'Mild Breeze' },
      { day: 'Mon', tempMax: 33, tempMin: 24, rainfall: 8, humidity: 69, condition: 'Light Shower' },
      { day: 'Tue', tempMax: 34, tempMin: 25, rainfall: 2, humidity: 64, condition: 'Sunny' },
    ],
  },
  Salem: {
    district: 'Salem',
    temperature: 29,
    humidity: 72,
    rainProbability: 60,
    expectedRainfall: 12,
    windSpeed: 14,
    condition: 'Cool Clouds & Light Showers',
    forecast: [
      { day: 'Today', tempMax: 29, tempMin: 22, rainfall: 12, humidity: 72, condition: 'Light Rain' },
      { day: 'Thu', tempMax: 28, tempMin: 21, rainfall: 15, humidity: 76, condition: 'Showers' },
      { day: 'Fri', tempMax: 29, tempMin: 22, rainfall: 8, humidity: 73, condition: 'Overcast' },
      { day: 'Sat', tempMax: 30, tempMin: 22, rainfall: 5, humidity: 69, condition: 'Partly Cloudy' },
      { day: 'Sun', tempMax: 31, tempMin: 23, rainfall: 2, humidity: 65, condition: 'Pleasant' },
      { day: 'Mon', tempMax: 30, tempMin: 22, rainfall: 6, humidity: 70, condition: 'Evening Clouds' },
      { day: 'Tue', tempMax: 29, tempMin: 22, rainfall: 11, humidity: 74, condition: 'Light Showers' },
    ],
  },
};

export interface WeatherAlertItem {
  id: string;
  severity: 'High' | 'Moderate' | 'Advisory';
  title: string;
  detail: string;
  action: string;
}

export function getWeatherAlerts(weather: DistrictWeather): WeatherAlertItem[] {
  const alerts: WeatherAlertItem[] = [];

  if (weather.expectedRainfall >= 18 || weather.rainProbability >= 75) {
    alerts.push({
      id: 'heavy-rain',
      severity: 'High',
      title: 'Heavy Rainfall Expected',
      detail: `${weather.rainProbability}% probability with ${weather.expectedRainfall} mm expected rainfall in ${weather.district}.`,
      action: 'Clear field drainage channels, postpone foliar spraying, and cover harvested produce.',
    });
  } else if (weather.expectedRainfall >= 10) {
    alerts.push({
      id: 'moderate-rain',
      severity: 'Moderate',
      title: 'Moderate Showers Forecast',
      detail: `Around ${weather.expectedRainfall} mm rainfall expected in ${weather.district}.`,
      action: 'Pause routine flood irrigation and monitor low-lying seedling beds.',
    });
  }

  if (weather.temperature >= 34) {
    alerts.push({
      id: 'high-temp',
      severity: 'High',
      title: 'High Temperature Warning',
      detail: `Daytime temperature reaching ${weather.temperature}°C increases evapotranspiration stress.`,
      action: 'Schedule drip irrigation early morning or late evening and apply organic mulch.',
    });
  }

  if (weather.humidity >= 78) {
    alerts.push({
      id: 'high-humidity',
      severity: 'Moderate',
      title: 'High Humidity Warning',
      detail: `Relative humidity at ${weather.humidity}% creates favorable micro-climates for fungal leaf diseases.`,
      action: 'Inspect lower canopies for leaf spots and ensure wide airflow spacing.',
    });
  }

  if (weather.windSpeed >= 18) {
    alerts.push({
      id: 'strong-wind',
      severity: 'Moderate',
      title: 'Strong Wind Warning',
      detail: `Wind gusts around ${weather.windSpeed} km/h observed in ${weather.district}.`,
      action: 'Check banana propping poles and staked tomato trellises for stability.',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'normal-conditions',
      severity: 'Advisory',
      title: 'Favorable Field Window',
      detail: `Simulated conditions in ${weather.district} are within normal seasonal range.`,
      action: 'Suitable for routine harvesting, sorting, and morning field scouting.',
    });
  }

  return alerts;
}

export function evaluateDiseaseRisk(input: DiseaseRiskInput): DiseaseRiskResult {
  const { crop, growthStage, temperature, humidity, rainfallCondition } = input;
  const wetRain = rainfallCondition === 'Frequent Rainfall' || rainfallCondition === 'Heavy Downpour';
  const highHumidity = humidity >= 75;
  const warmTemp = temperature >= 26 && temperature <= 34;
  const hotDry = temperature >= 34 && humidity < 65;

  let score = 0;
  const conditions: string[] = [];

  if (highHumidity) {
    score += 2;
    conditions.push(`Elevated relative humidity (${humidity}%) prolongs leaf surface wetness.`);
  }
  if (wetRain) {
    score += 2;
    conditions.push(`${rainfallCondition} increases soil splash and spore dispersal.`);
  }
  if (warmTemp) {
    score += 1;
    conditions.push(`Warm ambient temperature (${temperature}°C) supports faster pathogen cycles.`);
  }
  if (hotDry) {
    score += 1;
    conditions.push(`Warm, dry air (${temperature}°C, ${humidity}% RH) can increase sap-sucking pest pressure.`);
  }
  if (growthStage === 'Flowering' || growthStage === 'Fruiting / Grain Filling') {
    score += 1;
    conditions.push(`${growthStage} stage tissues are generally more sensitive to canopy stress.`);
  }

  if (conditions.length === 0) {
    conditions.push(`Moderate simulated conditions (${temperature}°C, ${humidity}% humidity, ${rainfallCondition}).`);
  }

  const riskLevel: DiseaseRiskResult['riskLevel'] =
    score >= 5 ? 'High' : score >= 3 ? 'Moderate' : 'Low';

  const cropProfiles: Record<
    DiseaseRiskInput['crop'],
    {
      wetDisease: string;
      dryDisease: string;
      signs: string[];
      precautions: string[];
    }
  > = {
    Tomato: {
      wetDisease: 'Potential Fungal Blight & Leaf Spot Risk',
      dryDisease: 'Potential Leaf Curl / Sucking Pest Stress Risk',
      signs: [
        'Dark concentric rings or water-soaked patches on lower leaves',
        'Yellowing leaf margins spreading upward after rain',
        'Curling or mottling on young terminal shoots',
      ],
      precautions: [
        'Improve bed drainage and avoid overhead evening watering',
        'Prune overcrowded lower leaves touching wet soil',
        'Scout plants twice weekly and consult a local agri-officer before any spray',
      ],
    },
    Rice: {
      wetDisease: 'Potential Blast / Sheath Blight Risk',
      dryDisease: 'Potential Leaf Folder / Moisture Stress Risk',
      signs: [
        'Spindle-shaped lesions with grey centers on rice blades',
        'Oval greenish-grey lesions near waterline leaf sheaths',
        'Uneven yellowing patches in dense tillering zones',
      ],
      precautions: [
        'Avoid excessive top-dressing of nitrogen during humid cloudy spells',
        'Maintain alternate wetting and drying instead of stagnant deep water',
        'Keep field bunds clear of grassy host weeds',
      ],
    },
    Brinjal: {
      wetDisease: 'Potential Phomopsis Blight / Bacterial Wilt Risk',
      dryDisease: 'Potential Shoot & Fruit Borer / Mite Stress Risk',
      signs: [
        'Sudden drooping of green leaves during midday warmth',
        'Circular brown sunken spots on leaves or tender fruits',
        'Wilting shoot tips with small pin-sized entry holes',
      ],
      precautions: [
        'Ensure raised-bed drainage so roots do not sit in standing rainwater',
        'Remove and dispose of visibly affected shoots early',
        'Use pheromone traps and seek extension advice for confirmed symptoms',
      ],
    },
    Chilli: {
      wetDisease: 'Potential Anthracnose / Die-Back Risk',
      dryDisease: 'Potential Thrips / Mite Leaf Curl Risk',
      signs: [
        'Sunken circular spots on maturing pods during wet spells',
        'Upward or downward boat-shaped curling of young chilli leaves',
        'Premature flower drop after humid rain events',
      ],
      precautions: [
        'Avoid working in wet chilli canopies to prevent mechanical spread',
        'Maintain clean inter-row airflow and drainage trenches',
        'Inspect undersides of young leaves regularly with a hand lens',
      ],
    },
    Banana: {
      wetDisease: 'Potential Sigatoka Leaf Spot Risk',
      dryDisease: 'Potential Moisture Stress / Weevil Monitoring Advisory',
      signs: [
        'Pale yellow streaks parallel to leaf veins turning dark brown',
        'Dry scorched leaf margins reducing active green canopy',
        'Softening around pseudostem base in poorly drained pockets',
      ],
      precautions: [
        'Maintain clear drainage furrows between banana rows during heavy rain',
        'Trim severely spotted older leaves safely away from healthy clumps',
        'Reinforce bamboo/wooden propping before gusty weather',
      ],
    },
    Groundnut: {
      wetDisease: 'Potential Tikka Leaf Spot & Rust Risk',
      dryDisease: 'Potential Leaf Miner / Dry Root Stress Risk',
      signs: [
        'Small dark circular spots surrounded by yellow halos on leaflets',
        'Orange-brown powdery pustules on lower leaf surfaces',
        'Premature defoliation prior to pod maturity',
      ],
      precautions: [
        'Prevent waterlogging in red/black soil plots after heavy rainfall',
        'Practice crop rotation with cereals or millets across seasons',
        'Verify symptoms with your block agricultural extension centre',
      ],
    },
  };

  const profile = cropProfiles[crop];
  const diseaseCategory = hotDry ? profile.dryDisease : profile.wetDisease;

  return {
    crop,
    diseaseCategory,
    riskLevel,
    contributingConditions: conditions,
    warningSigns: profile.signs,
    precautions: profile.precautions,
  };
}

export function evaluateFertilizerGuidance(input: FertilizerInput): FertilizerResult {
  if (!input.hasSoilTest) {
    return {
      hasSoilTest: false,
      soilSummary: `${input.crop} on ${input.soilType} soil (${input.growthStage} stage) — Soil test values not provided.`,
      phStatus: 'Unknown',
      nutrients: [
        { name: 'Nitrogen (N)', level: 'Not Tested', valueLabel: 'Not provided' },
        { name: 'Phosphorus (P)', level: 'Not Tested', valueLabel: 'Not provided' },
        { name: 'Potassium (K)', level: 'Not Tested', valueLabel: 'Not provided' },
      ],
      possibleDeficiencies: [
        'Please obtain a soil test for a more reliable recommendation.',
      ],
      suitableCategories: [
        'Well-decomposed Farmyard Manure (FYM) or Vermicompost for general soil structure',
        'Bio-fertilizers suitable for the selected crop (consult local extension desk)',
      ],
      applicationTiming: [
        'Incorporate organic compost during land preparation before sowing or transplanting.',
        'Avoid blind chemical fertilizer applications without laboratory NPK readings.',
      ],
      precautions: [
        'Visit your nearest Tamil Nadu Department of Agriculture Soil Testing Lab for an official Soil Health Card.',
        'Exact fertilizer quantities depend on lab test values, irrigation method, and local variety.',
      ],
    };
  }

  const ph = input.soilPh ?? 6.8;
  const n = input.nitrogen ?? 240;
  const p = input.phosphorus ?? 18;
  const k = input.potassium ?? 180;

  const phStatus: FertilizerResult['phStatus'] =
    ph < 6.0 ? 'Acidic' : ph > 7.8 ? 'Alkaline' : 'Optimal';

  const nLevel = n < 220 ? 'Low' : n < 320 ? 'Medium' : 'Adequate';
  const pLevel = p < 14 ? 'Low' : p < 24 ? 'Medium' : 'Adequate';
  const kLevel = k < 140 ? 'Low' : k < 240 ? 'Medium' : 'Adequate';

  const deficiencies: string[] = [];
  const categories: string[] = ['Organic Base: Well-rotted FYM / Vermicompost / Green Leaf Manure'];

  if (nLevel === 'Low') {
    deficiencies.push('Possible Nitrogen deficit (may limit early vegetative vigor and leaf greenness).');
    categories.push('Nitrogen-supporting sources (split nitrogenous fertilizers or neem-coated nitrogen category)');
  }
  if (pLevel === 'Low') {
    deficiencies.push('Possible Phosphorus deficit (important for early root development and flowering).');
    categories.push('Phosphatic base category (e.g. basal phosphate / rock phosphate enriched compost)');
  }
  if (kLevel === 'Low') {
    deficiencies.push('Possible Potassium deficit (supports fruit quality, grain filling, and stress tolerance).');
    categories.push('Potassic nutrient category (potash-rich basal or fruit-set support)');
  }
  if (phStatus === 'Acidic') {
    deficiencies.push(`Soil pH (${ph}) is mildly acidic, which can reduce phosphorus availability.`);
    categories.push('Soil amendment category: Agricultural lime guidance (verify rate via soil lab)');
  } else if (phStatus === 'Alkaline') {
    deficiencies.push(`Soil pH (${ph}) is alkaline, which may lock up iron and zinc micronutrients.`);
    categories.push('Soil amendment category: Gypsum + organic matter / crop-specific micronutrient mix');
  }

  if (deficiencies.length === 0) {
    deficiencies.push('Simulated NPK and pH values appear balanced; focus on maintenance nutrition and organic carbon.');
    categories.push('Balanced maintenance NPK category + bio-fertilizers (Azospirillum / Phosphobacteria)');
  }

  const timingMap: Record<FertilizerInput['growthStage'], string[]> = {
    'Basal / Land Prep': [
      'Incorporate organic compost and basal phosphorus sources prior to final ploughing.',
      'Ensure adequate soil moisture before applying basal nutrients.',
    ],
    'Vegetative Growth': [
      'Apply nitrogen-oriented top dressing in split phases rather than a single heavy round.',
      'Pair application with light irrigation so nutrients move cleanly into the root zone.',
    ],
    'Flowering & Fruit Set': [
      'Prioritize potassium and balanced micronutrients to support flower retention and uniform fruit fill.',
      'Reduce excess nitrogen to prevent overly leafy growth at the expense of fruiting.',
    ],
    Maturity: [
      'Avoid fresh nitrogen applications close to harvest to preserve shelf life and flavor.',
      'Plan post-harvest green manure incorporation to restore soil organic matter.',
    ],
  };

  return {
    hasSoilTest: true,
    soilSummary: `${input.crop} · ${input.soilType} Soil · pH ${ph.toFixed(1)} (${phStatus}) · ${input.growthStage}`,
    phStatus,
    nutrients: [
      { name: 'Nitrogen (N)', level: nLevel, valueLabel: `${n} kg/ha (demo)` },
      { name: 'Phosphorus (P)', level: pLevel, valueLabel: `${p} kg/ha (demo)` },
      { name: 'Potassium (K)', level: kLevel, valueLabel: `${k} kg/ha (demo)` },
    ],
    possibleDeficiencies: deficiencies,
    suitableCategories: categories,
    applicationTiming: timingMap[input.growthStage],
    precautions: [
      'Do not apply fertilizers immediately before heavy forecasted rainfall to avoid runoff.',
      'Exact dosage per acre should always be confirmed with a certified local agronomist or Soil Health Card.',
    ],
  };
}

export interface AssistantQA {
  id: string;
  keywords: string[];
  questionEn: string;
  questionTa: string;
  answerEn: string;
  answerTa: string;
}

export const ASSISTANT_QA_BANK: AssistantQA[] = [
  {
    id: 'tomato-yellow',
    keywords: ['tomato', 'yellow', 'leaves', 'leaf', 'தக்காளி', 'மஞ்சள்', 'இலை'],
    questionEn: 'Why are my tomato leaves turning yellow?',
    questionTa: 'என் தக்காளி இலைகள் ஏன் மஞ்சளாக மாறுகின்றன?',
    answerEn:
      'In demonstration field scenarios, yellowing tomato leaves commonly point to a few checkable causes:\n1. Waterlogging or uneven irrigation (check root drainage first).\n2. Nitrogen or magnesium deficiency starting on older lower leaves.\n3. Early fungal leaf spot during humid, rainy spells.\n\nSuggested next step: Inspect undersides of leaves for spots or pests, check soil drainage, and consult a local Tamil Nadu agricultural officer before applying any treatment.',
    answerTa:
      'மாதிரி வேளாண் வழிகாட்டுதலின்படி தக்காளி இலைகள் மஞ்சளாக மாறுவதற்கு முக்கியக் காரணங்கள்:\n1. வயலில் அதிக ஈரப்பதம் அல்லது தண்ணீர் தேக்கம் (வடிகாலை முதலில் சரிபார்க்கவும்).\n2. தழைச்சத்து (Nitrogen) அல்லது மெக்னீசியம் குறைபாடு.\n3. அதிக ஈரப்பதம் உள்ள மழைக்காலத்தில் ஆரம்ப நிலை பூஞ்சை இலைப்புள்ளி.\n\nஅடுத்த நடவடிக்கை: இலைகளின் அடிப்பகுதியை ஆய்வு செய்து, மருந்து தெளிக்கும் முன் அருகிலுள்ள வேளாண் அலுவலரை அணுகவும்.',
  },
  {
    id: 'heavy-rainfall',
    keywords: ['rain', 'rainfall', 'monsoon', 'flood', 'storm', 'மழை', 'கனமழை'],
    questionEn: 'What precautions should I take before heavy rainfall?',
    questionTa: 'கனமழைக்கு முன் என்ன முன்னெச்சரிக்கை நடவடிக்கைகளை எடுக்க வேண்டும்?',
    answerEn:
      'Before forecasted heavy rain:\n1. Clear field drainage trenches and bund outlets so rainwater does not stagnate around roots.\n2. Harvest mature vegetables and ripe produce early and store them in dry, elevated ventilated sheds.\n3. Postpone fertilizer top-dressing and foliar sprays to prevent runoff wastage.\n4. Strengthen staking for banana clumps and tomato trellises against gusts.',
    answerTa:
      'கனமழைக்கு முன் எடுக்க வேண்டிய முக்கிய நடவடிக்கைகள்:\n1. வயலில் தண்ணீர் தேங்காமல் இருக்க வடிகால் வாய்க்கால்களை சுத்தம் செய்யவும்.\n2. அறுவடைக்குத் தயாரான காய்கறிகள் மற்றும் பழங்களை முன்கூட்டியே அறுவடை செய்து உலர்ந்த இடத்தில் பாதுகாக்கவும்.\n3. உரம் இடுதல் மற்றும் மருந்து தெளிப்பதை மழைக்குப் பிறகு ஒத்திவைக்கவும்.\n4. வாழை மற்றும் தக்காளி பயிர்களுக்கு கூடுதல் முட்டுக் கொடுத்துப் பாதுகாக்கவும்.',
  },
  {
    id: 'soil-health',
    keywords: ['soil', 'health', 'compost', 'organic', 'fertility', 'மண்', 'வளம்'],
    questionEn: 'How can I improve soil health?',
    questionTa: 'மண் வளத்தை எவ்வாறு மேம்படுத்துவது?',
    answerEn:
      'Practical steps to strengthen long-term soil health:\n1. Obtain a Soil Health Card every 1–2 seasons to understand pH and NPK balance.\n2. Add well-decomposed farmyard manure, vermicompost, or green manure crops (like sunn hemp / daincha) between harvests.\n3. Rotate cereals with pulses (like black gram or groundnut) to support natural nitrogen fixation.\n4. Use organic mulching to protect topsoil moisture and beneficial microbes.',
    answerTa:
      'மண் வளத்தை மேம்படுத்த உதவும் வழிமுறைகள்:\n1. ஒவ்வொரு 1–2 பருவத்திற்கு ஒருமுறை மண் பரிசோதனை செய்து pH மற்றும் NPK அளவை அறிந்து கொள்ளவும்.\n2. தொழு உரம், மண்புழு உரம் அல்லது பசுந்தாள் உரப் பயிர்களை மண்ணில் சேர்க்கவும்.\n3. நெல் போன்ற பயிர்களுடன் உளுந்து அல்லது நிலக்கடலை போன்ற பயறு வகைகளை பயிர் சுழற்சி செய்யவும்.\n4. இயற்கை மூடாக்கு (Mulching) அமைத்து மண்ணின் ஈரப்பதத்தையும் நுண்ணுயிரிகளையும் பாதுகாக்கவும்.',
  },
  {
    id: 'high-humidity',
    keywords: ['humidity', 'fungal', 'moisture', 'damp', 'ஈரப்பதம்', 'பூஞ்சை'],
    questionEn: 'What should I monitor during high humidity?',
    questionTa: 'அதிக ஈரப்பதம் உள்ள நாட்களில் எவற்றைக் கண்காணிக்க வேண்டும்?',
    answerEn:
      'When relative humidity stays above 75–80%:\n1. Scout lower canopies early in the morning for fungal spots, powdery patches, or blights.\n2. Avoid evening overhead irrigation so leaves do not remain wet overnight.\n3. Trim congested lower foliage to improve air circulation across rows.\n4. Watch stored grains and onions for moisture buildup and improve shed ventilation.',
    answerTa:
      'காற்றின் ஈரப்பதம் 75–80%-க்கு மேல் இருக்கும் போது:\n1. காலை வேளையில் பயிர்களின் கீழ் இலைகளில் பூஞ்சை புள்ளிகள் உள்ளதா என ஆய்வு செய்யவும்.\n2. மாலை நேரத்தில் இலைகள் நனையுமாறு நீர் பாய்ச்சுவதைத் தவிர்க்கவும்.\n3. காற்றோட்டம் கிடைக்க அடர்த்தியான கீழ் இலைகளைக் கத்தரித்து விடவும்.\n4. சேமித்து வைத்த தானியங்கள் மற்றும் வெங்காயத்தில் ஈரம் சேராமல் காற்றோட்டமாக வைக்கவும்.',
  },
  {
    id: 'water-wastage',
    keywords: ['water', 'irrigation', 'drip', 'wastage', 'save', 'நீர்', 'பாசனம்', 'சொட்டு'],
    questionEn: 'How can I reduce water wastage?',
    questionTa: 'நீர் வீணாவதை எவ்வாறு குறைக்கலாம்?',
    answerEn:
      'Water-saving field practices:\n1. Shift vegetable and orchard plots to drip irrigation for direct root-zone delivery.\n2. Irrigate early morning or late evening to sharply reduce evaporation losses.\n3. Spread crop-residue mulch between rows to keep soil cool and moist longer.\n4. Check simulated rainfall forecasts before turning on borewell pumps.',
    answerTa:
      'நீர் சிக்கனத்திற்கான சிறந்த வேளாண் முறைகள்:\n1. காய்கறி மற்றும் பழத் தோட்டங்களில் சொட்டு நீர்ப்பாசன முறையைப் பயன்படுத்தவும்.\n2. ஆவியாதலைக் குறைக்க அதிகாலை அல்லது மாலை வேளைகளில் மட்டுமே நீர் பாய்ச்சவும்.\n3. பயிர் வரிசைகளுக்கு இடையே மூடாக்கு இட்டு மண் ஈரப்பதத்தைத் தக்கவைக்கவும்.\n4. நீர்ப்பாசனம் செய்யும் முன் மழை முன்னறிவிப்பைச் சரிபார்க்கவும்.',
  },
  {
    id: 'pricing-help',
    keywords: ['price', 'sell', 'market', 'wholesale', 'விலை', 'சந்தை', 'விற்பனை'],
    questionEn: 'How should I set fair direct-selling prices?',
    questionTa: 'நேரடி விற்பனைக்கு நியாயமான விலையை எவ்வாறு நிர்ணயிப்பது?',
    answerEn:
      'Use the Market Prices module inside your Farmer Dashboard to compare your crop against simulated reference prices and suggested competitive ranges. Offering both a retail per-kg price and a slightly discounted wholesale tier helps attract household buyers as well as local caterers.',
    answerTa:
      'விவசாயி கட்டுப்பாட்டகத்தில் உள்ள சந்தை விலைகள் பகுதியைப் பயன்படுத்தி மாதிரி சந்தை விலையுடன் உங்கள் விலையை ஒப்பிடலாம். சில்லறை விலையுடன் மொத்த விற்பனைக்கும் தனி விலை நிர்ணயித்தால் அதிக வாடிக்கையாளர்களைப் பெறலாம்.',
  },
];

export function matchAssistantReply(query: string, lang: Language): string {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return lang === 'ta'
      ? 'தயவுசெய்து ஒரு விவசாயக் கேள்வியைத் தட்டச்சு செய்யவும் அல்லது மேலே உள்ள மாதிரி கேள்விகளில் ஒன்றைத் தேர்ந்தெடுக்கவும்.'
      : 'Please type an agricultural question or pick one of the suggested sample questions above.';
  }

  let bestMatch: AssistantQA | null = null;
  let bestScore = 0;

  for (const item of ASSISTANT_QA_BANK) {
    let score = 0;
    for (const kw of item.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && bestScore > 0) {
    return lang === 'ta' ? bestMatch.answerTa : bestMatch.answerEn;
  }

  return lang === 'ta'
    ? 'இது முன்கூட்டியே வரையறுக்கப்பட்ட மாதிரி வேளாண் உதவியாளர். தக்காளி இலை மஞ்சளாதல், கனமழை முன்னெச்சரிக்கை, மண் வளம், அதிக ஈரப்பதம், நீர் சிக்கனம் அல்லது சந்தை விலை குறித்த கேள்விகளைக் கேளுங்கள்.'
    : 'This is a predefined prototype assistant using local rule-based guidance. Try asking about yellow tomato leaves, heavy rainfall precautions, improving soil health, high humidity monitoring, reducing water wastage, or direct-selling prices.';
}

/* ── E. CROP RECOMMENDATION ENGINE (SIMULATED DUMMY DATA) ── */
interface CropCatalogProfile {
  id: string;
  cropName: string;
  tamilName: string;
  category: ProductCategory;
  cropKey: string;
  primarySoils: SoilTypeOption[];
  secondarySoils: SoilTypeOption[];
  preferredDistricts: TamilNaduDistrict[];
  seasons: FarmingSeason[];
  waterNeed: WaterAvailability;
  tempOptimal: number;
  tempMin: number;
  tempMax: number;
  humidityOptimal: number;
  humidityMin: number;
  humidityMax: number;
  phOptimal: number;
  phMin: number;
  phMax: number;
  rainfallOptimal: number;
  rainfallMin: number;
  rainfallMax: number;
  idealAcresMin: number;
  idealAcresMax: number;
  budgetFit: ('Low' | 'Moderate' | 'High')[];
  durationDays: string;
  rotationTip: string;
  simulatedDemand: string;
  areaGuidance: (acres: number) => string;
}

export const CROP_RECOMMENDATION_CATALOG: CropCatalogProfile[] = [
  {
    id: 'crop-ponni-rice',
    cropName: 'Ponni / Samba Rice',
    tamilName: 'பொன்னி / சம்பா நெல்',
    category: 'Grains',
    cropKey: 'rice',
    primarySoils: ['Alluvial', 'Clay Loam'],
    secondarySoils: ['Black Cotton'],
    preferredDistricts: ['Thanjavur', 'Trichy', 'Erode'],
    seasons: ['Kuruvai (Jun–Sep)', 'Samba / Thaladi (Aug–Jan)'],
    waterNeed: 'High (Canal / Borewell)',
    tempOptimal: 29,
    tempMin: 24,
    tempMax: 34,
    humidityOptimal: 82,
    humidityMin: 72,
    humidityMax: 94,
    phOptimal: 6.4,
    phMin: 5.5,
    phMax: 7.4,
    rainfallOptimal: 28,
    rainfallMin: 14,
    rainfallMax: 65,
    idealAcresMin: 2,
    idealAcresMax: 50,
    budgetFit: ['Moderate', 'High'],
    durationDays: '115–135 days',
    rotationTip: 'Follow paddy harvest with black gram or green gram to restore soil nitrogen naturally.',
    simulatedDemand: 'High steady household & bulk staple demand across Tamil Nadu.',
    areaGuidance: (acres) =>
      acres >= 3
        ? `Well suited for ${acres} acres using mechanical transplanters or SRI spacing to reduce seed cost.`
        : `On ${acres} acre(s), System of Rice Intensification (SRI) helps maximize grain fill per plot.`,
  },
  {
    id: 'crop-country-tomato',
    cropName: 'Country Tomato (Nattu Thakkali)',
    tamilName: 'நாட்டுத் தக்காளி',
    category: 'Vegetables',
    cropKey: 'tomato',
    primarySoils: ['Red Loamy'],
    secondarySoils: ['Sandy Loam', 'Alluvial'],
    preferredDistricts: ['Trichy', 'Dindigul', 'Coimbatore'],
    seasons: ['Samba / Thaladi (Aug–Jan)', 'Kuruvai (Jun–Sep)'],
    waterNeed: 'Moderate (Drip / Well)',
    tempOptimal: 27,
    tempMin: 21,
    tempMax: 32,
    humidityOptimal: 66,
    humidityMin: 55,
    humidityMax: 78,
    phOptimal: 6.5,
    phMin: 6.0,
    phMax: 7.2,
    rainfallOptimal: 10,
    rainfallMin: 2,
    rainfallMax: 20,
    idealAcresMin: 0.25,
    idealAcresMax: 3.5,
    budgetFit: ['Moderate', 'Low'],
    durationDays: '70–85 days',
    rotationTip: 'Rotate with onion, marigold, or pulses to break soil-borne wilt cycles.',
    simulatedDemand: 'Fast-moving daily retail & restaurant staple on Uzhavan Direct.',
    areaGuidance: (acres) =>
      acres <= 2.5
        ? `Ideal quick-cash vegetable for ${acres} acre(s) with staggered weekly harvesting for direct buyers.`
        : `For ${acres} acres, split planting in two batches 20 days apart to spread harvest labor and price risk.`,
  },
  {
    id: 'crop-poovan-banana',
    cropName: 'Poovan / Rasthali Banana',
    tamilName: 'பூவன் / ரஸ்தாளி வாழை',
    category: 'Fruits',
    cropKey: 'banana',
    primarySoils: ['Alluvial', 'Clay Loam'],
    secondarySoils: ['Red Loamy'],
    preferredDistricts: ['Trichy', 'Thanjavur', 'Erode', 'Coimbatore'],
    seasons: ['Kuruvai (Jun–Sep)', 'Samba / Thaladi (Aug–Jan)', 'Navarai / Summer (Jan–May)'],
    waterNeed: 'High (Canal / Borewell)',
    tempOptimal: 30,
    tempMin: 25,
    tempMax: 35,
    humidityOptimal: 80,
    humidityMin: 68,
    humidityMax: 92,
    phOptimal: 6.8,
    phMin: 6.0,
    phMax: 7.8,
    rainfallOptimal: 22,
    rainfallMin: 10,
    rainfallMax: 48,
    idealAcresMin: 1.5,
    idealAcresMax: 25,
    budgetFit: ['High', 'Moderate'],
    durationDays: '300–330 days',
    rotationTip: 'Intercrop short-duration shallots or coriander during the first 3 months of canopy establishment.',
    simulatedDemand: 'Consistent retail and festival wholesale bunch demand.',
    areaGuidance: (acres) =>
      `For ${acres} acre(s), drip fertigation with wind-propping poles protects bunches during windy monsoon spells.`,
  },
  {
    id: 'crop-small-onion',
    cropName: 'Small Shallot & Red Onion',
    tamilName: 'சின்ன வெங்காயம் / பல்லாரி',
    category: 'Vegetables',
    cropKey: 'onion',
    primarySoils: ['Red Loamy', 'Black Cotton'],
    secondarySoils: ['Sandy Loam'],
    preferredDistricts: ['Dindigul', 'Madurai', 'Trichy', 'Erode'],
    seasons: ['Samba / Thaladi (Aug–Jan)', 'Navarai / Summer (Jan–May)'],
    waterNeed: 'Moderate (Drip / Well)',
    tempOptimal: 29,
    tempMin: 23,
    tempMax: 35,
    humidityOptimal: 60,
    humidityMin: 45,
    humidityMax: 72,
    phOptimal: 6.7,
    phMin: 6.0,
    phMax: 7.5,
    rainfallOptimal: 6,
    rainfallMin: 0,
    rainfallMax: 14,
    idealAcresMin: 0.5,
    idealAcresMax: 5,
    budgetFit: ['Moderate', 'Low'],
    durationDays: '75–95 days',
    rotationTip: 'Avoid waterlogged beds; cures well in ventilated bamboo sheds for better price timing.',
    simulatedDemand: 'Strong household demand with good storage flexibility.',
    areaGuidance: (acres) =>
      `On ${acres} acre(s), raised beds improve bulb uniformity and make manual curing easier after harvest.`,
  },
  {
    id: 'crop-madurai-brinjal',
    cropName: 'Purple Striped Brinjal',
    tamilName: 'வரி கத்தரிக்காய்',
    category: 'Vegetables',
    cropKey: 'brinjal',
    primarySoils: ['Black Cotton', 'Clay Loam'],
    secondarySoils: ['Red Loamy'],
    preferredDistricts: ['Madurai', 'Coimbatore', 'Dindigul'],
    seasons: ['Samba / Thaladi (Aug–Jan)', 'Navarai / Summer (Jan–May)'],
    waterNeed: 'Moderate (Drip / Well)',
    tempOptimal: 31,
    tempMin: 25,
    tempMax: 36,
    humidityOptimal: 65,
    humidityMin: 52,
    humidityMax: 78,
    phOptimal: 6.6,
    phMin: 5.8,
    phMax: 7.5,
    rainfallOptimal: 8,
    rainfallMin: 1,
    rainfallMax: 18,
    idealAcresMin: 0.25,
    idealAcresMax: 3,
    budgetFit: ['Low', 'Moderate'],
    durationDays: '65–75 days to first pick',
    rotationTip: 'Install pheromone traps early and rotate away from tomato/chilli in the next season.',
    simulatedDemand: 'Steady regional preference for native Madurai & Kongu varieties.',
    areaGuidance: (acres) =>
      `${acres} acre(s) supports continuous twice-weekly picking over 3–4 months for steady cash flow.`,
  },
  {
    id: 'crop-groundnut',
    cropName: 'Rainfed / Irrigated Groundnut',
    tamilName: 'நிலக்கடலை',
    category: 'Pulses',
    cropKey: 'groundnut',
    primarySoils: ['Sandy Loam', 'Red Loamy'],
    secondarySoils: [],
    preferredDistricts: ['Erode', 'Salem', 'Madurai', 'Thanjavur'],
    seasons: ['Kuruvai (Jun–Sep)', 'Navarai / Summer (Jan–May)'],
    waterNeed: 'Low (Rainfed / Dryland)',
    tempOptimal: 32,
    tempMin: 26,
    tempMax: 38,
    humidityOptimal: 58,
    humidityMin: 42,
    humidityMax: 72,
    phOptimal: 6.4,
    phMin: 5.8,
    phMax: 7.2,
    rainfallOptimal: 8,
    rainfallMin: 2,
    rainfallMax: 18,
    idealAcresMin: 1.5,
    idealAcresMax: 30,
    budgetFit: ['Low', 'Moderate'],
    durationDays: '105–115 days',
    rotationTip: 'Fixes atmospheric nitrogen — an excellent soil-building crop before vegetables or millets.',
    simulatedDemand: 'High demand for cold-pressed oil mills and direct household pods.',
    areaGuidance: (acres) =>
      `Well matched to ${acres} acre(s) of friable soil where pegs penetrate easily without crusting.`,
  },
  {
    id: 'crop-erode-turmeric',
    cropName: 'Golden Finger Turmeric',
    tamilName: 'மஞ்சள் (ஈரோடு வகை)',
    category: 'Spices',
    cropKey: 'turmeric',
    primarySoils: ['Red Loamy', 'Alluvial'],
    secondarySoils: ['Clay Loam'],
    preferredDistricts: ['Erode', 'Salem', 'Coimbatore'],
    seasons: ['Kuruvai (Jun–Sep)', 'Samba / Thaladi (Aug–Jan)'],
    waterNeed: 'High (Canal / Borewell)',
    tempOptimal: 29,
    tempMin: 23,
    tempMax: 34,
    humidityOptimal: 76,
    humidityMin: 64,
    humidityMax: 88,
    phOptimal: 6.2,
    phMin: 5.5,
    phMax: 7.2,
    rainfallOptimal: 20,
    rainfallMin: 10,
    rainfallMax: 38,
    idealAcresMin: 1,
    idealAcresMax: 15,
    budgetFit: ['High', 'Moderate'],
    durationDays: '240–270 days',
    rotationTip: 'Intercrop with small onion or green gram during the first 75 days for early interim income.',
    simulatedDemand: 'Premium spice value with long dry-cured shelf life.',
    areaGuidance: (acres) =>
      `On ${acres} acre(s), raised ridge-and-furrow beds prevent rhizome rot during wet months.`,
  },
  {
    id: 'crop-ladys-finger',
    cropName: "Tender Lady's Finger (Okra)",
    tamilName: 'வெண்டைக்காய்',
    category: 'Vegetables',
    cropKey: 'ladys_finger',
    primarySoils: ['Sandy Loam', 'Alluvial'],
    secondarySoils: ['Red Loamy', 'Black Cotton'],
    preferredDistricts: ['Trichy', 'Dindigul', 'Salem'],
    seasons: ['Navarai / Summer (Jan–May)', 'Kuruvai (Jun–Sep)'],
    waterNeed: 'Moderate (Drip / Well)',
    tempOptimal: 32,
    tempMin: 26,
    tempMax: 38,
    humidityOptimal: 64,
    humidityMin: 50,
    humidityMax: 78,
    phOptimal: 6.8,
    phMin: 6.0,
    phMax: 7.6,
    rainfallOptimal: 6,
    rainfallMin: 0,
    rainfallMax: 16,
    idealAcresMin: 0.25,
    idealAcresMax: 2.5,
    budgetFit: ['Low', 'Moderate'],
    durationDays: '45–55 days to first pick',
    rotationTip: 'Quickest vegetable turnaround; ideal between long-duration cereal harvests.',
    simulatedDemand: 'Strong daily kitchen demand for tender morning harvests.',
    areaGuidance: (acres) =>
      `Even compact plots (${acres} acre${acres === 1 ? '' : 's'}) deliver frequent alternate-day harvests for direct local customers.`,
  },
  {
    id: 'crop-green-chilli',
    cropName: 'Country Green Chilli',
    tamilName: 'பச்சை மிளகாய்',
    category: 'Spices',
    cropKey: 'green_chilli',
    primarySoils: ['Black Cotton', 'Red Loamy'],
    secondarySoils: ['Sandy Loam'],
    preferredDistricts: ['Madurai', 'Dindigul', 'Coimbatore'],
    seasons: ['Samba / Thaladi (Aug–Jan)', 'Navarai / Summer (Jan–May)'],
    waterNeed: 'Low (Rainfed / Dryland)',
    tempOptimal: 33,
    tempMin: 26,
    tempMax: 38,
    humidityOptimal: 56,
    humidityMin: 42,
    humidityMax: 70,
    phOptimal: 6.8,
    phMin: 6.0,
    phMax: 7.6,
    rainfallOptimal: 5,
    rainfallMin: 0,
    rainfallMax: 14,
    idealAcresMin: 0.5,
    idealAcresMax: 5,
    budgetFit: ['Low', 'Moderate'],
    durationDays: '75–90 days to first pick',
    rotationTip: 'Border rows with maize or sorghum to reduce sucking pest migration naturally.',
    simulatedDemand: 'High value per kilogram for both green fresh lots and sun-dried red pods.',
    areaGuidance: (acres) =>
      `${acres} acre(s) fits low-to-moderate irrigation setups; mulch rows to protect blossoms during hot spells.`,
  },
  {
    id: 'crop-toor-dal',
    cropName: 'Toor Dal / Red Gram',
    tamilName: 'துவரை',
    category: 'Pulses',
    cropKey: 'toor_dal',
    primarySoils: ['Black Cotton'],
    secondarySoils: ['Red Loamy', 'Sandy Loam'],
    preferredDistricts: ['Thanjavur', 'Salem', 'Madurai', 'Trichy'],
    seasons: ['Kuruvai (Jun–Sep)', 'Samba / Thaladi (Aug–Jan)'],
    waterNeed: 'Low (Rainfed / Dryland)',
    tempOptimal: 34,
    tempMin: 26,
    tempMax: 40,
    humidityOptimal: 52,
    humidityMin: 38,
    humidityMax: 68,
    phOptimal: 7.2,
    phMin: 6.4,
    phMax: 8.2,
    rainfallOptimal: 6,
    rainfallMin: 0,
    rainfallMax: 16,
    idealAcresMin: 2,
    idealAcresMax: 40,
    budgetFit: ['Low'],
    durationDays: '130–155 days',
    rotationTip: 'Deep taproot breaks hard soil pans and thrives in dryland / low-water zones.',
    simulatedDemand: 'Reliable direct-to-home demand for unpolished farm-milled dal.',
    areaGuidance: (acres) =>
      `Low-input dryland fit for ${acres} acre(s); can also be intercropped with groundnut to diversify risk.`,
  },
  {
    id: 'crop-sweet-carrot',
    cropName: 'Cool-Climate Sweet Carrot',
    tamilName: 'கேரட்',
    category: 'Vegetables',
    cropKey: 'carrot',
    primarySoils: ['Sandy Loam'],
    secondarySoils: ['Red Loamy'],
    preferredDistricts: ['Salem', 'Coimbatore', 'Dindigul'],
    seasons: ['Samba / Thaladi (Aug–Jan)', 'Kuruvai (Jun–Sep)'],
    waterNeed: 'Moderate (Drip / Well)',
    tempOptimal: 21,
    tempMin: 18,
    tempMax: 26,
    humidityOptimal: 72,
    humidityMin: 60,
    humidityMax: 85,
    phOptimal: 6.3,
    phMin: 5.8,
    phMax: 6.9,
    rainfallOptimal: 12,
    rainfallMin: 4,
    rainfallMax: 24,
    idealAcresMin: 0.25,
    idealAcresMax: 4,
    budgetFit: ['Moderate', 'High'],
    durationDays: '85–100 days',
    rotationTip: 'Requires stone-free deep loose soil for straight roots; rotate with cabbage or beans.',
    simulatedDemand: 'High retail premium for sweet hill-slope washed carrots.',
    areaGuidance: (acres) =>
      `On ${acres} acre(s), deep ploughing and fine raised beds prevent forked carrot roots.`,
  },
  {
    id: 'crop-hill-potato',
    cropName: 'Hill-Slope Potato',
    tamilName: 'உருளைக்கிழங்கு',
    category: 'Vegetables',
    cropKey: 'potato',
    primarySoils: ['Sandy Loam', 'Red Loamy'],
    secondarySoils: ['Alluvial'],
    preferredDistricts: ['Salem', 'Dindigul', 'Coimbatore'],
    seasons: ['Samba / Thaladi (Aug–Jan)', 'Kuruvai (Jun–Sep)'],
    waterNeed: 'Moderate (Drip / Well)',
    tempOptimal: 20,
    tempMin: 18,
    tempMax: 25,
    humidityOptimal: 76,
    humidityMin: 65,
    humidityMax: 88,
    phOptimal: 5.8,
    phMin: 5.2,
    phMax: 6.6,
    rainfallOptimal: 14,
    rainfallMin: 6,
    rainfallMax: 26,
    idealAcresMin: 0.5,
    idealAcresMax: 8,
    budgetFit: ['Moderate', 'High'],
    durationDays: '95–110 days',
    rotationTip: 'Earthing-up soil around tubers prevents greening and improves grade-A yield.',
    simulatedDemand: 'Consistent retail and wholesale catering demand year-round.',
    areaGuidance: (acres) =>
      `${acres} acre(s) in cooler hill-foothill pockets produces firm tubers with strong storage life.`,
  },
  {
    id: 'crop-salem-mango',
    cropName: 'Salem Malgova Mango (Orchard)',
    tamilName: 'சேலம் மல்கோவா மாம்பழம்',
    category: 'Fruits',
    cropKey: 'mango',
    primarySoils: ['Red Loamy', 'Sandy Loam'],
    secondarySoils: ['Alluvial'],
    preferredDistricts: ['Salem', 'Dindigul', 'Coimbatore'],
    seasons: ['Navarai / Summer (Jan–May)', 'Kuruvai (Jun–Sep)'],
    waterNeed: 'Low (Rainfed / Dryland)',
    tempOptimal: 33,
    tempMin: 26,
    tempMax: 40,
    humidityOptimal: 55,
    humidityMin: 40,
    humidityMax: 72,
    phOptimal: 6.5,
    phMin: 5.8,
    phMax: 7.5,
    rainfallOptimal: 6,
    rainfallMin: 0,
    rainfallMax: 18,
    idealAcresMin: 3,
    idealAcresMax: 80,
    budgetFit: ['High'],
    durationDays: 'Perennial orchard (seasonal harvest)',
    rotationTip: 'Intercrop groundnut or pulses between young orchard rows during early establishment years.',
    simulatedDemand: 'High-margin seasonal direct-from-orchard crate orders.',
    areaGuidance: (acres) =>
      acres >= 3
        ? `Your ${acres}-acre holding is well sized for high-density orchard spacing and seasonal crate sales.`
        : `Best suited to larger 3+ acre orchards; on ${acres} acre(s), consider short-cycle vegetables instead.`,
  },
  {
    id: 'crop-millets-kambu',
    cropName: 'Pearl Millet / Ragi (Sirudhaniyam)',
    tamilName: 'கம்பு / கேழ்வரகு',
    category: 'Grains',
    cropKey: 'rice',
    primarySoils: ['Sandy Loam', 'Red Loamy', 'Black Cotton'],
    secondarySoils: [],
    preferredDistricts: ['Madurai', 'Salem', 'Dindigul', 'Erode'],
    seasons: ['Navarai / Summer (Jan–May)', 'Kuruvai (Jun–Sep)'],
    waterNeed: 'Low (Rainfed / Dryland)',
    tempOptimal: 36,
    tempMin: 28,
    tempMax: 42,
    humidityOptimal: 46,
    humidityMin: 35,
    humidityMax: 64,
    phOptimal: 7.0,
    phMin: 6.0,
    phMax: 8.4,
    rainfallOptimal: 4,
    rainfallMin: 0,
    rainfallMax: 12,
    idealAcresMin: 1,
    idealAcresMax: 40,
    budgetFit: ['Low'],
    durationDays: '85–100 days',
    rotationTip: 'Drought-hardy cereal that protects farm income during hot, low-rainfall seasons.',
    simulatedDemand: 'Growing urban health-conscious retail demand for direct farm millets.',
    areaGuidance: (acres) =>
      `Highly resilient across ${acres} acre(s) with minimal water and fertilizer expenditure.`,
  },
];

function rangeScore(
  value: number,
  optimal: number,
  min: number,
  max: number,
  maxPoints: number
): number {
  if (value >= min && value <= max) {
    const halfSpan = Math.max(1, (max - min) / 2);
    const dist = Math.abs(value - optimal) / halfSpan;
    // Smoothly awards 70% to 100% of maxPoints inside the ideal band
    return maxPoints * (1 - 0.3 * Math.min(1, dist));
  }
  const outsideDist = value < min ? min - value : value - max;
  const span = Math.max(2, max - min);
  const decay = Math.max(0, 1 - outsideDist / span);
  return maxPoints * 0.45 * decay;
}

export function evaluateCropRecommendations(
  input: CropRecommendationInput
): CropRecommendationItem[] {
  const safeAcres = Math.max(0.25, input.landAreaAcres || 1);

  const scored = CROP_RECOMMENDATION_CATALOG.map((crop) => {
    let score = 0;
    const reasons: string[] = [];
    const cautions: string[] = [];

    // 1. Soil Type (22 pts)
    if (crop.primarySoils.includes(input.soilType)) {
      score += 22;
      reasons.push(`${input.soilType} is a primary ideal soil for ${crop.cropName}.`);
    } else if (crop.secondarySoils.includes(input.soilType)) {
      score += 13;
      reasons.push(`${input.soilType} works well with organic matter and raised-bed drainage.`);
    } else {
      score += 2;
      cautions.push(
        `${input.soilType} is outside its preferred soils (${crop.primarySoils.join(', ')}); soil conditioning needed.`
      );
    }

    // 2. Water / Irrigation Fit (18 pts)
    if (crop.waterNeed === input.waterAvailability) {
      score += 18;
      reasons.push(`Water demand matches your ${input.waterAvailability} capacity directly.`);
    } else if (
      input.waterAvailability === 'High (Canal / Borewell)' &&
      crop.waterNeed === 'Moderate (Drip / Well)'
    ) {
      score += 12;
      reasons.push(`Available irrigation comfortably supports drip/moderate moisture needs.`);
    } else if (
      input.waterAvailability === 'Moderate (Drip / Well)' &&
      crop.waterNeed === 'Low (Rainfed / Dryland)'
    ) {
      score += 11;
      reasons.push(`Supplemental well/drip watering stabilizes dryland yield.`);
    } else if (
      input.waterAvailability === 'Low (Rainfed / Dryland)' &&
      crop.waterNeed === 'High (Canal / Borewell)'
    ) {
      score += 0;
      cautions.push(`Needs ${crop.waterNeed}, which is risky under rainfed/dryland conditions.`);
    } else {
      score += 6;
      cautions.push(`Irrigation planning required for ${crop.waterNeed} needs.`);
    }

    // 3. Temperature Fit (14 pts smooth)
    const tempPts = rangeScore(input.temperature, crop.tempOptimal, crop.tempMin, crop.tempMax, 14);
    score += tempPts;
    if (input.temperature >= crop.tempMin && input.temperature <= crop.tempMax) {
      reasons.push(
        `Temperature (${input.temperature}°C) aligns with its ${crop.tempMin}–${crop.tempMax}°C growth window.`
      );
    } else {
      cautions.push(
        `Temperature (${input.temperature}°C) sits outside the ${crop.tempMin}–${crop.tempMax}°C comfort range.`
      );
    }

    // 4. Humidity Fit (10 pts smooth)
    const humPts = rangeScore(
      input.humidity,
      crop.humidityOptimal,
      crop.humidityMin,
      crop.humidityMax,
      10
    );
    score += humPts;
    if (input.humidity >= crop.humidityMin && input.humidity <= crop.humidityMax) {
      reasons.push(`Humidity (${input.humidity}%) supports healthy canopy development.`);
    } else {
      cautions.push(
        `Humidity (${input.humidity}%) is outside the typical ${crop.humidityMin}–${crop.humidityMax}% band.`
      );
    }

    // 5. Land Area Scale Fit (10 pts)
    if (safeAcres >= crop.idealAcresMin && safeAcres <= crop.idealAcresMax) {
      score += 10;
      reasons.push(`Land size (${safeAcres} acres) scales well for ${crop.cropName} management.`);
    } else if (safeAcres < crop.idealAcresMin) {
      score += 3;
      cautions.push(
        `Typically performs better on ${crop.idealAcresMin}+ acres for economical operations.`
      );
    } else {
      score += 6;
      reasons.push(`For ${safeAcres} acres, consider staggered blocks or intercropping.`);
    }

    // 6. Season Fit (8 pts)
    if (crop.seasons.includes(input.season)) {
      score += 8;
      reasons.push(`Fits the ${input.season} planting window.`);
    } else {
      score += 2;
      cautions.push(`More commonly planted in ${crop.seasons.join(' or ')}.`);
    }

    // 7. District Affinity (7 pts)
    if (crop.preferredDistricts.includes(input.district)) {
      score += 7;
      reasons.push(`Proven regional adoption in ${input.district} district.`);
    } else {
      score += 2;
    }

    // 8. Soil pH Fit (5 pts smooth)
    const phPts = rangeScore(input.soilPh, crop.phOptimal, crop.phMin, crop.phMax, 5);
    score += phPts;
    if (input.soilPh < crop.phMin || input.soilPh > crop.phMax) {
      cautions.push(`Soil pH ${input.soilPh.toFixed(1)} is outside ideal ${crop.phMin}–${crop.phMax}.`);
    }

    // 9. Rainfall Alignment (4 pts smooth)
    score += rangeScore(
      input.rainfallMm,
      crop.rainfallOptimal,
      crop.rainfallMin,
      crop.rainfallMax,
      4
    );

    // 10. Budget Level Fit (4 pts)
    if (crop.budgetFit.includes(input.budgetLevel)) {
      score += 4;
    } else if (input.budgetLevel === 'Low' && !crop.budgetFit.includes('Low')) {
      score += 0;
      cautions.push(`Usually requires moderate-to-high upfront input investment.`);
    } else {
      score += 2;
    }

    // Total max = 102 -> map cleanly into 22..97 without saturating multiple crops at 98
    const clampedScore = Math.max(22, Math.min(97, Math.round((score / 102) * 97)));
    const suitabilityLabel: CropRecommendationItem['suitabilityLabel'] =
      clampedScore >= 78 ? 'Highly Suitable' : clampedScore >= 62 ? 'Suitable' : 'Moderate Fit';

    return {
      id: crop.id,
      cropName: crop.cropName,
      tamilName: crop.tamilName,
      category: crop.category,
      cropKey: crop.cropKey,
      score: clampedScore,
      suitabilityLabel,
      durationDays: crop.durationDays,
      waterNeed: crop.waterNeed,
      idealSoils: [...crop.primarySoils, ...crop.secondarySoils],
      preferredDistricts: crop.preferredDistricts,
      reasons: reasons.length > 0 ? reasons : ['General adaptability across Tamil Nadu demo zones.'],
      cautions,
      areaNote: crop.areaGuidance(safeAcres),
      rotationTip: crop.rotationTip,
      simulatedDemand: crop.simulatedDemand,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}


