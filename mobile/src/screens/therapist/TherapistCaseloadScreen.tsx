import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { databaseService } from '../../services/databaseService';
import { useFocusEffect } from '@react-navigation/native';

interface Patient {
  id: string;
  name: string;
  riskLevel: 'low' | 'moderate' | 'high';
  lastActivity: string;
  recentMood: number;
  alerts: number;
}

interface TherapistCaseloadScreenProps {
  navigation: any;
}

export const TherapistCaseloadScreen: React.FC<TherapistCaseloadScreenProps> = ({ navigation }) => {
  const { user, logout, linkedAccounts, loadLinkedAccounts, connectionRequests, loadConnectionRequests, sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest } = useStore();
  const [allPatients, setAllPatients] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingSent, setPendingSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLinkedAccounts();
    loadConnectionRequests();
    loadAllPatients();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadLinkedAccounts();
      loadConnectionRequests();
      loadAllPatients();
    }, [])
  );

  const loadAllPatients = async () => {
    setIsLoading(true);
    try {
      const patients = await databaseService.getAllUsersByRole('patient');
      setAllPatients(patients);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (patientId: string) => {
    const success = await sendConnectionRequest(patientId, 'patient');
    if (success) {
      setPendingSent(prev => new Set(prev).add(patientId));
      Alert.alert('Request Sent', 'Connection request sent to patient!');
    } else {
      Alert.alert('Error', 'Failed to send request.');
    }
  };

  const handleAcceptRequest = async (requestId: string, fromUserId: string) => {
    await acceptConnectionRequest(requestId, fromUserId);
  };

  const handleRejectRequest = async (requestId: string) => {
    await rejectConnectionRequest(requestId);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  // Convert linked accounts to patient list format
  const patients: Patient[] = linkedAccounts
    .filter(acc => acc.role === 'patient')
    .map((acc, index) => ({
      id: acc.id,
      name: `Patient ${index + 1}`,
      riskLevel: 'low' as const,
      lastActivity: 'Recently',
      recentMood: 5,
      alerts: 0,
    }));

  const sortedPatients = [...patients].sort((a, b) => {
    const riskOrder = { high: 0, moderate: 1, low: 2 };
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return colors.statusRed;
      case 'moderate': return colors.statusYellow;
      case 'low': return colors.statusGreen;
      default: return colors.textMuted;
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'high': return 'High Risk';
      case 'moderate': return 'Moderate';
      case 'low': return 'Stable';
      default: return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Caseload</Text>
          <Text style={styles.subtitle}>{patients.length} active patient{patients.length !== 1 ? 's' : ''}</Text>
        </View>

        {connectionRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connection Requests</Text>
            {connectionRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={[styles.avatar, { backgroundColor: colors.cardPatient }]}>
                  <Ionicons name="person" size={24} color={colors.text} />
                </View>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>Patient</Text>
                  <Text style={styles.patientMeta}>Wants to connect</Text>
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

        {patients.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>No patients yet</Text>
            <Text style={styles.emptyStateText}>
              Search for patients below to send connection requests.
            </Text>
          </View>
        ) : (
          <>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: colors.statusRed }]}>
            <Text style={styles.statNumber}>
              {patients.filter(p => p.riskLevel === 'high').length}
            </Text>
            <Text style={styles.statLabel}>High Risk</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: colors.statusYellow }]}>
            <Text style={styles.statNumber}>
              {patients.filter(p => p.riskLevel === 'moderate').length}
            </Text>
            <Text style={styles.statLabel}>Moderate</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: colors.statusGreen }]}>
            <Text style={styles.statNumber}>
              {patients.filter(p => p.riskLevel === 'low').length}
            </Text>
            <Text style={styles.statLabel}>Stable</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Patients</Text>
            <Text style={styles.sortLabel}>Sorted by risk level</Text>
          </View>

          {sortedPatients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={styles.patientCard}
              onPress={() => navigation.navigate('PatientDetail', { patientId: patient.id })}
            >
              <View style={styles.patientMain}>
                <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(patient.riskLevel) }]} />
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <Text style={styles.patientMeta}>
                    Last active: {patient.lastActivity} • Mood: {patient.recentMood}/10
                  </Text>
                </View>
              </View>
              
              <View style={styles.patientRight}>
                <View style={[styles.riskBadge, { backgroundColor: getRiskColor(patient.riskLevel) + '20' }]}>
                  <Text style={[styles.riskBadgeText, { color: getRiskColor(patient.riskLevel) }]}>
                    {getRiskLabel(patient.riskLevel)}
                  </Text>
                </View>
                {patient.alerts > 0 && (
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertBadgeText}>{patient.alerts}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

          </>
        )}

        {patients.length > 0 && (
          <TouchableOpacity 
            style={styles.addPatientButton}
            onPress={() => navigation.navigate('LinkPatient')}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.addPatientText}>Link New Patient</Text>
          </TouchableOpacity>
        )}

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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
  },
  statNumber: {
    ...typography.h2,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
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
    marginBottom: spacing.md,
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
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
  sortLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  patientMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  riskIndicator: {
    width: 8,
    height: 40,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  patientMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  patientRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  riskBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  riskBadgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  alertBadge: {
    backgroundColor: colors.crisis,
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadgeText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    fontSize: 10,
  },
  addPatientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addPatientText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
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
    marginBottom: spacing.xl,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  linkButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
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
