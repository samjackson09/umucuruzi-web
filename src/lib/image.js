const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://app-f57c4746-3838-4314-8c7e-de2713c61ef2.cleverapps.io/api";

const BASE_URL = API_URL.replace(/\/api\/?$/, "");

export const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("data:image")) return path;
  if (/^https?:\/\//.test(path)) return path;
  return path.startsWith("/") ? `${BASE_URL}${path}` : `${BASE_URL}/${path}`;
};

export const extractFirstImage = (raw) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw.length ? String(raw[0]) : null;
  if (typeof raw === "string") {
    try {
      let parsed = JSON.parse(raw);
      if (typeof parsed === "string") {
        try { parsed = JSON.parse(parsed); } catch {}
      }
      if (Array.isArray(parsed)) return parsed.length ? String(parsed[0]) : null;
      if (typeof parsed === "string") return parsed;
    } catch {}
    return raw;
  }
  return null;
};
