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

interface SafetyContractScreenProps {
  navigation: any;
}

export const SafetyContractScreen: React.FC<SafetyContractScreenProps> = ({ navigation }) => {
  const { user, safetyContract } = useStore();

  const contract = safetyContract;

  const getPartyColor = (party: string) => {
    switch (party) {
      case 'patient': return colors.cardPatient;
      case 'ally': return colors.cardAlly;
      case 'therapist': return colors.cardTherapist;
      default: return colors.textMuted;
    }
  };

  const getPartyLabel = (party: string) => {
    switch (party) {
      case 'patient': return 'Patient';
      case 'ally': return 'Ally';
      case 'therapist': return 'Therapist';
      default: return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="document-text" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Safety Plan</Text>
          <Text style={styles.subtitle}>
            A shared agreement between all parties in the recovery journey
          </Text>
        </View>

        {contract ? (
          <>
            <View style={styles.signaturesCard}>
              <Text style={styles.signaturesTitle}>Signatures</Text>
              <View style={styles.signaturesRow}>
                <View style={styles.signatureItem}>
                  <View style={[styles.signatureIcon, { backgroundColor: colors.cardPatient }]}>
                    {contract.signedByPatient ? (
                      <Ionicons name="checkmark" size={16} color={colors.text} />
                    ) : (
                      <Ionicons name="time-outline" size={16} color={colors.text} />
                    )}
                  </View>
                  <Text style={styles.signatureLabel}>Patient</Text>
                </View>
                
                <View style={styles.signatureItem}>
                  <View style={[styles.signatureIcon, { backgroundColor: colors.cardAlly }]}>
                    {contract.signedByAlly ? (
                      <Ionicons name="checkmark" size={16} color={colors.text} />
                    ) : (
                      <Ionicons name="time-outline" size={16} color={colors.text} />
                    )}
                  </View>
                  <Text style={styles.signatureLabel}>Ally</Text>
                </View>
                
                <View style={styles.signatureItem}>
                  <View style={[styles.signatureIcon, { backgroundColor: colors.cardTherapist }]}>
                    {contract.signedByTherapist ? (
                      <Ionicons name="checkmark" size={16} color={colors.text} />
                    ) : (
                      <Ionicons name="time-outline" size={16} color={colors.text} />
                    )}
                  </View>
                  <Text style={styles.signatureLabel}>Therapist</Text>
                </View>
              </View>
              <Text style={styles.lastUpdated}>Last updated: {contract.lastUpdated}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Agreement Terms</Text>
              
              {contract.terms.map((term, index) => (
                <View key={term.id} style={styles.termCard}>
                  <View style={styles.termHeader}>
                    <View style={styles.termNumber}>
                      <Text style={styles.termNumberText}>{index + 1}</Text>
                    </View>
                    <View style={[styles.partyBadge, { backgroundColor: getPartyColor(term.responsibleParty) + '20' }]}>
                      <Text style={[styles.partyBadgeText, { color: getPartyColor(term.responsibleParty) }]}>
                        {getPartyLabel(term.responsibleParty)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.termContent}>
                    <Text style={styles.termCondition}>
                      <Text style={styles.termLabel}>IF: </Text>
                      {term.condition}
                    </Text>
                    <Text style={styles.termAction}>
                      <Text style={styles.termLabel}>THEN: </Text>
                      {term.action}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Editing the Plan</Text>
                <Text style={styles.infoText}>
                  This plan can only be modified when all three parties agree. 
                  Changes require biometric authentication from each party.
                </Text>
              </View>
            </View>

            {user?.role === 'patient' && (
              <TouchableOpacity style={styles.requestEditButton}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
                <Text style={styles.requestEditText}>Request Plan Edit</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>No Safety Plan Yet</Text>
            <Text style={styles.emptyStateText}>
              A safety plan helps coordinate care between you, your ally, and your therapist. 
              Work with your care team to create one.
            </Text>
            {user?.role === 'patient' && (
              <TouchableOpacity style={styles.createButton}>
                <Ionicons name="add-circle-outline" size={20} color={colors.text} />
                <Text style={styles.createButtonText}>Create Safety Plan</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
          
          <View style={styles.emergencyCard}>
            <Ionicons name="call" size={20} color={colors.crisis} />
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyName}>988 Suicide & Crisis Lifeline</Text>
              <Text style={styles.emergencyNumber}>Call or text 988</Text>
            </View>
          </View>
          
          <View style={styles.emergencyCard}>
            <Ionicons name="call" size={20} color={colors.warning} />
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyName}>Crisis Text Line</Text>
              <Text style={styles.emergencyNumber}>Text HOME to 741741</Text>
            </View>
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
    alignItems: 'center',
    paddingTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  signaturesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  signaturesTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  signaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  signatureItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  signatureIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  lastUpdated: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  termCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  termNumber: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termNumberText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  partyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  partyBadgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  termContent: {
    gap: spacing.xs,
  },
  termCondition: {
    ...typography.bodySmall,
    color: colors.text,
  },
  termAction: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  termLabel: {
    fontWeight: '700',
    color: colors.primary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  requestEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  requestEditText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  emergencySection: {
    marginBottom: spacing.xxl,
  },
  emergencyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  emergencyNumber: {
    ...typography.bodySmall,
    color: colors.textSecondary,
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  createButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
});
