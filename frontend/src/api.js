/**
 * HP-Sentinel API client
 * Base URL uses Vite proxy in dev: /api -> http://localhost:8000
 */

const API_BASE = "/api";

async function fetchApi(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getKpis: () => fetchApi("/kpis"),
  getLeadsOverTime: () => fetchApi("/leads-over-time"),
  getProductDemand: () => fetchApi("/product-demand"),
  getLeadStatus: () => fetchApi("/lead-status"),
  getLeads: () => fetchApi("/leads"),
  getLeadDossier: (id) => fetchApi(`/leads/${id}`),
  getFunnel: () => fetchApi("/analytics/funnel"),
  getSectors: () => fetchApi("/analytics/sectors"),
  predictScore: (companyName, signalText = "") =>
    fetchApi("/score", {
      method: "POST",
      body: JSON.stringify({ company_name: companyName, signal_text: signalText }),
    }),
};
