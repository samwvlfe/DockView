export interface DockBay {
  id: string;
  friendly_id: number;
  name: string;
  status: string;
  status_changed_at?: string;
}

// export interface DockBayCardProps{
//   docks: DockBay[];
//   onSelectDock: (id: number) => void;
// }