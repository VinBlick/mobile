import { useRouter } from "expo-router";
import { SearchX } from "lucide-react-native";
import { useT } from "@/shared/i18n";
import { colors } from "@/shared/theme";
import { Button, EmptyState, Screen } from "@/shared/ui";

export function NotFoundScreen() {
  const t = useT();
  const router = useRouter();
  return (
    <Screen scroll={false} contentStyle={{ justifyContent: "center" }}>
      <EmptyState
        icon={<SearchX color={colors.brand} size={32} />}
        title={t("notFound.title")}
        description={t("notFound.text")}
        action={<Button title={t("notFound.home")} onPress={() => router.replace("/")} />}
      />
    </Screen>
  );
}
