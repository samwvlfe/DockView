import UtilizationWidget from "./UtilizationWidget";
import LoadsCompletedWidget from "./LoadsCompletedWidget";
import TrucksQueuedWidget from "./TrucksQueuedWidget";
import AvgLoadTimeWidget from "./AvgLoadTimeWidget";
import ActiveExceptionsWidget from "./ActiveExceptionsWidget";
import { DockBay } from "@/types/interfaces";

type WidgetBankType = {
  utilization: typeof UtilizationWidget;
  loadsCompleted: typeof LoadsCompletedWidget;
  queued: typeof TrucksQueuedWidget;
  avgLoadTime: typeof AvgLoadTimeWidget;
  activeExceptions: typeof ActiveExceptionsWidget;
};

export type WidgetKey = keyof WidgetBankType;

export const WIDGET_BANK: Record<WidgetKey, React.ComponentType<{ docks: DockBay[] }>> = {
  utilization: UtilizationWidget,
  loadsCompleted: LoadsCompletedWidget,
  queued: TrucksQueuedWidget,
  avgLoadTime: AvgLoadTimeWidget,
  activeExceptions: ActiveExceptionsWidget,
} as const;

export const WIDGET_LABELS: Record<WidgetKey, string> = {
  utilization: "Bay Utilization",
  loadsCompleted: "Loads Completed",
  queued: "Trucks Queued",
  avgLoadTime: "Avg Load Time",
  activeExceptions: "Active Exceptions",
};
