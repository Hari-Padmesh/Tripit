function normalizeUrl(value) {
  return String(value || "").replace(/\/+$/, "");
}

export function getBackendOrigin() {
  const configured = normalizeUrl(import.meta.env.VITE_API_BASE_URL || "http://localhost:4000");
  return configured.replace(/\/api$/, "");
}

export function getApiBaseUrl() {
  return `${getBackendOrigin()}/api`;
}
