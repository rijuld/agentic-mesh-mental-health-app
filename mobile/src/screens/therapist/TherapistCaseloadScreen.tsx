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
  const patients: Patient[] = [
    { id: '1', name: 'Patient A', riskLevel: 'high', lastActivity: '2h ago', recentMood: 3, alerts: 2 },
    { id: '2', name: 'Patient B', riskLevel: 'moderate', lastActivity: '5h ago', recentMood: 5, alerts: 1 },
    { id: '3', name: 'Patient C', riskLevel: 'low', lastActivity: '1d ago', recentMood: 7, alerts: 0 },
    { id: '4', name: 'Patient D', riskLevel: 'low', lastActivity: '3h ago', recentMood: 6, alerts: 0 },
  ];

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
          <Text style={styles.subtitle}>{patients.length} active patients</Text>
        </View>

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

        <TouchableOpacity 
          style={styles.addPatientButton}
          onPress={() => navigation.navigate('LinkPatient')}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.addPatientText}>Link New Patient</Text>
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
});
