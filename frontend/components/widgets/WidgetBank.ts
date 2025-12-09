import UtilizationWidget from "./UtilizationWidget";
import LoadsCompletedWidget from "./LoadsCompletedWidget";
import AvgTurnoverWidget from "./AvgTurnoverWidget";
import TrucksQueuedWidget from "./TrucksQueuedWidget";
import { DockBay } from "@/templates/types";

type WidgetBankType = {
  utilization: typeof UtilizationWidget;
  loadsCompleted: typeof LoadsCompletedWidget;
  turnover: typeof AvgTurnoverWidget;
  queued: typeof TrucksQueuedWidget;
};

export type WidgetKey = keyof WidgetBankType;

export const WIDGET_BANK: Record<WidgetKey, React.ComponentType<{ docks: DockBay[] }>> = {
  utilization: UtilizationWidget,
  loadsCompleted: LoadsCompletedWidget,
  turnover: AvgTurnoverWidget,
  queued: TrucksQueuedWidget,
} as const;