import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';

import SettingsScreen from './mobile/screens/SettingsScreen';
import HomeScreen from './mobile/screens/HomeScreen';
import { lightTheme, darkTheme } from './mobile/utils/theme';

const Stack = createStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer theme={theme}>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.surface,
              },
              headerTintColor: theme.colors.onSurface,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Daily Planner' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ title: 'Settings' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}