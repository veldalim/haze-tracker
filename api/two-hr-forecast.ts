const TWO_HR_FORECAST_URL = 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast';

export interface AreaMetadata {
  name: string;
  label_location: {
    latitude: number;
    longitude: number;
  };
}

export interface AreaForecast {
  area: string;
  forecast: string;
}

export interface TwoHourForecastData {
  area_metadata: AreaMetadata[];
  items: Array<{
    update_timestamp: string;
    timestamp: string;
    valid_period: {
      start: string;
      end: string;
      text: string;
    };
    forecasts: AreaForecast[];
  }>;
}

export interface TwoHourForecastApiResponse {
  code: number;
  data?: TwoHourForecastData;
  errorMsg?: string;
}

export interface FormattedForecastResult {
  success: boolean;
  source: 'data.gov.sg';
  timestamp: string;
  updateTimestamp: string;
  validPeriod: {
    start: string;
    end: string;
    text: string;
  };
  totalAreas: number;
  forecasts: AreaForecast[];
  areaMetadata: AreaMetadata[];
  rainDetected: boolean;
  hazeRiskAreas: string[];
}

export async function fetchTwoHourForecast(): Promise<FormattedForecastResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(TWO_HR_FORECAST_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'BreezeSG-AirQuality/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`data.gov.sg API returned status ${response.status}: ${response.statusText}`);
    }

    const payload = (await response.json()) as TwoHourForecastApiResponse;

    if (payload.code !== 0 || !payload.data || !payload.data.items || payload.data.items.length === 0) {
      throw new Error(payload.errorMsg || 'Invalid data format returned by data.gov.sg 2-hr forecast API');
    }

    const latestItem = payload.data.items[0];
    const forecasts = latestItem.forecasts || [];

    // Analyze rain & weather conditions that affect particulate dispersion
    const rainKeywords = ['rain', 'shower', 'thundery'];
    const rainDetected = forecasts.some((f) =>
      rainKeywords.some((keyword) => f.forecast.toLowerCase().includes(keyword))
    );

    const hazeRiskAreas = forecasts
      .filter((f) => f.forecast.toLowerCase().includes('hazy') || f.forecast.toLowerCase().includes('windy'))
      .map((f) => f.area);

    return {
      success: true,
      source: 'data.gov.sg',
      timestamp: latestItem.timestamp,
      updateTimestamp: latestItem.update_timestamp,
      validPeriod: latestItem.valid_period || {
        start: latestItem.timestamp,
        end: new Date(new Date(latestItem.timestamp).getTime() + 2 * 60 * 60 * 1000).toISOString(),
        text: 'Next 2 Hours',
      },
      totalAreas: forecasts.length,
      forecasts,
      areaMetadata: payload.data.area_metadata || [],
      rainDetected,
      hazeRiskAreas,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    const now = new Date();
    return {
      success: false,
      source: 'data.gov.sg',
      timestamp: now.toISOString(),
      updateTimestamp: now.toISOString(),
      validPeriod: {
        start: now.toISOString(),
        end: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        text: 'Next 2 Hours (Cached Estimate)',
      },
      totalAreas: 0,
      forecasts: [],
      areaMetadata: [],
      rainDetected: false,
      hazeRiskAreas: [],
    };
  }
}

// Web Standard Response (Vercel Edge / Cloudflare / Deno / Next.js)
export async function GET(_req?: Request): Promise<Response> {
  const result = await fetchTwoHourForecast();
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

  const result = await fetchTwoHourForecast();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
  res.statusCode = result.success ? 200 : 502;
  res.end(JSON.stringify(result, null, 2));
}
