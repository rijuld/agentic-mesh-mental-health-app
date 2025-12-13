import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { CrisisButton } from '../../components/CrisisButton';

interface PatientHomeScreenProps {
  navigation: any;
}

export const PatientHomeScreen: React.FC<PatientHomeScreenProps> = ({ navigation }) => {
  const { currentMood, setCurrentMood, addMoodLog, user } = useStore();
  const [todaySkill] = useState('Opposite Action');

  const handleMoodChange = (value: number) => {
    setCurrentMood(value);
    addMoodLog({
      id: Date.now().toString(),
      userId: user?.id || '',
      level: value,
      timestamp: new Date().toISOString(),
    });
  };

  const getMoodLabel = (value: number): string => {
    if (value <= 3) return 'Struggling';
    if (value <= 5) return 'Managing';
    if (value <= 7) return 'Stable';
    return 'Thriving';
  };

  const getMoodColor = (value: number): string => {
    if (value <= 3) return colors.statusRed;
    if (value <= 5) return colors.statusYellow;
    return colors.statusGreen;
  };

  return (
    <SafeAreaView style={styles.container}>
      <CrisisButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Friend'}</Text>
        </View>

        <View style={styles.moodCard}>
          <Text style={styles.moodQuestion}>How are you regulating right now?</Text>

          <View style={styles.moodSliderContainer}>
            <View style={styles.moodLabels}>
              <Text style={styles.moodLabelText}>1</Text>
              <Text style={[styles.moodValue, { color: getMoodColor(currentMood) }]}>
                {currentMood} - {getMoodLabel(currentMood)}
              </Text>
              <Text style={styles.moodLabelText}>10</Text>
            </View>

            <View style={styles.moodButtons}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.moodButton,
                    currentMood === num && { backgroundColor: getMoodColor(num) },
                  ]}
                  onPress={() => handleMoodChange(num)}
                >
                  <Text
                    style={[
                      styles.moodButtonText,
                      currentMood === num && styles.moodButtonTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.dailySkillCard}>
          <View style={styles.dailySkillHeader}>
            <Ionicons name="bulb-outline" size={24} color={colors.warning} />
            <Text style={styles.dailySkillLabel}>Today's Skill</Text>
          </View>
          <Text style={styles.dailySkillName}>{todaySkill}</Text>
          <Text style={styles.dailySkillDescription}>
            When you feel an urge to act on an emotion, do the opposite of what the emotion tells you to do.
          </Text>
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => navigation.navigate('SkillDetail', { skillId: 'opposite-action' })}
          >
            <Text style={styles.learnMoreText}>Learn More</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Journal')}
            >
              <Ionicons name="journal-outline" size={28} color={colors.primary} />
              <Text style={styles.actionLabel}>Journal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('SkillsLibrary')}
            >
              <Ionicons name="library-outline" size={28} color={colors.secondary} />
              <Text style={styles.actionLabel}>Skills</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('FPBuffer')}
            >
              <Ionicons name="time-outline" size={28} color={colors.warning} />
              <Text style={styles.actionLabel}>Pause Before Sending</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('SafetyContract')}
            >
              <Ionicons name="document-text-outline" size={28} color={colors.cardTherapist} />
              <Text style={styles.actionLabel}>Safety Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Chat')}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color={colors.text} />
        <Text style={styles.fabLabel}>Talk to Anchor AI</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing.xxl * 3,
  },
  header: {
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.body,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
  },
  moodCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  moodQuestion: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  moodSliderContainer: {
    gap: spacing.sm,
  },
  moodLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodLabelText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  moodValue: {
    ...typography.h3,
    fontWeight: '700',
  },
  moodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  moodButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodButtonText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  moodButtonTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  dailySkillCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  dailySkillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dailySkillLabel: {
    ...typography.bodySmall,
    color: colors.warning,
    fontWeight: '600',
  },
  dailySkillName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  dailySkillDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  learnMoreText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  quickActions: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    left: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
});
