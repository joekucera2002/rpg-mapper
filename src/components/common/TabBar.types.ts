export type Tab = {
  key: string;
  label: string;
};

export type TabBarProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
};
