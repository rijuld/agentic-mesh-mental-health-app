import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface DBTSkill {
    id: string;
    name: string;
    category: 'distress_tolerance' | 'emotion_regulation' | 'interpersonal_effectiveness' | 'mindfulness';
    shortDescription: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORIES = [
    { id: 'all', label: 'All Skills', color: colors.primary },
    { id: 'distress_tolerance', label: 'Distress Tolerance', color: colors.crisis },
    { id: 'emotion_regulation', label: 'Emotion Regulation', color: colors.warning },
    { id: 'interpersonal_effectiveness', label: 'Interpersonal', color: colors.success },
    { id: 'mindfulness', label: 'Mindfulness', color: colors.secondary },
];

const DBT_SKILLS: DBTSkill[] = [
    {
        id: 'stop',
        name: 'STOP',
        category: 'distress_tolerance',
        shortDescription: 'Stop, Take a step back, Observe, Proceed mindfully',
        icon: 'hand-left-outline',
    },
    {
        id: 'tipp',
        name: 'TIPP',
        category: 'distress_tolerance',
        shortDescription: 'Temperature, Intense exercise, Paced breathing, Progressive relaxation',
        icon: 'snow-outline',
    },
    {
        id: 'accepts',
        name: 'ACCEPTS',
        category: 'distress_tolerance',
        shortDescription: 'Activities, Contributing, Comparisons, Emotions, Push away, Thoughts, Sensations',
        icon: 'shield-checkmark-outline',
    },
    {
        id: 'improve',
        name: 'IMPROVE the Moment',
        category: 'distress_tolerance',
        shortDescription: 'Imagery, Meaning, Prayer, Relaxation, One thing, Vacation, Encouragement',
        icon: 'sunny-outline',
    },
    {
        id: 'opposite-action',
        name: 'Opposite Action',
        category: 'emotion_regulation',
        shortDescription: 'Act opposite to your emotion urge when the emotion is not justified',
        icon: 'swap-horizontal-outline',
    },
    {
        id: 'check-the-facts',
        name: 'Check the Facts',
        category: 'emotion_regulation',
        shortDescription: 'Examine if your emotional response fits the facts of the situation',
        icon: 'search-outline',
    },
    {
        id: 'abc-please',
        name: 'ABC PLEASE',
        category: 'emotion_regulation',
        shortDescription: 'Accumulate positives, Build mastery, Cope ahead, treat PhysicaL illness, Eat balanced, Avoid drugs, Sleep, Exercise',
        icon: 'fitness-outline',
    },
    {
        id: 'dear-man',
        name: 'DEAR MAN',
        category: 'interpersonal_effectiveness',
        shortDescription: 'Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate',
        icon: 'chatbubbles-outline',
    },
    {
        id: 'give',
        name: 'GIVE',
        category: 'interpersonal_effectiveness',
        shortDescription: 'Gentle, Interested, Validate, Easy manner',
        icon: 'heart-outline',
    },
    {
        id: 'fast',
        name: 'FAST',
        category: 'interpersonal_effectiveness',
        shortDescription: 'Fair, no Apologies, Stick to values, Truthful',
        icon: 'flash-outline',
    },
    {
        id: 'wise-mind',
        name: 'Wise Mind',
        category: 'mindfulness',
        shortDescription: 'Finding the balance between emotion mind and reasonable mind',
        icon: 'bulb-outline',
    },
    {
        id: 'observe',
        name: 'Observe',
        category: 'mindfulness',
        shortDescription: 'Notice your experience without getting caught up in it',
        icon: 'eye-outline',
    },
    {
        id: 'describe',
        name: 'Describe',
        category: 'mindfulness',
        shortDescription: 'Put words on your experience without judgment',
        icon: 'document-text-outline',
    },
    {
        id: 'participate',
        name: 'Participate',
        category: 'mindfulness',
        shortDescription: 'Throw yourself completely into the present moment',
        icon: 'body-outline',
    },
];

export const SkillsLibraryScreen = ({ navigation }: any) => {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredSkills = selectedCategory === 'all'
        ? DBT_SKILLS
        : DBT_SKILLS.filter(skill => skill.category === selectedCategory);

    const getCategoryColor = (category: string) => {
        const cat = CATEGORIES.find(c => c.id === category);
        return cat?.color || colors.primary;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>DBT Skills</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryContainer}
            >
                {CATEGORIES.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryChip,
                            selectedCategory === category.id && {
                                backgroundColor: category.color,
                            },
                        ]}
                        onPress={() => setSelectedCategory(category.id)}
                    >
                        <Text
                            style={[
                                styles.categoryText,
                                selectedCategory === category.id && styles.categoryTextActive,
                            ]}
                        >
                            {category.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {filteredSkills.map((skill) => (
                    <TouchableOpacity
                        key={skill.id}
                        style={styles.skillCard}
                        onPress={() => navigation.navigate('SkillDetail', { skillId: skill.id })}
                    >
                        <View
                            style={[
                                styles.skillIcon,
                                { backgroundColor: getCategoryColor(skill.category) + '20' },
                            ]}
                        >
                            <Ionicons
                                name={skill.icon}
                                size={24}
                                color={getCategoryColor(skill.category)}
                            />
                        </View>
                        <View style={styles.skillInfo}>
                            <Text style={styles.skillName}>{skill.name}</Text>
                            <Text style={styles.skillDescription} numberOfLines={2}>
                                {skill.shortDescription}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
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
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight,
    },
    backButton: {
        marginRight: spacing.md,
    },
    title: {
        ...typography.h3,
        color: colors.text,
    },
    categoryScroll: {
        maxHeight: 50,
    },
    categoryContainer: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    categoryChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        marginRight: spacing.sm,
    },
    categoryText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    categoryTextActive: {
        color: colors.text,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    skillCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    skillIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    skillInfo: {
        flex: 1,
    },
    skillName: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    skillDescription: {
        ...typography.caption,
        color: colors.textSecondary,
    },
});
