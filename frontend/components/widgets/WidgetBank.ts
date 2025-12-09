import UtilizationWidget from "./UtilizationWidget";
import LoadsCompletedWidget from "./LoadsCompletedWidget";
import AvgTurnoverWidget from "./AvgTurnoverWidget";
import TrucksQueuedWidget from "./TrucksQueuedWidget";

export const WIDGET_BANK = {
  utilization: UtilizationWidget,
  loadsCompleted: LoadsCompletedWidget,
  turnover: AvgTurnoverWidget,
  queued: TrucksQueuedWidget,
} as const;

export type WidgetKey = keyof typeof WIDGET_BANK;