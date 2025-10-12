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

    logMeal.mutate(
      {
        description: message || 'Meal from photo',
        imageBase64: selectedImage || undefined,
      },
      {
        onSuccess: () => {
          setMessage('');
          setSelectedImage(null);
          Alert.alert('Success', 'Meal logged successfully!');
        },
        onError: (error: any) => {
          Alert.alert('Error', error.response?.data?.message || 'Failed to log meal');
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
          <Text style={styles.iconText}>🖼️</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
          <Text style={styles.iconText}>📷</Text>
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
            <Text style={styles.sendIcon}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
      {selectedImage && (
        <View style={styles.imageIndicator}>
          <Text style={styles.iconText}>📸</Text>
          <Text style={styles.imageText}>Image attached</Text>
          <TouchableOpacity onPress={() => setSelectedImage(null)}>
            <Text style={styles.iconText}>❌</Text>
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
  iconText: {
    fontSize: 20,
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
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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

