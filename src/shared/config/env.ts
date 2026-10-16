const trim = (v: string | undefined) => (v ?? "").replace(/\/+$/, "");

export const env = {
  apiBaseUrl: trim(process.env.EXPO_PUBLIC_API_BASE_URL) || "https://vin-check-api.alexalexdev.io/v1",
  siteUrl: trim(process.env.EXPO_PUBLIC_SITE_URL) || "https://vinblick.alexalexdev.io",
} as const;
