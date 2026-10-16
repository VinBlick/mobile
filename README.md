# vinblick-mobile

iOS + Android app for VINblick (Expo SDK 58, React Native, Expo Router).

Stack: TypeScript · Expo Router · TanStack Query (offline cache) · React Hook Form + Zod ·
Reanimated · expo-camera (VIN barcode / QR scanner) · expo-notifications (push) ·
expo-secure-store · expo-local-authentication. UI languages: German (default), English.

## Features

- VIN check: manual input with validation, barcode scanner (Code 39/128, DataMatrix), paste of
  a VIN, a mobile.de / AutoScout24 link or a VINblick link from the clipboard
- free preview by category → package selection → checkout (promo code, billing address,
  consents) → payment → live order progress
- reports: full report view, PDF download + system share sheet, invoices, share links with
  QR code, public reports (`/r/<token>`, `/check/<code>`)
- guest orders are kept in the keychain (“Meine Berichte” without an account)
- account: sign in / sign up / password reset / set password, profile, language,
  Face ID / fingerprint lock, account deletion (App Store requirement)
- push notifications when a report is ready or delayed; tapping opens the order
- universal links / app links for `https://<site>/r/…`, `/check/…`, `/orders/…`, `/account/…`
- offline: orders, reports and invoices stay readable from the persisted cache

## Quick start

```bash
cp .env.example .env      # API + site URL; for a phone use your LAN IP for a local API
npm ci
npx expo start            # press i / a, or scan the QR code with a development build
```

Camera, push and biometrics need a **development build** (not Expo Go):

```bash
npm i -g eas-cli
eas login
eas init                  # creates the EAS project → put the id into EAS_PROJECT_ID
eas build --profile development --platform ios     # or android
```

| Script | |
| --- | --- |
| `npm run lint` | ESLint incl. Feature-Sliced Design import rules |
| `npm run typecheck` | TypeScript |
| `npm test` | unit tests (Jest): VIN parsing, links, form schemas |

## Architecture (Feature-Sliced Design)

```
src/
  app/        Expo Router routes only (thin files that render a screen)
  providers/  query client + offline persistence, fonts, i18n, session, push, app lock
  screens/    one slice per screen
  widgets/    report view, order progress
  features/   check-vin, scan-vin, select-package, checkout, auth, profile,
              report-files, share-report, push, app-lock
  entities/   API + types per business object (check, package, order, report, invoice, session)
  shared/     api client, i18n, ui kit, theme tokens, lib (vin, links, format, storage)
```

Auth: the app sends `X-Client: mobile`; the API then returns the refresh token in the JSON body.
It is stored in the keychain (SecureStore), the access token only in memory; single-flight
refresh on 401.

## Payments

`features/checkout/model/payment.ts` defines a `PaymentAdapter`. The current adapter opens the
web checkout in an in-app browser and reconciles the order when the app becomes active.
Apple / Google may require in-app purchases for digital goods — once decided, add an IAP
adapter there; screens don't change.

## Release

1. Set EAS environment variables: `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_SITE_URL`,
   `EXPO_PUBLIC_SITE_HOST`, `EAS_PROJECT_ID`, optionally `APP_BUNDLE_ID`.
2. Universal links: the website must serve `/.well-known/apple-app-site-association`
   (Team ID + bundle id) and `/.well-known/assetlinks.json` (SHA-256 of the signing key).
3. Push: API `.env` → `EXPO_ACCESS_TOKEN` (optional, recommended). For iOS, EAS creates the
   APNs key during the first build.
4. `eas build --profile production --platform all` → `eas submit`.
