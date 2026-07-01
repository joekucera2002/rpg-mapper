import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  GameSelect: undefined;
  MapEditor: { gameId: string };
};

export type MapEditorScreenProps = NativeStackScreenProps<RootStackParamList, 'MapEditor'>;
