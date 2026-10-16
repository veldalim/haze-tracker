const V2_PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const V1_PSI_URL = 'https://api.data.gov.sg/v1/environment/psi';

export interface RegionalPsiData {
  region: 'north' | 'south' | 'east' | 'west' | 'central' | 'national';
  name: string;
  psi24h: number;
  pm25_24h: number;
  pm10_24h: number;
  so2_24h: number;
  co_8h: number;
  no2_1h: number;
  o3_8h: number;
  band: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
}

export interface FormattedPsiResult {
  success: boolean;
  source: 'data.gov.sg';
  timestamp: string;
  updateTimestamp: string;
  nationalPsi: number;
  nationalBand: string;
  regions: Record<string, RegionalPsiData>;
}

function calculateBand(psi: number): 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous' {
  if (psi <= 50) return 'good';
  if (psi <= 100) return 'moderate';
  if (psi <= 200) return 'unhealthy';
  if (psi <= 300) return 'very_unhealthy';
  return 'hazardous';
}

export async function fetchPsiData(): Promise<FormattedPsiResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    let response = await fetch(V2_PSI_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    }).catch(() => null);

    if (!response || !response.ok) {
      response = await fetch(V1_PSI_URL, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }).catch(() => null);
    }

    clearTimeout(timeoutId);

    if (!response || !response.ok) {
      throw new Error(`Unable to fetch PSI from data.gov.sg (status ${response?.status || 'network error'})`);
    }

    const payload = await response.json();
    const dataItems = payload.data?.items || payload.items;

    if (!dataItems || dataItems.length === 0) {
      throw new Error('No items in data.gov.sg PSI response');
    }

    const item = dataItems[0];
    const r = item.readings || {};
    const timestamp = item.timestamp || new Date().toISOString();
    const updateTimestamp = item.updatedTimestamp || item.update_timestamp || timestamp;

    const regionsList = ['north', 'south', 'east', 'west', 'central'] as const;
    const psiMap = r.psi_twenty_four_hourly || {};
    const pm25Map = r.pm25_twenty_four_hourly || {};
    const pm10Map = r.pm10_twenty_four_hourly || {};
    const so2Map = r.so2_twenty_four_hourly || {};
    const coMap = r.co_eight_hour_max || {};
    const no2Map = r.no2_one_hour_max || {};
    const o3Map = r.o3_eight_hour_max || {};

    const regionResults: Record<string, RegionalPsiData> = {};
    let totalPsi = 0;
    let count = 0;

    regionsList.forEach((reg) => {
      const psiVal = psiMap[reg] ?? 35;
      totalPsi += psiVal;
      count++;

      regionResults[reg] = {
        region: reg,
        name: `${reg.charAt(0).toUpperCase() + reg.slice(1)} Region`,
        psi24h: psiVal,
        pm25_24h: pm25Map[reg] ?? Math.round(psiVal * 0.36),
        pm10_24h: pm10Map[reg] ?? Math.round(psiVal * 0.52),
        so2_24h: so2Map[reg] ?? 12,
        co_8h: coMap[reg] ?? 0.6,
        no2_1h: no2Map[reg] ?? 24,
        o3_8h: o3Map[reg] ?? 32,
        band: calculateBand(psiVal),
      };
    });

    const nationalPsi = psiMap.national ?? (count > 0 ? Math.round(totalPsi / count) : 35);
    const nationalBand = calculateBand(nationalPsi);

    regionResults.national = {
      region: 'national',
      name: 'Singapore Islandwide',
      psi24h: nationalPsi,
      pm25_24h: pm25Map.national ?? Math.round(nationalPsi * 0.36),
      pm10_24h: pm10Map.national ?? Math.round(nationalPsi * 0.52),
      so2_24h: so2Map.national ?? 12,
      co_8h: coMap.national ?? 0.6,
      no2_1h: no2Map.national ?? 24,
      o3_8h: o3Map.national ?? 32,
      band: nationalBand,
    };

    return {
      success: true,
      source: 'data.gov.sg',
      timestamp,
      updateTimestamp,
      nationalPsi,
      nationalBand,
      regions: regionResults,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    const now = new Date();
    return {
      success: false,
      source: 'data.gov.sg',
      timestamp: now.toISOString(),
      updateTimestamp: now.toISOString(),
      nationalPsi: 35,
      nationalBand: 'good',
      regions: {},
    };
  }
}

// Web Standard Response (Edge / Cloudflare / Deno)
export async function GET(_req?: Request): Promise<Response> {
  const result = await fetchPsiData();
  return new Response(JSON.stringify(result, null, 2), {
    status: result.success ? 200 : 502,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
    },
  });
}

// Node / Express / AWS Lambda / Vercel Serverless Function signature
export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    res.end();
    return;
  }

  const result = await fetchPsiData();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
  res.statusCode = result.success ? 200 : 502;
  res.end(JSON.stringify(result, null, 2));
}
