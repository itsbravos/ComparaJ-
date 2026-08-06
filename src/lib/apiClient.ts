// Em produção estática (GitHub Pages), VITE_API_BASE_URL aponta pro backend
// hospedado separadamente (ex: Vercel). Em dev local fica vazio e os fetches
// usam caminho relativo, servidos pelo próprio Express (server.ts).
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export const apiUrl = (path: string) => `${API_BASE}${path}`;
