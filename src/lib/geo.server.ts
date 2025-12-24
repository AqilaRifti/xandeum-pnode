export type GeoLocation = {
  lat: number;
  lng: number;
  country: string;
  region: string;
  city?: string;
};

type CacheEntry = {
  value: GeoLocation;
  expiresAtMs: number;
};

const cache = new Map<string, CacheEntry>();
const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function extractIP(address: string | undefined): string | null {
  if (!address) return null;
  const ip = address.split(':')[0].trim();
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return null;
  return ip;
}

export async function resolveIPToGeo(ip: string, timeoutMs: number = 5000): Promise<GeoLocation | null> {
  const cached = cache.get(ip);
  if (cached && cached.expiresAtMs > Date.now()) {
    return cached.value;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,lat,lon`,
      {
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as {
      status?: string;
      message?: string;
      lat?: number | string;
      lon?: number | string;
      country?: string;
      regionName?: string;
      city?: string;
    };

    if (data.status === 'fail') return null;
    if (!data.lat || !data.lon || !data.country) return null;

    const geo: GeoLocation = {
      lat: typeof data.lat === 'string' ? Number.parseFloat(data.lat) : data.lat,
      lng: typeof data.lon === 'string' ? Number.parseFloat(data.lon) : data.lon,
      country: data.country || 'Unknown',
      region: data.regionName || 'Unknown',
      city: data.city || undefined,
    };

    cache.set(ip, { value: geo, expiresAtMs: Date.now() + GEO_CACHE_TTL_MS });

    return geo;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function resolveNodeGeo(address: string | undefined, timeoutMs: number = 3000) {
  const ip = extractIP(address);
  if (!ip) return null;
  return resolveIPToGeo(ip, timeoutMs);
}
