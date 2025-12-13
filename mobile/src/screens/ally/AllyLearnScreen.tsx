import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface ResourceCardProps {
    title: string;
    description: string;
    type: 'article' | 'video' | 'book';
    duration?: string;
    onPress: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ title, description, type, duration, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.cardIconContainer}>
            <Ionicons
                name={type === 'video' ? 'play-circle-outline' : type === 'book' ? 'book-outline' : 'document-text-outline'}
                size={24}
                color={colors.primary}
            />
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
            {duration && (
                <View style={styles.metaContainer}>
                    <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{duration}</Text>
                </View>
            )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
);

export const AllyLearnScreen = () => {
    const openLink = (url: string) => {
        // In a real app, this would use Linking.openURL(url)
        console.log('Opening link:', url);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Learn</Text>
                    <Text style={styles.subtitle}>Educational resources on BPD</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Essential Reading</Text>
                    <ResourceCard
                        title="Understanding BPD"
                        description="A comprehensive guide to Borderline Personality Disorder symptoms and diagnosis."
                        type="article"
                        duration="5 min read"
                        onPress={() => openLink('https://example.com/understanding-bpd')}
                    />
                    <ResourceCard
                        title="Biological Vulnerability"
                        description="Learn about the biosocial theory and high emotional sensitivity."
                        type="article"
                        duration="7 min read"
                        onPress={() => openLink('https://example.com/biosocial-theory')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Supporting Your Loved One</Text>
                    <ResourceCard
                        title="Validation Techniques"
                        description="How to validate emotions without agreeing with behaviors."
                        type="video"
                        duration="12 min video"
                        onPress={() => openLink('https://example.com/validation')}
                    />
                    <ResourceCard
                        title="Setting Healthy Boundaries"
                        description="A framework for establishing and maintaining boundaries."
                        type="book"
                        duration="Guide"
                        onPress={() => openLink('https://example.com/boundaries')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Crisis Management</Text>
                    <ResourceCard
                        title="De-escalation Strategies"
                        description="What to do (and what not to do) during an emotional crisis."
                        type="article"
                        duration="10 min read"
                        onPress={() => openLink('https://example.com/crisis-help')}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        These resources are for educational purposes. Always consult with a mental health professional for specific advice.
                    </Text>
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
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    cardIconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
        marginBottom: 2,
    },
    cardDescription: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        ...typography.caption,
        color: colors.textMuted,
        fontSize: 10,
    },
    footer: {
        marginBottom: spacing.xxl,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceLight,
    },
    footerText: {
        ...typography.caption,
        color: colors.textMuted,
        textAlign: 'center',
    },
});
