import { useState } from "react";
import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { apiUrl, authHeaders, refreshAccessToken, sessionStore } from "@/shared/api";

/**
 * Downloads a protected PDF (report / invoice) into the app's documents and
 * opens the share sheet ("In Dateien sichern", Mail, AirDrop …). The file stays
 * available offline under Documents/VINblick.
 */
export async function downloadAndSharePdf(input: { path: string; filename: string; orderAccess?: string | null }) {
  // make sure a possibly expired access token is renewed before the native download
  if (await sessionStore.getRefresh()) await refreshAccessToken();
  const url = apiUrl(input.path);
  const headers = authHeaders(input.orderAccess);

  if (Platform.OS === "web") {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Download failed (${res.status})`);
    const blob = URL.createObjectURL(await res.blob());
    window.open(blob, "_blank");
    return;
  }

  const dir = new Directory(Paths.document, "VINblick");
  if (!dir.exists) dir.create({ idempotent: true });
  const target = new File(dir, input.filename.replace(/[^\w.-]+/g, "_"));
  const file = await File.downloadFileAsync(url, target, { headers, idempotent: true });
  if (await Sharing.isAvailableAsync())
    await Sharing.shareAsync(file.uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: input.filename });
}

export function usePdfDownload() {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const download = async (input: { path: string; filename: string; orderAccess?: string | null }) => {
    setPending(input.path);
    setError(null);
    try {
      await downloadAndSharePdf(input);
    } catch (e) {
      setError(e);
    } finally {
      setPending(null);
    }
  };
  return { download, pending, error };
}
