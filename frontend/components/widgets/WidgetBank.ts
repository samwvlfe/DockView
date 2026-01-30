import UtilizationWidget from "./UtilizationWidget";
import LoadsCompletedWidget from "./LoadsCompletedWidget";
import TrucksQueuedWidget from "./TrucksQueuedWidget";
import { DockBay } from "@/types/interfaces";

type WidgetBankType = {
  utilization: typeof UtilizationWidget;
  loadsCompleted: typeof LoadsCompletedWidget;
  queued: typeof TrucksQueuedWidget;
};

export type WidgetKey = keyof WidgetBankType;

export const WIDGET_BANK: Record<WidgetKey, React.ComponentType<{ docks: DockBay[] }>> = {
  utilization: UtilizationWidget,
  loadsCompleted: LoadsCompletedWidget,
  queued: TrucksQueuedWidget,
} as const;