import { Tabs } from "expo-router";
import { FileText, Search, UserRound } from "lucide-react-native";
import { useT } from "@/shared/i18n";
import { colors, fonts } from "@/shared/theme";

export default function TabsLayout() {
  const t = useT();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.subtle,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: { borderTopColor: colors.line, backgroundColor: colors.white },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("nav.check"), tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }} />
      <Tabs.Screen name="reports" options={{ title: t("nav.reports"), tabBarIcon: ({ color, size }) => <FileText color={color} size={size} /> }} />
      <Tabs.Screen name="account" options={{ title: t("nav.account"), tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }} />
    </Tabs>
  );
}
