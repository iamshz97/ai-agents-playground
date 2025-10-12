import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApiInfo } from './src/api/hooks';
import { API_BASE_URL } from '@env';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function HomeScreen() {
  const { data, isLoading, error } = useApiInfo();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartEato</Text>
      <Text style={styles.subtitle}>Calorie Tracker AI Agentic App</Text>
      
      <View style={styles.apiStatus}>
        <Text style={styles.label}>API Status: {process.env.TEST_SETTING ?? 'N/A'}</Text>
        {isLoading && <ActivityIndicator size="small" color="#0000ff" />}
        {error && <Text style={styles.error}>Error: {error.message}</Text>}
        {data && (
          <View style={styles.apiInfo}>
            <Text style={styles.success}>✓ Connected</Text>
            <Text style={styles.text}>Name: {data.name}</Text>
            <Text style={styles.text}>Version: {data.version}</Text>
            <Text style={styles.text}>Status: {data.status}</Text>
          </View>
        )}
      </View>

      <Text style={styles.instructions}>
        The app is ready for development!
      </Text>
      
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomeScreen />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  apiStatus: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  apiInfo: {
    marginTop: 10,
  },
  success: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
    marginBottom: 8,
  },
  error: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  instructions: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});
