import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { agentService } from '../../services/agentService';

interface TherapistDataStreamScreenProps {
  navigation: any;
  route: any;
}

export const TherapistDataStreamScreen: React.FC<TherapistDataStreamScreenProps> = ({ navigation, route }) => {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const patientId = route?.params?.patientId || '1';

  const mockPatientData = {
    name: 'Patient A',
    moodLogs: [
      { date: 'Mon', level: 4, note: 'Difficult morning' },
      { date: 'Tue', level: 3, note: 'Urge to self-harm (Level 8)' },
      { date: 'Wed', level: 5, note: 'Used TIPP successfully' },
      { date: 'Thu', level: 6, note: 'Good therapy session' },
      { date: 'Fri', level: 5, note: 'Conflict with partner' },
    ],
    crisisEvents: [
      { date: 'Tuesday', distressLevel: 8, intervention: 'Cold Water', successful: true },
    ],
    skillsUsed: ['TIPP', 'Opposite Action', 'Check the Facts'],
    journalThemes: ['abandonment fears', 'relationship conflict', 'work stress'],
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const response = await agentService.getClinicalSummary(patientId, 'past_week');
      if (response.success && response.response) {
        setAiSummary(response.response);
      } else {
        setAiSummary(`Patient Status Summary: ${mockPatientData.name} reported elevated distress levels this week, peaking at Level 8 on Tuesday with urges to self-harm. The "Cold Water" intervention was successfully applied.

Risk Assessment: MODERATE - Recent self-harm urges require monitoring, though patient demonstrated effective skill usage.

Notable Patterns:
- Mood fluctuated between 3-6 this week
- Crisis event on Tuesday resolved with TIPP technique
- Recurring themes: abandonment fears, relationship conflict

Recommended Interventions:
- Review safety plan with patient
- Focus on interpersonal effectiveness skills
- Consider increasing session frequency temporarily

Urgent Flags: Monitor for escalation of self-harm urges.`);
      }
    } catch (error) {
      console.error('Summary generation error:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>{mockPatientData.name}</Text>
            <Text style={styles.subtitle}>Data Stream</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Clinical Summary</Text>
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={handleGenerateSummary}
              disabled={isGeneratingSummary}
            >
              {isGeneratingSummary ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={16} color={colors.primary} />
                  <Text style={styles.generateButtonText}>Generate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {aiSummary ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{aiSummary}</Text>
            </View>
          ) : (
            <View style={styles.summaryPlaceholder}>
              <Ionicons name="document-text-outline" size={32} color={colors.textMuted} />
              <Text style={styles.placeholderText}>
                Click "Generate" to create an AI-powered clinical summary
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Log (This Week)</Text>
          <View style={styles.moodLogCard}>
            {mockPatientData.moodLogs.map((log, index) => (
              <View key={index} style={styles.moodLogItem}>
                <Text style={styles.moodLogDay}>{log.date}</Text>
                <View style={styles.moodLogBar}>
                  <View 
                    style={[
                      styles.moodLogFill, 
                      { 
                        width: `${log.level * 10}%`,
                        backgroundColor: log.level <= 3 ? colors.statusRed : log.level <= 5 ? colors.statusYellow : colors.statusGreen
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.moodLogLevel}>{log.level}</Text>
                <Text style={styles.moodLogNote} numberOfLines={1}>{log.note}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crisis Events</Text>
          {mockPatientData.crisisEvents.map((event, index) => (
            <View key={index} style={styles.crisisCard}>
              <View style={styles.crisisHeader}>
                <Ionicons name="alert-circle" size={20} color={colors.crisis} />
                <Text style={styles.crisisDate}>{event.date}</Text>
                <View style={[styles.successBadge, { backgroundColor: event.successful ? colors.success + '20' : colors.crisis + '20' }]}>
                  <Text style={[styles.successBadgeText, { color: event.successful ? colors.success : colors.crisis }]}>
                    {event.successful ? 'Resolved' : 'Ongoing'}
                  </Text>
                </View>
              </View>
              <Text style={styles.crisisDetail}>
                Distress Level: {event.distressLevel}/10 • Intervention: {event.intervention}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills Used</Text>
          <View style={styles.skillsRow}>
            {mockPatientData.skillsUsed.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.skillChipText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journal Themes</Text>
          <View style={styles.themesRow}>
            {mockPatientData.journalThemes.map((theme, index) => (
              <View key={index} style={styles.themeChip}>
                <Text style={styles.themeChipText}>{theme}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  generateButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  summaryText: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 22,
  },
  summaryPlaceholder: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  placeholderText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
  moodLogCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  moodLogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  moodLogDay: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 32,
  },
  moodLogBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    maxWidth: 80,
  },
  moodLogFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  moodLogLevel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    width: 20,
  },
  moodLogNote: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  crisisCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.crisis,
  },
  crisisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  crisisDate: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  successBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  successBadgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  crisisDetail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  skillChipText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  themeChip: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  themeChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
