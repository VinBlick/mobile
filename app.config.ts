import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * App identity and native config. Environment specific values come from
 * EXPO_PUBLIC_* variables (.env / EAS environment variables).
 */
const SITE_HOST = process.env.EXPO_PUBLIC_SITE_HOST ?? "vinblick.alexalexdev.io";
const BUNDLE_ID = process.env.APP_BUNDLE_ID ?? "de.vinblick.app";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "VINblick",
  slug: "vinblick",
  scheme: "vinblick",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  ios: {
    bundleIdentifier: BUNDLE_ID,
    supportsTablet: false,
    associatedDomains: [`applinks:${SITE_HOST}`],
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      LSApplicationQueriesSchemes: ["https"],
    },
  },
  android: {
    package: BUNDLE_ID,
    adaptiveIcon: {
      backgroundColor: "#FFD200",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    // open shared report / check links and order links from e-mails in the app
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          { scheme: "https", host: SITE_HOST, pathPrefix: "/r/" },
          { scheme: "https", host: SITE_HOST, pathPrefix: "/check/" },
          { scheme: "https", host: SITE_HOST, pathPrefix: "/orders/" },
          { scheme: "https", host: SITE_HOST, pathPrefix: "/konto/passwort-festlegen" },
          { scheme: "https", host: SITE_HOST, pathPrefix: "/account/" },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: { bundler: "metro", output: "single", favicon: "./assets/favicon.png" },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-web-browser",
    "expo-localization",
    [
      "expo-splash-screen",
      { image: "./assets/splash-icon.png", imageWidth: 160, backgroundColor: "#FFD200" },
    ],
    [
      "expo-camera",
      {
        cameraPermission:
          "VINblick nutzt die Kamera, um die Fahrgestellnummer (VIN) oder einen Prüfcode zu scannen.",
        microphonePermission: false,
        recordAudioAndroid: false,
        barcodeScannerEnabled: true,
      },
    ],
    [
      "expo-notifications",
      { icon: "./assets/android-icon-monochrome.png", color: "#003B7A" },
    ],
    [
      "expo-local-authentication",
      { faceIDPermission: "Mit Face ID schützen Sie Ihre Berichte und Rechnungen." },
    ],
  ],
  experiments: { typedRoutes: true },
  extra: {
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
});
