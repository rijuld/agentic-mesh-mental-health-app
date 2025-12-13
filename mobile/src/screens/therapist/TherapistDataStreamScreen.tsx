import React, { useState, useEffect } from 'react';
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
import { useStore } from '../../store/useStore';
import { databaseService } from '../../services/databaseService';
import { MoodLog } from '../../types';

interface TherapistDataStreamScreenProps {
  navigation: any;
  route: any;
}

export const TherapistDataStreamScreen: React.FC<TherapistDataStreamScreenProps> = ({ navigation, route }) => {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { linkedAccounts } = useStore();
  
  const patientId = route?.params?.patientId;
  const patientIndex = linkedAccounts.filter(a => a.role === 'patient').findIndex(a => a.id === patientId);
  const patientName = patientId ? `Patient ${patientIndex + 1}` : 'Patient';

  useEffect(() => {
    const loadPatientData = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }
      try {
        const logs = await databaseService.getMoodLogs(patientId, 7);
        setMoodLogs(logs);
      } catch (error) {
        console.error('Error loading patient data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPatientData();
  }, [patientId]);

  const getDayName = (timestamp: string) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(timestamp).getDay()];
  };

  const handleGenerateSummary = async () => {
    if (!patientId) return;
    setIsGeneratingSummary(true);
    try {
      const response = await agentService.getClinicalSummary(patientId, 'past_week');
      if (response.success && response.response) {
        setAiSummary(response.response);
      } else {
        // Generate summary based on actual mood logs if available
        if (moodLogs.length > 0) {
          const avgMood = moodLogs.reduce((sum, log) => sum + log.level, 0) / moodLogs.length;
          const minMood = Math.min(...moodLogs.map(l => l.level));
          const maxMood = Math.max(...moodLogs.map(l => l.level));
          setAiSummary(`Patient Status Summary: ${patientName}\n\nMood Range: ${minMood}-${maxMood}/10 (Average: ${avgMood.toFixed(1)})\n\nRecent mood logs show ${moodLogs.length} entries this week.\n\nClick Generate again after more data is available for a detailed AI analysis.`);
        } else {
          setAiSummary('No mood data available yet. The patient has not logged any moods.');
        }
      }
    } catch (error) {
      console.error('Summary generation error:', error);
      setAiSummary('Unable to generate summary. Please try again later.');
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
            <Text style={styles.title}>{patientName}</Text>
            <Text style={styles.subtitle}>Data Stream</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading patient data...</Text>
          </View>
        ) : !patientId ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>No Patient Selected</Text>
            <Text style={styles.emptyStateText}>Select a patient from your caseload to view their data.</Text>
          </View>
        ) : (
          <>

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
          {moodLogs.length > 0 ? (
            <View style={styles.moodLogCard}>
              {moodLogs.map((log, index) => (
                <View key={log.id || index} style={styles.moodLogItem}>
                  <Text style={styles.moodLogDay}>{getDayName(log.timestamp)}</Text>
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
                  <Text style={styles.moodLogNote} numberOfLines={1}>{log.note || '-'}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noDataCard}>
              <Ionicons name="analytics-outline" size={24} color={colors.textMuted} />
              <Text style={styles.noDataText}>No mood logs recorded yet</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Notes</Text>
          <View style={styles.noDataCard}>
            <Ionicons name="document-text-outline" size={24} color={colors.textMuted} />
            <Text style={styles.noDataText}>Notes will appear here as data is collected</Text>
          </View>
        </View>
          </>
        )}
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  noDataCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  noDataText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
