export type MarkersTabProps = {
  gameMarkers: string[];
  markers: string[];
  onMarkersChanged: (markers: string[]) => void;
};
