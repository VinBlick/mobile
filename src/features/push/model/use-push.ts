import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { useRouter } from "expo-router";
import { registerDevice } from "@/entities/session";
import { prefs } from "@/shared/lib/storage";

const TOKEN_KEY = "vinblick.pushToken";

if (Platform.OS !== "web")
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });

export const getStoredPushToken = () => prefs.get<string | null>(TOKEN_KEY, null);

/** asks for permission once the user has an account and registers the Expo push token */
export async function registerForPush(): Promise<string | null> {
  if (Platform.OS === "web" || !Device.isDevice) return null;
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync("orders", {
      name: "Bestellungen",
      importance: AndroidImportance.HIGH,
    });
  const current = await Notifications.getPermissionsAsync();
  const status = current.granted ? "granted" : (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return null;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    await registerDevice(data, Platform.OS === "ios" ? "IOS" : "ANDROID");
    await prefs.set(TOKEN_KEY, data);
    return data;
  } catch {
    return null; // offline or not configured — retried on next start
  }
}

/** registers when signed in and opens the order when a notification is tapped */
export function usePushNotifications(signedIn: boolean) {
  const router = useRouter();
  const registered = useRef(false);

  useEffect(() => {
    if (!signedIn || registered.current) return;
    registered.current = true;
    void registerForPush();
  }, [signedIn]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const open = (r: Notifications.NotificationResponse | null) => {
      const orderId = r?.notification.request.content.data?.orderId;
      if (typeof orderId === "string") router.push({ pathname: "/orders/[id]", params: { id: orderId } });
    };
    void Notifications.getLastNotificationResponseAsync().then(open);
    const sub = Notifications.addNotificationResponseReceivedListener((r) => {
      if (r.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) open(r);
    });
    return () => sub.remove();
  }, [router]);
}
