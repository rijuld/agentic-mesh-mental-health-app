import React from 'react';
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

interface AllyDashboardScreenProps {
  navigation: any;
}

export const AllyDashboardScreen: React.FC<AllyDashboardScreenProps> = ({ navigation }) => {
  const { linkedPatientStatus } = useStore();

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'green': return colors.statusGreen;
      case 'yellow': return colors.statusYellow;
      case 'red': return colors.statusRed;
      default: return colors.textMuted;
    }
  };

  const getStatusLabel = (level: string) => {
    switch (level) {
      case 'green': return 'Stable';
      case 'yellow': return 'Struggling';
      case 'red': return 'Needs Support';
      default: return 'Unknown';
    }
  };

  const mockStatus = linkedPatientStatus || {
    level: 'yellow',
    label: 'Struggling',
    lastUpdated: '2 hours ago',
    moodTrend: [5, 4, 3, 4, 5, 4, 3],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Support Dashboard</Text>
          <Text style={styles.subtitle}>Monitor and support your loved one</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Patient Status</Text>
            <Text style={styles.statusTime}>Updated {mockStatus.lastUpdated}</Text>
          </View>
          
          <View style={styles.statusIndicator}>
            <View style={[styles.statusLight, { backgroundColor: getStatusColor(mockStatus.level) }]}>
              <View style={[styles.statusGlow, { backgroundColor: getStatusColor(mockStatus.level) }]} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusLevel, { color: getStatusColor(mockStatus.level) }]}>
                {getStatusLabel(mockStatus.level)}
              </Text>
              <Text style={styles.statusDescription}>
                {mockStatus.level === 'green' && 'They are doing well today'}
                {mockStatus.level === 'yellow' && 'They may need some support'}
                {mockStatus.level === 'red' && 'Consider reaching out'}
              </Text>
            </View>
          </View>

          <View style={styles.moodTrend}>
            <Text style={styles.moodTrendLabel}>7-Day Mood Trend</Text>
            <View style={styles.moodBars}>
              {mockStatus.moodTrend.map((value: number, index: number) => (
                <View key={index} style={styles.moodBarContainer}>
                  <View 
                    style={[
                      styles.moodBar, 
                      { 
                        height: `${value * 10}%`,
                        backgroundColor: value <= 3 ? colors.statusRed : value <= 5 ? colors.statusYellow : colors.statusGreen
                      }
                    ]} 
                  />
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.burnoutCard}>
          <View style={styles.burnoutHeader}>
            <Ionicons name="heart-outline" size={24} color={colors.warning} />
            <Text style={styles.burnoutTitle}>Your Wellbeing Check</Text>
          </View>
          <Text style={styles.burnoutMessage}>
            You've been very active today. Remember to take care of yourself too.
          </Text>
          <View style={styles.burnoutMeter}>
            <View style={styles.burnoutProgress}>
              <View style={[styles.burnoutFill, { width: '65%' }]} />
            </View>
            <Text style={styles.burnoutLabel}>Energy Level: Moderate</Text>
          </View>
          <TouchableOpacity style={styles.selfCareButton}>
            <Text style={styles.selfCareButtonText}>Self-Care Resources</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Translator')}
            >
              <Ionicons name="language-outline" size={28} color={colors.primary} />
              <Text style={styles.actionLabel}>Translator</Text>
              <Text style={styles.actionHint}>Decode messages</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Learn')}
            >
              <Ionicons name="book-outline" size={28} color={colors.secondary} />
              <Text style={styles.actionLabel}>Learn</Text>
              <Text style={styles.actionHint}>BPD education</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('SafetyContract')}
            >
              <Ionicons name="document-text-outline" size={28} color={colors.cardTherapist} />
              <Text style={styles.actionLabel}>Contract</Text>
              <Text style={styles.actionHint}>Safety plan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Chat')}
            >
              <Ionicons name="chatbubble-outline" size={28} color={colors.warning} />
              <Text style={styles.actionLabel}>Get Help</Text>
              <Text style={styles.actionHint}>AI support</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.emergencyCard}>
          <Ionicons name="call-outline" size={24} color={colors.crisis} />
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
            <Text style={styles.emergencySubtitle}>Quick access to crisis resources</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
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
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusTitle: {
    ...typography.h3,
    color: colors.text,
  },
  statusTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusLight: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statusGlow: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    opacity: 0.5,
  },
  statusInfo: {
    flex: 1,
  },
  statusLevel: {
    ...typography.h3,
    fontWeight: '700',
  },
  statusDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  moodTrend: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    paddingTop: spacing.md,
  },
  moodTrendLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  moodBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 60,
    alignItems: 'flex-end',
  },
  moodBarContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  moodBar: {
    width: '80%',
    borderRadius: borderRadius.sm,
    minHeight: 4,
  },
  burnoutCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  burnoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  burnoutTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  burnoutMessage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  burnoutMeter: {
    marginBottom: spacing.md,
  },
  burnoutProgress: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  burnoutFill: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: borderRadius.full,
  },
  burnoutLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  selfCareButton: {
    alignSelf: 'flex-start',
  },
  selfCareButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  quickActions: {
    marginBottom: spacing.lg,
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
    gap: spacing.xs,
  },
  actionLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  actionHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.crisis,
  },
  emergencyContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  emergencyTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  emergencySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
