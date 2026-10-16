export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  endpoints: {
    forecast: string;
    psi: string;
    health: string;
  };
}

export function getHealthStatus(): HealthResponse {
  return {
    status: 'ok',
    service: 'breezesg-serverless-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: typeof process !== 'undefined' && process.uptime ? Math.floor(process.uptime()) : 0,
    environment: typeof process !== 'undefined' && process.env.NODE_ENV ? process.env.NODE_ENV : 'production',
    endpoints: {
      forecast: '/api/two-hr-forecast',
      psi: '/api/psi',
      health: '/api/health',
    },
  };
}

// Web Standard Response (Vercel Edge / Cloudflare / Deno / Next.js)
export async function GET(_req?: Request): Promise<Response> {
  const data = getHealthStatus();
  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
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

  const data = getHealthStatus();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.statusCode = 200;
  res.end(JSON.stringify(data, null, 2));
}
