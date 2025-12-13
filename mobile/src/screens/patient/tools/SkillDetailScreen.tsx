import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface SkillData {
    id: string;
    name: string;
    category: string;
    categoryColor: string;
    description: string;
    steps: { letter: string; title: string; description: string }[];
    whenToUse: string[];
    tips: string[];
}

const SKILL_DATA: Record<string, SkillData> = {
    'stop': {
        id: 'stop',
        name: 'STOP',
        category: 'Distress Tolerance',
        categoryColor: colors.crisis,
        description: 'STOP is a crisis survival skill that helps you pause before reacting impulsively to intense emotions.',
        steps: [
            { letter: 'S', title: 'Stop', description: 'Freeze! Do not move a muscle. Do not react.' },
            { letter: 'T', title: 'Take a step back', description: 'Remove yourself from the situation mentally or physically. Take a breath.' },
            { letter: 'O', title: 'Observe', description: 'Notice what is happening inside and outside of you. What are you feeling? What is the situation?' },
            { letter: 'P', title: 'Proceed mindfully', description: 'Act with awareness. Consider your goals and what will make the situation better or worse.' },
        ],
        whenToUse: [
            'When you feel an urge to react impulsively',
            'When emotions are running high',
            'Before sending an angry message',
            'When you feel overwhelmed',
        ],
        tips: [
            'Practice this skill when calm so it becomes automatic',
            'Put a physical reminder (like a red dot) on your phone',
            'Pair with deep breathing for better results',
        ],
    },
    'tipp': {
        id: 'tipp',
        name: 'TIPP',
        category: 'Distress Tolerance',
        categoryColor: colors.crisis,
        description: 'TIPP is a set of techniques to quickly change your body chemistry and reduce extreme emotional arousal.',
        steps: [
            { letter: 'T', title: 'Temperature', description: 'Hold ice cubes, splash cold water on your face, or take a cold shower. Cold activates the dive reflex and slows your heart rate.' },
            { letter: 'I', title: 'Intense Exercise', description: 'Do jumping jacks, run in place, or any vigorous exercise for 10-20 minutes to release built-up energy.' },
            { letter: 'P', title: 'Paced Breathing', description: 'Breathe deeply and slowly. Exhale longer than you inhale (e.g., 4 counts in, 6 counts out).' },
            { letter: 'P', title: 'Progressive Relaxation', description: 'Tense and release each muscle group, starting from your toes and moving up to your head.' },
        ],
        whenToUse: [
            'During a panic attack',
            'When experiencing intense anger',
            'When you need to calm down quickly',
            'Before a difficult conversation',
        ],
        tips: [
            'Keep ice cubes or a cold pack accessible',
            'The temperature technique works fastest',
            'Combine techniques for maximum effect',
        ],
    },
    'opposite-action': {
        id: 'opposite-action',
        name: 'Opposite Action',
        category: 'Emotion Regulation',
        categoryColor: colors.warning,
        description: 'When an emotion is not justified by the facts, or when acting on the emotion is not effective, act opposite to the urge.',
        steps: [
            { letter: '1', title: 'Identify the emotion', description: 'Name what you are feeling (fear, anger, sadness, shame, etc.).' },
            { letter: '2', title: 'Check the facts', description: 'Is this emotion justified by the situation? Does it fit the facts?' },
            { letter: '3', title: 'Identify the action urge', description: 'What does this emotion make you want to do?' },
            { letter: '4', title: 'Do the opposite', description: 'Act opposite to the urge, all the way. If fear says avoid, approach. If anger says attack, be gentle.' },
        ],
        whenToUse: [
            'When fear makes you want to avoid something safe',
            'When anger makes you want to attack',
            'When sadness makes you want to isolate',
            'When shame makes you want to hide',
        ],
        tips: [
            'Do the opposite action ALL THE WAY',
            'Repeat until the emotion changes',
            'This works best when the emotion is not justified',
        ],
    },
    'dear-man': {
        id: 'dear-man',
        name: 'DEAR MAN',
        category: 'Interpersonal Effectiveness',
        categoryColor: colors.success,
        description: 'DEAR MAN is a skill for asking for what you want or saying no while maintaining self-respect and relationships.',
        steps: [
            { letter: 'D', title: 'Describe', description: 'Describe the situation using facts only. No judgments or opinions.' },
            { letter: 'E', title: 'Express', description: 'Express your feelings and opinions about the situation using "I" statements.' },
            { letter: 'A', title: 'Assert', description: 'Assert yourself by asking for what you want or saying no clearly.' },
            { letter: 'R', title: 'Reinforce', description: 'Reinforce by explaining the positive effects of getting what you want.' },
            { letter: 'M', title: 'Mindful', description: 'Stay mindful of your goals. Do not get distracted by other issues.' },
            { letter: 'A', title: 'Appear confident', description: 'Use a confident tone and body language, even if you do not feel it.' },
            { letter: 'N', title: 'Negotiate', description: 'Be willing to give to get. Offer alternative solutions.' },
        ],
        whenToUse: [
            'When asking for something you need',
            'When setting a boundary',
            'When saying no to a request',
            'During difficult conversations',
        ],
        tips: [
            'Write out your DEAR MAN script beforehand',
            'Practice with less important situations first',
            'Stay focused on your objective',
        ],
    },
    'wise-mind': {
        id: 'wise-mind',
        name: 'Wise Mind',
        category: 'Mindfulness',
        categoryColor: colors.secondary,
        description: 'Wise Mind is the synthesis of Emotion Mind and Reasonable Mind—the place where you know something to be true.',
        steps: [
            { letter: '1', title: 'Notice your state', description: 'Are you in Emotion Mind (ruled by feelings) or Reasonable Mind (ruled by logic)?' },
            { letter: '2', title: 'Find the center', description: 'Wise Mind is the overlap—where emotion and reason meet.' },
            { letter: '3', title: 'Access intuition', description: 'Ask yourself: What does my wise mind say? What do I know to be true?' },
            { letter: '4', title: 'Practice regularly', description: 'Use meditation, breathing, or visualization to access Wise Mind.' },
        ],
        whenToUse: [
            'When making important decisions',
            'When emotions are overwhelming logic',
            'When logic is ignoring important feelings',
            'When you feel stuck between two options',
        ],
        tips: [
            'Imagine Wise Mind as a deep well of wisdom within you',
            'Practice accessing Wise Mind when calm',
            'Trust the quiet knowing that comes from Wise Mind',
        ],
    },
};

const DEFAULT_SKILL: SkillData = {
    id: 'default',
    name: 'DBT Skill',
    category: 'General',
    categoryColor: colors.primary,
    description: 'This skill helps you manage difficult emotions and situations.',
    steps: [
        { letter: '1', title: 'Recognize', description: 'Notice when you need to use this skill.' },
        { letter: '2', title: 'Apply', description: 'Use the technique as practiced.' },
        { letter: '3', title: 'Reflect', description: 'Notice how it affected your emotions.' },
    ],
    whenToUse: ['When experiencing difficult emotions', 'When you need to regulate'],
    tips: ['Practice regularly', 'Be patient with yourself'],
};

export const SkillDetailScreen = ({ route, navigation }: any) => {
    const { skillId } = route.params || {};
    const skill = SKILL_DATA[skillId] || DEFAULT_SKILL;
    const [practiceStarted, setPracticeStarted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const handlePractice = () => {
        setPracticeStarted(true);
        setCurrentStep(0);
    };

    const handleNextStep = () => {
        if (currentStep < skill.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            Alert.alert('Great job!', 'You completed the skill practice.', [
                { text: 'Done', onPress: () => setPracticeStarted(false) },
            ]);
        }
    };

    if (practiceStarted) {
        const step = skill.steps[currentStep];
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.practiceHeader}>
                    <TouchableOpacity onPress={() => setPracticeStarted(false)}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.practiceProgress}>
                        Step {currentStep + 1} of {skill.steps.length}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.practiceContent}>
                    <View style={[styles.stepCircle, { backgroundColor: skill.categoryColor }]}>
                        <Text style={styles.stepCircleText}>{step.letter}</Text>
                    </View>
                    <Text style={styles.practiceStepTitle}>{step.title}</Text>
                    <Text style={styles.practiceStepDescription}>{step.description}</Text>
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
                    <Text style={styles.nextButtonText}>
                        {currentStep < skill.steps.length - 1 ? 'Next Step' : 'Complete'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.text} />
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>{skill.name}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.categoryBadge, { backgroundColor: skill.categoryColor + '20' }]}>
                    <Text style={[styles.categoryText, { color: skill.categoryColor }]}>
                        {skill.category}
                    </Text>
                </View>

                <Text style={styles.description}>{skill.description}</Text>

                <Text style={styles.sectionTitle}>Steps</Text>
                {skill.steps.map((step, index) => (
                    <View key={index} style={styles.stepCard}>
                        <View style={[styles.stepBadge, { backgroundColor: skill.categoryColor }]}>
                            <Text style={styles.stepBadgeText}>{step.letter}</Text>
                        </View>
                        <View style={styles.stepInfo}>
                            <Text style={styles.stepTitle}>{step.title}</Text>
                            <Text style={styles.stepDescription}>{step.description}</Text>
                        </View>
                    </View>
                ))}

                <Text style={styles.sectionTitle}>When to Use</Text>
                {skill.whenToUse.map((item, index) => (
                    <View key={index} style={styles.listItem}>
                        <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                        <Text style={styles.listItemText}>{item}</Text>
                    </View>
                ))}

                <Text style={styles.sectionTitle}>Tips</Text>
                {skill.tips.map((tip, index) => (
                    <View key={index} style={styles.listItem}>
                        <Ionicons name="bulb" size={18} color={colors.warning} />
                        <Text style={styles.listItemText}>{tip}</Text>
                    </View>
                ))}

                <View style={{ height: spacing.xxl * 2 }} />
            </ScrollView>

            <TouchableOpacity style={styles.practiceButton} onPress={handlePractice}>
                <Ionicons name="play" size={20} color={colors.text} />
                <Text style={styles.practiceButtonText}>Practice This Skill</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight,
    },
    backButton: {
        padding: spacing.xs,
    },
    title: {
        ...typography.h3,
        color: colors.text,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginBottom: spacing.md,
    },
    categoryText: {
        ...typography.caption,
        fontWeight: '600',
    },
    description: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.md,
        marginTop: spacing.md,
    },
    stepCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    stepBadge: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepBadgeText: {
        ...typography.body,
        color: colors.text,
        fontWeight: '700',
    },
    stepInfo: {
        flex: 1,
    },
    stepTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    stepDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    listItemText: {
        ...typography.body,
        color: colors.text,
        flex: 1,
    },
    practiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        margin: spacing.lg,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    practiceButtonText: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
    },
    practiceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
    },
    practiceProgress: {
        ...typography.body,
        color: colors.textSecondary,
    },
    practiceContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    stepCircle: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    stepCircleText: {
        ...typography.h1,
        color: colors.text,
    },
    practiceStepTitle: {
        ...typography.h2,
        color: colors.text,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    practiceStepDescription: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: spacing.lg,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        margin: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
    },
    nextButtonText: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
    },
});
