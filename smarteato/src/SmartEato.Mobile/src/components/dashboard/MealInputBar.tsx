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

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
          <Ionicons name="camera-outline" size={24} color="#666666" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="What did you eat?"
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
            <Ionicons name="send" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
      {selectedImage && (
        <View style={styles.imageIndicator}>
          <Ionicons name="image" size={16} color="#000000" />
          <Text style={styles.imageText}>Image attached</Text>
          <TouchableOpacity onPress={() => setSelectedImage(null)}>
            <Ionicons name="close-circle" size={20} color="#666666" />
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
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#000000',
    borderRadius: 20,
    padding: 10,
    width: 40,
    height: 40,
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
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  imageText: {
    flex: 1,
    fontSize: 12,
    color: '#666666',
  },
});

