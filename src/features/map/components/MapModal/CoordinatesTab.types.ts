import { XDirection, YDirection } from '../../../../types/map';

export type CoordinatesTabProps = {
  xIncreases: XDirection;
  yIncreases: YDirection;
  onXIncreasesChanged: (value: XDirection) => void;
  onYIncreasesChanged: (value: YDirection) => void;
};
