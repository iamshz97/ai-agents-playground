import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Auth Screens
import { LandingScreen } from './src/screens/auth/LandingScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignupScreen } from './src/screens/auth/SignupScreen';

// App Screens
import { ProfileSetupScreen } from './src/screens/onboarding/ProfileSetupScreen';
import { DashboardScreen } from './src/screens/dashboard/DashboardScreen';

import type { AuthStackParamList, AppStackParamList } from './src/types/navigation.types';

// Create navigators
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Landing" component={LandingScreen} />
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: true, title: 'Log In' }}
      />
      <AuthStack.Screen 
        name="Signup" 
        component={SignupScreen}
        options={{ headerShown: true, title: 'Sign Up' }}
      />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  const { profile } = useAuth();
  
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!profile ? (
        <AppStack.Screen 
          name="ProfileSetup" 
          component={ProfileSetupScreen}
          options={{ headerShown: true, title: 'Profile Setup', headerBackVisible: false }}
        />
      ) : (
        <AppStack.Screen name="Dashboard" component={DashboardScreen} />
      )}
    </AppStack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
