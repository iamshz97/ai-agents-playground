import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../api/client';
import { CreateProfileDto } from '../../types/user.types';

export const ProfileSetupScreen: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState<string>('Male');
  const [currentWeight, setCurrentWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<string>('Sedentary');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshProfile } = useAuth();

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const activityLevels = ['Sedentary', 'Lightly Active', 'Active', 'Very Active'];
  const dietaryOptions = ['Vegetarian', 'Vegan'];

  const toggleDietaryPreference = (pref: string) => {
    setDietaryPreferences(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleSubmit = async () => {
    if (!fullName || !birthdate || !currentWeight || !height) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const preferences = [...dietaryPreferences];
    if (allergies.trim()) {
      preferences.push(`Allergies: ${allergies.trim()}`);
    }

    const profileData: CreateProfileDto = {
      fullName,
      birthdate,
      gender,
      currentWeight: parseFloat(currentWeight),
      height: parseFloat(height),
      goalWeight: goalWeight ? parseFloat(goalWeight) : undefined,
      activityLevel,
      dietaryPreferences: preferences.length > 0 ? preferences : undefined,
    };

    setLoading(true);
    try {
      await apiClient.post('/api/profile', profileData);
      await refreshProfile();
      Alert.alert('Success', 'Profile created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Help us personalize your experience</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Birthdate * (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="1990-01-01"
                value={birthdate}
                onChangeText={setBirthdate}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender *</Text>
              <View style={styles.optionGroup}>
                {genderOptions.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      gender === option && styles.optionButtonSelected,
                    ]}
                    onPress={() => setGender(option)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        gender === option && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Current Weight (kg) *</Text>
              <TextInput
                style={styles.input}
                placeholder="70"
                value={currentWeight}
                onChangeText={setCurrentWeight}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Height (cm) *</Text>
              <TextInput
                style={styles.input}
                placeholder="170"
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Goal Weight (kg) - Optional</Text>
              <TextInput
                style={styles.input}
                placeholder="65"
                value={goalWeight}
                onChangeText={setGoalWeight}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Activity Level *</Text>
              <View style={styles.optionGroup}>
                {activityLevels.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      activityLevel === option && styles.optionButtonSelected,
                    ]}
                    onPress={() => setActivityLevel(option)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        activityLevel === option && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dietary Preferences - Optional</Text>
              <View style={styles.optionGroup}>
                {dietaryOptions.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      dietaryPreferences.includes(option) && styles.optionButtonSelected,
                    ]}
                    onPress={() => toggleDietaryPreference(option)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        dietaryPreferences.includes(option) && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Allergies - Optional</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Peanuts, Shellfish"
                value={allergies}
                onChangeText={setAllergies}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Complete Setup</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  optionButtonSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  optionText: {
    fontSize: 14,
    color: '#000000',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

