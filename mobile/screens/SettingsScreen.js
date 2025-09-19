import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Switch,
  Divider,
  HelperText,
  List,
  useTheme,
  Snackbar
} from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { validateDateInput, getDateFormatExamples, debounce } from '../utils/validation';

export default function SettingsScreen() {
  const theme = useTheme();
  const systemColorScheme = useColorScheme();
  
  // Settings state
  const [darkModeEnabled, setDarkModeEnabled] = useState(systemColorScheme === 'dark');
  const [apiUrl, setApiUrl] = useState('http://localhost:3000');
  const [recoveryDate, setRecoveryDate] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  
  // Validation state
  const [recoveryDateValidation, setRecoveryDateValidation] = useState({ isValid: true, error: null });
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Date format examples
  const [formatExamples] = useState(getDateFormatExamples());

  // Load settings from secure storage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedDarkMode = await SecureStore.getItemAsync('darkModeEnabled');
      const savedApiUrl = await SecureStore.getItemAsync('apiUrl');
      const savedRecoveryDate = await SecureStore.getItemAsync('recoveryDate');
      const savedTimezone = await SecureStore.getItemAsync('timezone');

      if (savedDarkMode !== null) {
        setDarkModeEnabled(JSON.parse(savedDarkMode));
      }
      if (savedApiUrl) {
        setApiUrl(savedApiUrl);
      }
      if (savedRecoveryDate) {
        setRecoveryDate(savedRecoveryDate);
      }
      if (savedTimezone) {
        setTimezone(savedTimezone);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await SecureStore.setItemAsync('darkModeEnabled', JSON.stringify(darkModeEnabled));
      await SecureStore.setItemAsync('apiUrl', apiUrl);
      await SecureStore.setItemAsync('recoveryDate', recoveryDate);
      await SecureStore.setItemAsync('timezone', timezone);
      
      setSnackbarMessage('Settings saved successfully');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbarMessage('Error saving settings');
      setShowSnackbar(true);
    }
  };

  // Debounced validation for recovery date
  const debouncedValidateRecoveryDate = useCallback(
    debounce((input) => {
      if (!input.trim()) {
        setRecoveryDateValidation({ isValid: true, error: null });
        return;
      }
      
      const validation = validateDateInput(input, timezone);
      setRecoveryDateValidation({
        isValid: validation.isValid,
        error: validation.error
      });
    }, 500),
    [timezone]
  );

  // Handle recovery date input
  const handleRecoveryDateChange = (text) => {
    setRecoveryDate(text);
    debouncedValidateRecoveryDate(text);
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    const newValue = !darkModeEnabled;
    setDarkModeEnabled(newValue);
    
    // Note: Theme change will be applied on next app restart
    // In a full implementation, you'd use a theme context provider
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/health`);
      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          'API Connection Test',
          `✅ Connected successfully!\n\nStatus: ${data.status}\nTimestamp: ${data.timestamp}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'API Connection Test',
          `❌ Connection failed (${response.status})\n\nPlease check the API URL and ensure the server is running.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'API Connection Test',
        `❌ Connection error: ${error.message}\n\nPlease check the API URL and network connection.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Appearance Settings */}
      <Card style={styles.card}>
        <Card.Title title="Appearance" />
        <Card.Content>
          <List.Item
            title="Dark Mode"
            description="Use dark theme for the app"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={darkModeEnabled}
                onValueChange={handleDarkModeToggle}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* API Settings */}
      <Card style={styles.card}>
        <Card.Title title="API Configuration" />
        <Card.Content>
          <TextInput
            label="API URL"
            value={apiUrl}
            onChangeText={setApiUrl}
            mode="outlined"
            placeholder="http://localhost:3000"
            style={styles.input}
            left={<TextInput.Icon icon="server" />}
          />
          <HelperText type="info">
            URL of the Daily Planner API server
          </HelperText>
          
          <Button
            mode="outlined"
            onPress={testApiConnection}
            style={styles.testButton}
            icon="wifi"
          >
            Test Connection
          </Button>
        </Card.Content>
      </Card>

      {/* Recovery Date Settings */}
      <Card style={styles.card}>
        <Card.Title title="Recovery Tracking" />
        <Card.Content>
          <TextInput
            label="Recovery Date"
            value={recoveryDate}
            onChangeText={handleRecoveryDateChange}
            mode="outlined"
            placeholder="2025-01-01"
            style={styles.input}
            left={<TextInput.Icon icon="calendar" />}
            error={!recoveryDateValidation.isValid}
          />
          <HelperText 
            type={recoveryDateValidation.isValid ? "info" : "error"}
            visible={true}
          >
            {recoveryDateValidation.error || "Date when your recovery journey began"}
          </HelperText>

          <Text style={[styles.formatTitle, { color: theme.colors.onSurface }]}>
            Accepted Formats:
          </Text>
          {Object.entries(formatExamples).map(([format, example]) => (
            <Text key={format} style={[styles.formatExample, { color: theme.colors.onSurfaceVariant }]}>
              • {format}: {example}
            </Text>
          ))}
        </Card.Content>
      </Card>

      {/* Timezone Settings */}
      <Card style={styles.card}>
        <Card.Title title="Timezone" />
        <Card.Content>
          <TextInput
            label="Timezone"
            value={timezone}
            onChangeText={setTimezone}
            mode="outlined"
            placeholder="UTC"
            style={styles.input}
            left={<TextInput.Icon icon="earth" />}
          />
          <HelperText type="info">
            Timezone for date calculations (e.g., UTC, America/New_York)
          </HelperText>
        </Card.Content>
      </Card>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <Button
          mode="contained"
          onPress={saveSettings}
          style={styles.saveButton}
          icon="content-save"
          disabled={!recoveryDateValidation.isValid}
        >
          Save Settings
        </Button>
      </View>

      {/* Snackbar for feedback */}
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setShowSnackbar(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  testButton: {
    marginTop: 8,
  },
  formatTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  formatExample: {
    fontSize: 12,
    marginLeft: 8,
    marginBottom: 4,
  },
  saveContainer: {
    marginVertical: 24,
  },
  saveButton: {
    paddingVertical: 8,
  },
});