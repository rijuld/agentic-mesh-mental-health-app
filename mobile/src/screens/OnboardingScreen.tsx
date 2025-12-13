import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { UserRole } from '../types';
import { useStore } from '../store/useStore';

interface OnboardingScreenProps {
  navigation: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [step, setStep] = useState<'role' | 'name' | 'email'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { registerUser, setSelectedRole: setStoreRole } = useStore();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('name');
  };

  const handleNameSubmit = () => {
    if (name.trim().length < 2) {
      setError('Please enter your name');
      return;
    }
    setError(null);
    setStep('email');
  };

  const handleComplete = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (!selectedRole || !name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const success = await registerUser(email.trim(), name.trim(), selectedRole);
      if (!success) {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'patient': return 'on your recovery journey';
      case 'ally': return 'as a supporter';
      case 'therapist': return 'as a clinician';
    }
  };

  if (step === 'role') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="flower-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.appName}>Sukoon</Text>
          <Text style={styles.tagline}>Find your calm within</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.question}>How will you be using Sukoon?</Text>

          <View style={styles.cardsContainer}>
            <TouchableOpacity
              style={[styles.card, { borderColor: colors.cardPatient }]}
              onPress={() => handleRoleSelect('patient')}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.cardPatient }]}>
                <Ionicons name="heart-outline" size={32} color={colors.text} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>I'm on my recovery journey</Text>
                <Text style={styles.cardSubtitle}>Tools & support for healing</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { borderColor: colors.cardAlly }]}
              onPress={() => handleRoleSelect('ally')}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.cardAlly }]}>
                <Ionicons name="people-outline" size={32} color={colors.text} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>I'm supporting someone</Text>
                <Text style={styles.cardSubtitle}>Help a loved one heal</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { borderColor: colors.cardTherapist }]}
              onPress={() => handleRoleSelect('therapist')}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.cardTherapist }]}>
                <Ionicons name="medical-outline" size={32} color={colors.text} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>I'm a mental health professional</Text>
                <Text style={styles.cardSubtitle}>Monitor & support patients</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'name') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => setStep('role')}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>What's your name?</Text>
            <Text style={styles.formSubtitle}>
              We'll use this to personalize your experience
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={handleNameSubmit}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={colors.crisis} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.continueButton, !name.trim() && styles.disabledButton]}
              onPress={handleNameSubmit}
              disabled={!name.trim()}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => setStep('name')}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Hi {name}! 👋</Text>
          <Text style={styles.formSubtitle}>
            Enter your email to get started {getRoleLabel(selectedRole!)}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoFocus
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="done"
            onSubmitEditing={handleComplete}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={colors.crisis} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.continueButton, (!email.trim() || isLoading) && styles.disabledButton]}
            onPress={handleComplete}
            disabled={!email.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Get Started</Text>
                <Ionicons name="checkmark" size={20} color={colors.text} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  question: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  cardsContainer: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  backButton: {
    padding: spacing.lg,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  formTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  formSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.crisis,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
});
