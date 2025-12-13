import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    Animated,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { agentService } from '../../../services/agentService';

const DELAY_OPTIONS = [
    { label: '5 min', value: 5 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
];

interface BufferedMessage {
    id: string;
    recipient: string;
    content: string;
    scheduledTime: Date;
    status: 'pending' | 'sent' | 'cancelled';
}

export const FPBufferScreen = ({ navigation }: any) => {
    const [recipient, setRecipient] = useState('');
    const [message, setMessage] = useState('');
    const [selectedDelay, setSelectedDelay] = useState(15);
    const [bufferedMessages, setBufferedMessages] = useState<BufferedMessage[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [showCompose, setShowCompose] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const analyzeMessage = async () => {
        if (!message.trim()) return;

        setIsAnalyzing(true);
        try {
            const response = await agentService.getFPBufferSupport(
                `I want to send this message to ${recipient || 'someone'}: "${message}". 
                Help me check if this message might be reactive or if I should reconsider. 
                If it seems emotionally charged, suggest a more balanced alternative.`
            );

            if (response.success && response.response) {
                setAiSuggestion(response.response);
            }
        } catch (error) {
            console.error('Error analyzing message:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const scheduleMessage = () => {
        if (!message.trim()) {
            Alert.alert('Empty Message', 'Please write a message first.');
            return;
        }

        const scheduledTime = new Date(Date.now() + selectedDelay * 60 * 1000);
        const newMessage: BufferedMessage = {
            id: Date.now().toString(),
            recipient: recipient || 'Unknown',
            content: message,
            scheduledTime,
            status: 'pending',
        };

        setBufferedMessages([newMessage, ...bufferedMessages]);
        setMessage('');
        setRecipient('');
        setAiSuggestion(null);
        setShowCompose(false);

        Alert.alert(
            'Message Scheduled',
            `Your message will be ready to send in ${selectedDelay} minutes. Use this time to reflect.`,
            [{ text: 'OK' }]
        );
    };

    const cancelMessage = (id: string) => {
        setBufferedMessages(
            bufferedMessages.map((msg) =>
                msg.id === id ? { ...msg, status: 'cancelled' as const } : msg
            )
        );
    };

    const formatTimeRemaining = (scheduledTime: Date) => {
        const now = new Date();
        const diff = scheduledTime.getTime() - now.getTime();
        if (diff <= 0) return 'Ready to send';
        const minutes = Math.ceil(diff / 60000);
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            return `${hours}h ${minutes % 60}m remaining`;
        }
        return `${minutes}m remaining`;
    };

    if (showCompose) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setShowCompose(false)} style={styles.backButton}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Compose Message</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.composeContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.infoCard}>
                        <Ionicons name="time-outline" size={24} color={colors.warning} />
                        <Text style={styles.infoText}>
                            This tool helps you pause before sending messages you might regret. 
                            Write your message, set a delay, and use the time to reflect.
                        </Text>
                    </View>

                    <Text style={styles.label}>To:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Recipient name (optional)"
                        placeholderTextColor={colors.textMuted}
                        value={recipient}
                        onChangeText={setRecipient}
                    />

                    <Text style={styles.label}>Message:</Text>
                    <TextInput
                        style={[styles.input, styles.messageInput]}
                        placeholder="Write your message here..."
                        placeholderTextColor={colors.textMuted}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={styles.analyzeButton}
                        onPress={analyzeMessage}
                        disabled={isAnalyzing || !message.trim()}
                    >
                        <Ionicons
                            name={isAnalyzing ? 'hourglass-outline' : 'sparkles'}
                            size={20}
                            color={colors.text}
                        />
                        <Text style={styles.analyzeButtonText}>
                            {isAnalyzing ? 'Analyzing...' : 'Check with AI'}
                        </Text>
                    </TouchableOpacity>

                    {aiSuggestion && (
                        <View style={styles.suggestionCard}>
                            <View style={styles.suggestionHeader}>
                                <Ionicons name="bulb" size={20} color={colors.warning} />
                                <Text style={styles.suggestionTitle}>AI Suggestion</Text>
                            </View>
                            <Text style={styles.suggestionText}>{aiSuggestion}</Text>
                        </View>
                    )}

                    <Text style={styles.label}>Delay before sending:</Text>
                    <View style={styles.delayOptions}>
                        {DELAY_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.delayChip,
                                    selectedDelay === option.value && styles.delayChipActive,
                                ]}
                                onPress={() => setSelectedDelay(option.value)}
                            >
                                <Text
                                    style={[
                                        styles.delayChipText,
                                        selectedDelay === option.value && styles.delayChipTextActive,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ height: spacing.xxl }} />
                </ScrollView>

                <TouchableOpacity style={styles.scheduleButton} onPress={scheduleMessage}>
                    <Ionicons name="timer-outline" size={20} color={colors.text} />
                    <Text style={styles.scheduleButtonText}>Schedule Message</Text>
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
                <Text style={styles.title}>Pause Before Sending</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.heroCard, { transform: [{ scale: pulseAnim }] }]}>
                    <Ionicons name="pause-circle" size={48} color={colors.warning} />
                    <Text style={styles.heroTitle}>Pause Before You Send</Text>
                    <Text style={styles.heroText}>
                        When emotions run high, give yourself time to reflect before sending messages 
                        you might regret.
                    </Text>
                </Animated.View>

                <Text style={styles.sectionTitle}>Buffered Messages</Text>

                {bufferedMessages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="mail-outline" size={48} color={colors.textMuted} />
                        <Text style={styles.emptyText}>No buffered messages</Text>
                    </View>
                ) : (
                    bufferedMessages.map((msg) => (
                        <View
                            key={msg.id}
                            style={[
                                styles.messageCard,
                                msg.status === 'cancelled' && styles.messageCardCancelled,
                            ]}
                        >
                            <View style={styles.messageHeader}>
                                <Text style={styles.messageRecipient}>To: {msg.recipient}</Text>
                                <Text
                                    style={[
                                        styles.messageStatus,
                                        msg.status === 'cancelled' && styles.messageStatusCancelled,
                                    ]}
                                >
                                    {msg.status === 'cancelled'
                                        ? 'Cancelled'
                                        : formatTimeRemaining(msg.scheduledTime)}
                                </Text>
                            </View>
                            <Text style={styles.messageContent} numberOfLines={2}>
                                {msg.content}
                            </Text>
                            {msg.status === 'pending' && (
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => cancelMessage(msg.id)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel Message</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => setShowCompose(true)}>
                <Ionicons name="create-outline" size={24} color={colors.text} />
                <Text style={styles.fabText}>New Message</Text>
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
    heroCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.warning + '40',
    },
    heroTitle: {
        ...typography.h3,
        color: colors.text,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    heroText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.md,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    emptyText: {
        ...typography.body,
        color: colors.textMuted,
        marginTop: spacing.sm,
    },
    messageCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    messageCardCancelled: {
        opacity: 0.5,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    messageRecipient: {
        ...typography.bodySmall,
        color: colors.text,
        fontWeight: '600',
    },
    messageStatus: {
        ...typography.caption,
        color: colors.warning,
    },
    messageStatusCancelled: {
        color: colors.textMuted,
    },
    messageContent: {
        ...typography.body,
        color: colors.textSecondary,
    },
    cancelButton: {
        marginTop: spacing.sm,
        alignSelf: 'flex-start',
    },
    cancelButtonText: {
        ...typography.caption,
        color: colors.crisis,
    },
    fab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        margin: spacing.lg,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    fabText: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
    },
    composeContent: {
        flex: 1,
        padding: spacing.lg,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: colors.warning + '20',
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
        minHeight: 120,
        textAlignVertical: 'top',
    },
    analyzeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.secondary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
    },
    analyzeButtonText: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
    },
    suggestionCard: {
        backgroundColor: colors.warning + '15',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginTop: spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.warning,
    },
    suggestionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    suggestionTitle: {
        ...typography.bodySmall,
        color: colors.warning,
        fontWeight: '600',
    },
    suggestionText: {
        ...typography.body,
        color: colors.text,
    },
    delayOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    delayChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
    },
    delayChipActive: {
        backgroundColor: colors.primary,
    },
    delayChipText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    delayChipTextActive: {
        color: colors.text,
        fontWeight: '600',
    },
    scheduleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.warning,
        margin: spacing.lg,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    scheduleButtonText: {
        ...typography.body,
        color: colors.background,
        fontWeight: '600',
    },
});
