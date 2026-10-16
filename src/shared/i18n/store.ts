import { getLocales } from "expo-localization";
import { prefs } from "@/shared/lib/storage";
import { de } from "./locales/de";
import { en } from "./locales/en";

export type Locale = "de" | "en";
export const LOCALES: { value: Locale; label: string }[] = [
  { value: "de", label: "Deutsch" },
  { value: "en", label: "English" },
];

type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type TKey = Leaves<typeof de>;
export type TFn = (key: TKey, vars?: Record<string, string | number>) => string;

const dictionaries: Record<Locale, unknown> = { de, en };
const KEY = "vinblick.locale";
const listeners = new Set<() => void>();

const device = (): Locale => (getLocales()[0]?.languageCode === "en" ? "en" : "de");
let current: Locale = device();

export const getLocale = () => current;
export const loadLocale = async () => {
  const saved = await prefs.get<Locale | null>(KEY, null);
  if (saved === "de" || saved === "en") {
    current = saved;
    listeners.forEach((l) => l());
  }
};
export const setLocale = (locale: Locale) => {
  current = locale;
  void prefs.set(KEY, locale);
  listeners.forEach((l) => l());
};
export const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

const lookup = (locale: Locale, key: string) => {
  let node: unknown = dictionaries[locale];
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in node) node = (node as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof node === "string" ? node : undefined;
};

export const translate = (locale: Locale, key: string, vars?: Record<string, string | number>) => {
  const raw = lookup(locale, key) ?? lookup("de", key) ?? key;
  return vars ? raw.replace(/\{(\w+)\}/g, (m, n: string) => (n in vars ? String(vars[n]) : m)) : raw;
};

export const isTKey = (v: string): v is TKey => lookup("de", v) !== undefined;
