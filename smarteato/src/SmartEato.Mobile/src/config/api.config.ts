/**
 * API Configuration
 * 
 * Configure the base URL for the SmartEato API
 * In development, this should point to your local API
 * In production, this should point to your deployed API
 */

// For Expo/React Native on Android emulator, use 10.0.2.2
// For iOS simulator, use localhost
// For physical device, use your computer's IP address

console.log('API_BASE_URL from env:', process.env.API_BASE_URL);

export const API_CONFIG = {
  baseURL: process.env.API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  info: '/api/info',
  // Add more endpoints here as they are created
};


