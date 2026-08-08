export type Area = {
  id: string;
  gameId: string;
  parentAreaId: string | null;
  name: string;
  isOpen: boolean;
};

export type AreaData = {
  name: string;
  parentAreaId: string | null;
};
