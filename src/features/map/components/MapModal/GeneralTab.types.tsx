export type GeneralTabProps = {
  name: string;
  nameError: string | undefined;
  type: string;
  isEditMode: boolean;
  onNameChanged: (value: string) => void;
  onTypeChanged: (value: string) => void;
  onDelete: () => void;
};
