import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";

/**
 * Payment adapters. Until the client decides on In-App Purchases, the app
 * uses the hosted checkout of the API (Stripe / mock) in an in-app browser.
 * An IAP adapter (StoreKit / Play Billing) plugs in here without touching
 * the screens: it must resolve once the store purchase is verified by the API.
 */
export interface PaymentAdapter {
  readonly kind: "web-checkout" | "store";
  pay(input: { orderId: string; checkoutUrl: string }): Promise<"returned" | "cancelled">;
}

const isSafeCheckoutUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || (__DEV__ && u.protocol === "http:");
  } catch {
    return false;
  }
};

export const webCheckoutAdapter: PaymentAdapter = {
  kind: "web-checkout",
  async pay({ checkoutUrl }) {
    if (!isSafeCheckoutUrl(checkoutUrl)) throw new Error("Invalid checkout URL");
    if (Platform.OS === "web") {
      window.open(checkoutUrl, "_blank");
      return "returned";
    }
    const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
      dismissButtonStyle: "close",
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: "#003B7A",
    });
    // iOS reports how the sheet was closed; Android returns "opened" immediately
    // and the order screen reconciles when the app becomes active again.
    return result.type === "cancel" ? "cancelled" : "returned";
  },
};

export const paymentAdapter: PaymentAdapter = webCheckoutAdapter;
