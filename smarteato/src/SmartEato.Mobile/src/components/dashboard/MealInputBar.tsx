import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLogMeal } from '../../hooks/useMealLogging';

export const MealInputBar: React.FC = () => {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const logMeal = useLogMeal();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload meal photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(result.assets[0].base64);
      Alert.alert('Image Selected', 'Image will be sent with your meal description');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions to take meal photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(result.assets[0].base64);
      Alert.alert('Photo Taken', 'Photo will be sent with your meal description');
    }
  };

  const handleSend = () => {
    if (!message.trim() && !selectedImage) {
      Alert.alert('Error', 'Please enter a meal description or select an image');
      return;
    }

    // Clear input immediately for better UX
    const mealData = {
      description: message || 'Meal from photo',
      imageBase64: selectedImage || undefined,
    };
    setMessage('');
    setSelectedImage(null);

    // Submit meal (fire and forget for images to avoid waiting)
    logMeal.mutate(mealData, {
      onError: (error: any) => {
        Alert.alert('Error', error.response?.data?.message || 'Failed to log meal');
      },
    });
  };

  // Dynamic placeholder based on time of day
  const getPlaceholder = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Log breakfast";
    if (hour < 15) return "Add lunch";
    if (hour < 19) return "Log snack";
    return "Add dinner";
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
          <Ionicons name="camera-outline" size={24} color="#6B7280" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={getPlaceholder()}
          value={message}
          onChangeText={setMessage}
          editable={!logMeal.isPending}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[styles.sendButton, logMeal.isPending && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={logMeal.isPending}
        >
          {logMeal.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
      {selectedImage && (
        <View style={styles.imageIndicator}>
          <Ionicons name="image" size={16} color="#059669" />
          <Text style={styles.imageText}>Image attached</Text>
          <TouchableOpacity onPress={() => setSelectedImage(null)}>
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  imageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  imageText: {
    flex: 1,
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
});

