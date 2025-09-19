import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Button,
  Card,
  FAB,
  useTheme
} from 'react-native-paper';

export default function HomeScreen({ navigation }) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.welcomeCard}>
        <Card.Title title="Welcome to Daily Planner" />
        <Card.Content>
          <Text style={styles.description}>
            A privacy-first daily planner with recovery tracking, PowerShell generators, 
            and cross-platform support.
          </Text>
          
          <Text style={[styles.featuresTitle, { color: theme.colors.primary }]}>
            Features:
          </Text>
          <Text style={styles.feature}>
            • Server-side date validation with multiple formats
          </Text>
          <Text style={styles.feature}>
            • Dark mode support
          </Text>
          <Text style={styles.feature}>
            • Timezone-agnostic date handling
          </Text>
          <Text style={styles.feature}>
            • Recovery tracking with sobriety counters
          </Text>
          <Text style={styles.feature}>
            • PowerShell page generators
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.statusCard}>
        <Card.Title title="System Status" />
        <Card.Content>
          <Text style={styles.statusText}>
            📱 Mobile App: Ready
          </Text>
          <Text style={styles.statusText}>
            🔧 API Server: Check settings to test connection
          </Text>
          <Text style={styles.statusText}>
            📝 Page Generators: Use PowerShell scripts
          </Text>
        </Card.Content>
      </Card>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="cog"
        onPress={() => navigation.navigate('Settings')}
        label="Settings"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
  },
  statusCard: {
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  feature: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});