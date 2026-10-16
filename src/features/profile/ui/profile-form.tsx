import { useState } from "react";
import { View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAccount, updateProfile, type User } from "@/entities/session";
import { orderAccessStore } from "@/entities/order";
import { errorMessage, useT } from "@/shared/i18n";
import { Button, Input, Notice, Text } from "@/shared/ui";

export function ProfileForm({ user }: { user: User }) {
  const t = useT();
  const client = useQueryClient();
  const [firstName, setFirst] = useState(user.firstName);
  const [lastName, setLast] = useState(user.lastName);
  const save = useMutation({
    mutationFn: () => updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() }),
    onSuccess: (u) => client.setQueryData(["session"], u),
  });
  return (
    <View style={{ gap: 12 }}>
      <Input label={t("auth.firstName")} value={firstName} onChangeText={setFirst} autoComplete="given-name" />
      <Input label={t("auth.lastName")} value={lastName} onChangeText={setLast} autoComplete="family-name" />
      <Input label={t("auth.email")} value={user.email} editable={false} />
      {save.isSuccess ? <Notice tone="success">{t("common.saved")}</Notice> : null}
      {save.error ? <Notice tone="danger">{errorMessage(t, save.error)}</Notice> : null}
      <Button title={t("common.save")} loading={save.isPending} onPress={() => save.mutate()} disabled={!firstName.trim()} />
    </View>
  );
}

/** App Store guideline 5.1.1(v): account deletion inside the app */
export function DeleteAccount({ onDeleted }: { onDeleted: () => void }) {
  const t = useT();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const remove = useMutation({
    mutationFn: () => deleteAccount(password),
    onSuccess: async () => {
      await orderAccessStore.clear();
      client.clear();
      onDeleted();
    },
  });
  if (!open) return <Button title={t("account.delete")} variant="danger" onPress={() => setOpen(true)} />;
  return (
    <View style={{ gap: 12 }}>
      <Text variant="bodyMuted">{t("account.deleteText")}</Text>
      <Input label={t("auth.password")} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" />
      {remove.error ? <Notice tone="danger">{errorMessage(t, remove.error)}</Notice> : null}
      <Button title={t("account.deleteConfirm")} variant="danger" loading={remove.isPending} disabled={!password} onPress={() => remove.mutate()} />
      <Button title={t("common.cancel")} variant="ghost" onPress={() => setOpen(false)} />
    </View>
  );
}
