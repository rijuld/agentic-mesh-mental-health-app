import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { UserRole } from '../types';
import { useStore } from '../store/useStore';

interface RoleCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ title, subtitle, icon, color, onPress }) => (
  <TouchableOpacity
    style={[styles.card, { borderColor: color }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <Ionicons name={icon} size={32} color={colors.text} />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
  </TouchableOpacity>
);

interface RoleGateScreenProps {
  navigation: any;
}

export const RoleGateScreen: React.FC<RoleGateScreenProps> = ({ navigation }) => {
  const setSelectedRole = useStore((state) => state.setSelectedRole);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="anchor" size={48} color={colors.primary} />
        </View>
        <Text style={styles.appName}>Anchor</Text>
        <Text style={styles.tagline}>Your digital safety blanket</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>What is your role in the recovery journey?</Text>

        <View style={styles.cardsContainer}>
          <RoleCard
            title="I am Navigating Recovery"
            subtitle="Patient Mode"
            icon="heart-outline"
            color={colors.cardPatient}
            onPress={() => handleRoleSelect('patient')}
          />

          <RoleCard
            title="I am a Supporter"
            subtitle="Ally Mode"
            icon="people-outline"
            color={colors.cardAlly}
            onPress={() => handleRoleSelect('ally')}
          />

          <RoleCard
            title="I am a Clinician"
            subtitle="Therapist Mode"
            icon="medical-outline"
            color={colors.cardTherapist}
            onPress={() => handleRoleSelect('therapist')}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
            Sign in
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
