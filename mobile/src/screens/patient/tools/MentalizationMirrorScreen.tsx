import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { agentService } from '../../../services/agentService';

interface AnalysisResult {
    translation: string;
    possibleMeanings: string[];
    suggestedResponse: string;
    emotionalContext: string;
}

export const MentalizationMirrorScreen = ({ navigation }: any) => {
    const [inputMessage, setInputMessage] = useState('');
    const [relationshipContext, setRelationshipContext] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [rawResponse, setRawResponse] = useState<string | null>(null);

    const analyzeMessage = async () => {
        if (!inputMessage.trim()) return;

        setIsAnalyzing(true);
        setResult(null);
        setRawResponse(null);

        try {
            const contextInfo = relationshipContext
                ? `Relationship context: ${relationshipContext}\n\n`
                : '';

            const response = await agentService.mentalizeMessage(
                `${contextInfo}I received this message and I'm trying to understand what the person really means:

"${inputMessage}"

Please help me:
1. Translate the emotional meaning behind this message
2. List 2-3 possible interpretations of what they might be feeling
3. Suggest a validating response I could give
4. Explain the emotional context they might be in`
            );

            if (response.success && response.response) {
                setRawResponse(response.response);
            }
        } catch (error) {
            console.error('Error analyzing message:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const clearAnalysis = () => {
        setInputMessage('');
        setRelationshipContext('');
        setResult(null);
        setRawResponse(null);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Mentalization Mirror</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.infoCard}>
                    <Ionicons name="glasses-outline" size={24} color={colors.secondary} />
                    <Text style={styles.infoText}>
                        Paste a confusing or upsetting message you received. This tool helps you 
                        understand the emotions behind the words and respond with empathy.
                    </Text>
                </View>

                <Text style={styles.label}>Message you received:</Text>
                <TextInput
                    style={[styles.input, styles.messageInput]}
                    placeholder="Paste the message here..."
                    placeholderTextColor={colors.textMuted}
                    value={inputMessage}
                    onChangeText={setInputMessage}
                    multiline
                    textAlignVertical="top"
                />

                <Text style={styles.label}>Relationship context (optional):</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., My partner, after an argument..."
                    placeholderTextColor={colors.textMuted}
                    value={relationshipContext}
                    onChangeText={setRelationshipContext}
                />

                <TouchableOpacity
                    style={[styles.analyzeButton, (!inputMessage.trim() || isAnalyzing) && styles.buttonDisabled]}
                    onPress={analyzeMessage}
                    disabled={!inputMessage.trim() || isAnalyzing}
                >
                    {isAnalyzing ? (
                        <ActivityIndicator size="small" color={colors.text} />
                    ) : (
                        <Ionicons name="sparkles" size={20} color={colors.text} />
                    )}
                    <Text style={styles.analyzeButtonText}>
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Message'}
                    </Text>
                </TouchableOpacity>

                {rawResponse && (
                    <View style={styles.resultContainer}>
                        <View style={styles.resultHeader}>
                            <Ionicons name="bulb" size={24} color={colors.secondary} />
                            <Text style={styles.resultTitle}>Understanding the Message</Text>
                        </View>

                        <View style={styles.resultCard}>
                            <Text style={styles.resultText}>{rawResponse}</Text>
                        </View>

                        <TouchableOpacity style={styles.clearButton} onPress={clearAnalysis}>
                            <Text style={styles.clearButtonText}>Analyze Another Message</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.tipsSection}>
                    <Text style={styles.tipsTitle}>Mentalization Tips</Text>
                    
                    <View style={styles.tipCard}>
                        <Ionicons name="pause-circle-outline" size={20} color={colors.primary} />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipLabel}>Pause Before Reacting</Text>
                            <Text style={styles.tipText}>
                                When you feel triggered, take a breath before responding.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.tipCard}>
                        <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipLabel}>Ask Curious Questions</Text>
                            <Text style={styles.tipText}>
                                Instead of assuming, ask: "Can you help me understand what you mean?"
                            </Text>
                        </View>
                    </View>

                    <View style={styles.tipCard}>
                        <Ionicons name="heart-outline" size={20} color={colors.primary} />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipLabel}>Validate First</Text>
                            <Text style={styles.tipText}>
                                Acknowledge their feelings before sharing your perspective.
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: spacing.xxl }} />
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
    infoCard: {
        flexDirection: 'row',
        backgroundColor: colors.secondary + '20',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    infoText: {
        ...typography.bodySmall,
        color: colors.text,
        flex: 1,
    },
    label: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        color: colors.text,
        ...typography.body,
    },
    messageInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    analyzeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.secondary,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginTop: spacing.lg,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    analyzeButtonText: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
    },
    resultContainer: {
        marginTop: spacing.xl,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    resultTitle: {
        ...typography.h3,
        color: colors.text,
    },
    resultCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderLeftWidth: 3,
        borderLeftColor: colors.secondary,
    },
    resultText: {
        ...typography.body,
        color: colors.text,
        lineHeight: 24,
    },
    clearButton: {
        alignItems: 'center',
        padding: spacing.md,
        marginTop: spacing.md,
    },
    clearButtonText: {
        ...typography.body,
        color: colors.primary,
    },
    tipsSection: {
        marginTop: spacing.xl,
    },
    tipsTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.md,
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    tipContent: {
        flex: 1,
    },
    tipLabel: {
        ...typography.bodySmall,
        color: colors.text,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    tipText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
});
