// API helper with fallback to two sources
const API_SOURCES = [
  { url: "https://www.sankavollerei.com/anime/", name: "OtakuDesu" },
  { url: "https://www.sankavollerei.com/anime/samehadaku/", name: "Samehadaku" }
];

// Fungsi untuk fetch dari sumber tertentu
export async function fetchFromSource(sourceName, endpoint) {
  const source = API_SOURCES.find(s => s.name === sourceName);
  if (!source) throw new Error(`Source ${sourceName} not found`);

  const mappedEndpoint = endpointMapping[endpoint]?.[sourceName] || endpoint;
  const url = `${source.url}${mappedEndpoint}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch from ${sourceName}`);
  const rawData = await response.json();
  const normalizedData = normalizeData(rawData, sourceName, mappedEndpoint);
  return { data: normalizedData, source: sourceName };
}

export async function fetchWithFallback(endpoint) {
  for (const source of API_SOURCES) {
    try {
      const mappedEndpoint = endpointMapping[endpoint]?.[source.name] || endpoint;
      const url = `${source.url}${mappedEndpoint}`;
      const response = await fetch(url);
      if (response.ok) {
        const rawData = await response.json();
        const normalizedData = normalizeData(rawData, source.name, mappedEndpoint);
        return { data: normalizedData, source: source.name };
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${source.url}${endpoint}:`, error);
    }
  }
  throw new Error(`All API sources failed for endpoint: ${endpoint}`);
}

// Endpoint mapping for different sources
const endpointMapping = {
  "complete-anime/1": {
    "OtakuDesu": "complete-anime/1",
    "Samehadaku": "completed"
  },
  "ongoing-anime": {
    "OtakuDesu": "ongoing-anime",
    "Samehadaku": "ongoing"
  },
  "search": {
    "OtakuDesu": "search",
    "Samehadaku": "search"
  },
  "anime": {
    "OtakuDesu": "anime",
    "Samehadaku": "anime"
  },
  "episode": {
    "OtakuDesu": "episode",
    "Samehadaku": "episode"
  },
  "server": {
    "OtakuDesu": "undefined",
    "Samehadaku": "server"
  },
  "genre": {
    "OtakuDesu": "genre",
    "Samehadaku": "genres"
  },
  "allanime": {
    "OtakuDesu": "unlimited",
    "Samehadaku": "list"
  }
};

// Placeholder for data normalization - to be implemented by user
function normalizeData(rawData, sourceName, endpoint) {
  // Normalize data from different sources to a consistent format
  // Return rawData as-is for now
  return rawData;
}

export const API_BASE = API_SOURCES[0].url; // Default for direct use if needed
