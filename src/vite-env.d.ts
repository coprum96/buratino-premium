/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_API_KEY?: string;
  readonly VITE_SHOW_DEV_PANEL?: string;
  readonly VITE_CLOUDFLARE_ANALYTICS_TOKEN?: string;
  readonly VITE_RESEARCH_MODE?: string;
  readonly VITE_RESEARCH_SEND?: string;
  readonly VITE_RESEARCH_WAVE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
