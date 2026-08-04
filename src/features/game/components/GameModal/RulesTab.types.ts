export type RulesTabProps = {
  effects: string[];
  markers: string[];
  walls: string[];
  onEffectsChanged: (value: string[]) => void;
  onMarkersChanged: (value: string[]) => void;
  onWallsChanged: (value: string[]) => void;
};
