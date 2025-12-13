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
import { CrisisButton } from '../../components/CrisisButton';

interface ToolCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon, color, onPress }) => (
  <TouchableOpacity style={styles.toolCard} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.toolIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color={colors.text} />
    </View>
    <View style={styles.toolContent}>
      <Text style={styles.toolTitle}>{title}</Text>
      <Text style={styles.toolDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
  </TouchableOpacity>
);

interface PatientToolsScreenProps {
  navigation: any;
}

export const PatientToolsScreen: React.FC<PatientToolsScreenProps> = ({ navigation }) => {
  const skills = [
    { id: 'stop', name: 'STOP', category: 'Distress Tolerance' },
    { id: 'tipp', name: 'TIPP', category: 'Distress Tolerance' },
    { id: 'dear-man', name: 'DEAR MAN', category: 'Interpersonal Effectiveness' },
    { id: 'opposite-action', name: 'Opposite Action', category: 'Emotion Regulation' },
    { id: 'check-facts', name: 'Check the Facts', category: 'Emotion Regulation' },
    { id: 'wise-mind', name: 'Wise Mind', category: 'Mindfulness' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <CrisisButton />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Toolbox</Text>
          <Text style={styles.subtitle}>Your calming tools and support</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tools</Text>
          
          <ToolCard
            title="Skills Library"
            description="Explore coping skills and quick guides"
            icon="library-outline"
            color={colors.primary}
            onPress={() => navigation.navigate('SkillsLibrary')}
          />

          <ToolCard
            title="Pause Before Sending"
            description="Give yourself time before sending an emotional message"
            icon="time-outline"
            color={colors.warning}
            onPress={() => navigation.navigate('FPBuffer')}
          />

          <ToolCard
            title="Mentalization Mirror"
            description="De-bias and understand messages from others"
            icon="glasses-outline"
            color={colors.secondary}
            onPress={() => navigation.navigate('MentalizationMirror')}
          />

          <ToolCard
            title="Journal"
            description="Track your thoughts and emotions"
            icon="journal-outline"
            color={colors.cardTherapist}
            onPress={() => navigation.navigate('Journal')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Skills</Text>
          <View style={styles.skillsGrid}>
            {skills.map((skill) => (
              <TouchableOpacity
                key={skill.id}
                style={styles.skillChip}
                onPress={() => navigation.navigate('SkillDetail', { skillId: skill.id })}
              >
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillCategory}>{skill.category}</Text>
              </TouchableOpacity>
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
    marginBottom: spacing.md,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  toolDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: '30%',
  },
  skillName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  skillCategory: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
