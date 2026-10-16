import { Badge, type BadgeTone } from "@/shared/ui";
import { useT, type TKey } from "@/shared/i18n";
import type { OrderStatus } from "../model/types";

const tone: Record<OrderStatus, BadgeTone> = {
  awaiting_payment: "muted",
  paid: "brand",
  processing: "brand",
  completed: "success",
  failed: "warning",
  cancelled: "muted",
  refunded: "muted",
  partially_refunded: "muted",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useT();
  return <Badge label={t(`orderStatus.${status}` as TKey)} tone={tone[status]} />;
}
