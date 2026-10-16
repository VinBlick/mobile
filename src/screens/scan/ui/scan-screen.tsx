import { useRouter } from "expo-router";
import { Scanner, type ScanResult } from "@/features/scan-vin";

/** full screen camera; routes every result to the matching screen */
export function ScanScreen() {
  const router = useRouter();
  const onResult = (r: ScanResult) => {
    switch (r.type) {
      case "vin":
        return router.replace({ pathname: "/vin/[vin]", params: { vin: r.vin } });
      case "share":
        return router.replace({ pathname: "/r/[token]", params: { token: r.token } });
      case "code":
        return router.replace({ pathname: "/check/[code]", params: { code: r.code } });
      case "order":
        return router.replace({ pathname: "/orders/[id]", params: r.access ? { id: r.orderId, access: r.access } : { id: r.orderId } });
    }
  };
  return <Scanner onResult={onResult} />;
}
