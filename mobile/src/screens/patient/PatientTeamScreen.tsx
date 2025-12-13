import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { CrisisButton } from '../../components/CrisisButton';

interface PatientTeamScreenProps {
  navigation: any;
}

export const PatientTeamScreen: React.FC<PatientTeamScreenProps> = ({ navigation }) => {
  const { shareSettings, updateShareSettings, user } = useStore();

  return (
    <SafeAreaView style={styles.container}>
      <CrisisButton />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Team</Text>
          <Text style={styles.subtitle}>Connect with your support network</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Anchor Code</Text>
          <View style={styles.anchorCodeCard}>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={80} color={colors.primary} />
            </View>
            <Text style={styles.anchorCode}>{user?.anchorCode || 'ABC-123-XYZ'}</Text>
            <Text style={styles.anchorCodeHint}>
              Share this code with your Ally or Therapist to connect
            </Text>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color={colors.text} />
              <Text style={styles.shareButtonText}>Share Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected</Text>
          
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => navigation.navigate('AllyChat')}
          >
            <View style={[styles.avatar, { backgroundColor: colors.cardAlly }]}>
              <Ionicons name="person" size={24} color={colors.text} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>My Ally</Text>
              <Text style={styles.contactStatus}>Connected • Last active 2h ago</Text>
            </View>
            <TouchableOpacity style={styles.chatButton}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard}>
            <View style={[styles.avatar, { backgroundColor: colors.cardTherapist }]}>
              <Ionicons name="medical" size={24} color={colors.text} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Dr. Smith</Text>
              <Text style={styles.contactStatus}>Therapist • Next session: Mon 3pm</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Settings</Text>
          <Text style={styles.sectionSubtitle}>Control what your therapist can see</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="analytics-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>Share Mood Graph</Text>
              </View>
              <Switch
                value={shareSettings.shareMoodGraph}
                onValueChange={(value) => updateShareSettings({ shareMoodGraph: value })}
                trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="journal-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>Share Journal Entries</Text>
              </View>
              <Switch
                value={shareSettings.shareJournalEntries}
                onValueChange={(value) => updateShareSettings({ shareJournalEntries: value })}
                trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="alert-circle-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>Share Crisis Events</Text>
              </View>
              <Switch
                value={shareSettings.shareCrisisEvents}
                onValueChange={(value) => updateShareSettings({ shareCrisisEvents: value })}
                trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="fitness-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.settingLabel}>Share Skill Usage</Text>
              </View>
              <Switch
                value={shareSettings.shareSkillUsage}
                onValueChange={(value) => updateShareSettings({ shareSkillUsage: value })}
                trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.contractButton}
          onPress={() => navigation.navigate('SafetyContract')}
        >
          <Ionicons name="document-text-outline" size={24} color={colors.text} />
          <View style={styles.contractButtonContent}>
            <Text style={styles.contractButtonTitle}>Safety Contract</Text>
            <Text style={styles.contractButtonSubtitle}>View shared agreements</Text>
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  anchorCodeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  anchorCode: {
    ...typography.h3,
    color: colors.primary,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  anchorCodeHint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  shareButtonText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  contactStatus: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chatButton: {
    padding: spacing.sm,
  },
  verifiedBadge: {
    padding: spacing.sm,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text,
  },
  contractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  contractButtonContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  contractButtonTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  contractButtonSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
