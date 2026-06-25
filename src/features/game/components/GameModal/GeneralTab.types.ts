export type GeneralTabProps = {
  name: string;
  image: string | null;
  color: string;
  onNameChanged: (value: string) => void;
  onImageChanged: (value: string | null) => void;
  onColorChanged: (value: string) => void;
  onDeleteGame: () => void;
  nameError?: string;
  isEditMode: boolean;
};
