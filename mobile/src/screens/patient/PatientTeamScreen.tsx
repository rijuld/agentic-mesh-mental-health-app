import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { CrisisButton } from '../../components/CrisisButton';
import { databaseService } from '../../services/databaseService';
import { useFocusEffect } from '@react-navigation/native';

interface PatientTeamScreenProps {
  navigation: any;
}

export const PatientTeamScreen: React.FC<PatientTeamScreenProps> = ({ navigation }) => {
  const { shareSettings, updateShareSettings, user, logout, linkedAccounts, loadLinkedAccounts, connectionRequests, loadConnectionRequests, sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest } = useStore();
  const [therapists, setTherapists] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingSent, setPendingSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLinkedAccounts();
    loadConnectionRequests();
    loadTherapists();
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      loadLinkedAccounts();
      loadConnectionRequests();
      loadTherapists();
    }, [user?.id])
  );

  const loadTherapists = async () => {
    setIsLoading(true);
    try {
      const allTherapists = await databaseService.getAllUsersByRole('therapist');
      setTherapists(allTherapists);
    } catch (error) {
      console.error('Error loading therapists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => logout()
        },
      ]
    );
  };

  const handleSendRequest = async (therapistId: string) => {
    const success = await sendConnectionRequest(therapistId, 'therapist');
    if (success) {
      setPendingSent(prev => new Set(prev).add(therapistId));
      Alert.alert('Request Sent', 'Your connection request has been sent!');
    } else {
      Alert.alert('Error', 'Failed to send request. Please try again.');
    }
  };

  const handleAcceptRequest = async (requestId: string, fromUserId: string) => {
    await acceptConnectionRequest(requestId, fromUserId);
  };

  const handleRejectRequest = async (requestId: string) => {
    await rejectConnectionRequest(requestId);
  };

  const linkedAlly = linkedAccounts.find(acc => acc.role === 'ally');
  const linkedTherapist = linkedAccounts.find(acc => acc.role === 'therapist');
  const availableTherapists = therapists.filter(t => !linkedAccounts.some(la => la.id === t.id) && !pendingSent.has(t.id));

  return (
    <SafeAreaView style={styles.container}>
      <CrisisButton />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Team</Text>
          <Text style={styles.subtitle}>Connect with your support network</Text>
        </View>

        {connectionRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connection Requests</Text>
            {connectionRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={[styles.avatar, { backgroundColor: colors.cardTherapist }]}>
                  <Ionicons name="medical" size={24} color={colors.text} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>Therapist</Text>
                  <Text style={styles.contactStatus}>Wants to connect</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity 
                    style={styles.acceptButton}
                    onPress={() => handleAcceptRequest(request.id, request.fromUserId)}
                  >
                    <Ionicons name="checkmark" size={20} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => handleRejectRequest(request.id)}
                  >
                    <Ionicons name="close" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Care Team</Text>
          
          {linkedTherapist ? (
            <TouchableOpacity style={styles.contactCard}>
              <View style={[styles.avatar, { backgroundColor: colors.cardTherapist }]}>
                <Ionicons name="medical" size={24} color={colors.text} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>My Therapist</Text>
                <Text style={styles.contactStatus}>Connected</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyContactCard}>
              <Ionicons name="medical-outline" size={24} color={colors.textMuted} />
              <Text style={styles.emptyContactText}>No therapist connected yet</Text>
              <Text style={styles.emptyContactHint}>Find a therapist below</Text>
            </View>
          )}

          {linkedAlly ? (
            <TouchableOpacity 
              style={styles.contactCard}
              onPress={() => navigation.navigate('Chat')}
            >
              <View style={[styles.avatar, { backgroundColor: colors.cardAlly }]}>
                <Ionicons name="person" size={24} color={colors.text} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>My Ally</Text>
                <Text style={styles.contactStatus}>Connected</Text>
              </View>
              <TouchableOpacity style={styles.chatButton}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Find a Therapist</Text>
          <Text style={styles.sectionSubtitle}>Send a connection request to get started</Text>
          
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
          ) : availableTherapists.length > 0 ? (
            availableTherapists.map((therapist) => (
              <View key={therapist.id} style={styles.contactCard}>
                <View style={[styles.avatar, { backgroundColor: colors.cardTherapist }]}>
                  <Ionicons name="medical" size={24} color={colors.text} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{therapist.name}</Text>
                  <Text style={styles.contactStatus}>Therapist</Text>
                </View>
                <TouchableOpacity 
                  style={styles.connectButton}
                  onPress={() => handleSendRequest(therapist.id)}
                >
                  <Text style={styles.connectButtonText}>Connect</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyContactCard}>
              <Ionicons name="search-outline" size={24} color={colors.textMuted} />
              <Text style={styles.emptyContactText}>No therapists available</Text>
              <Text style={styles.emptyContactHint}>Check back later</Text>
            </View>
          )}
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
            <Text style={styles.contractButtonTitle}>Safety Plan</Text>
            <Text style={styles.contractButtonSubtitle}>View shared agreements</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.crisis} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
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
  qrContainer: {
    width: 140,
    height: 140,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  qrPlaceholder: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyContactCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    borderStyle: 'dashed',
  },
  emptyContactText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  emptyContactHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptButton: {
    backgroundColor: colors.success,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  rejectButton: {
    backgroundColor: colors.crisis,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  connectButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  connectButtonText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.crisis,
  },
  logoutButtonText: {
    ...typography.body,
    color: colors.crisis,
    fontWeight: '600',
  },
});
