import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DragonflyApp } from './src/DragonflyApp';
import { colors } from './src/theme/colors';
import { fontAssets } from './src/theme/fonts';

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <SafeAreaProvider>
      <DragonflyApp />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
