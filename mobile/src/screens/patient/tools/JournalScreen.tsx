import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface JournalEntry {
    id: string;
    content: string;
    mood: number;
    timestamp: string;
    tags: string[];
}

const JOURNAL_STORAGE_KEY = 'anchor_journal_entries';

const PROMPT_SUGGESTIONS = [
    "What emotions am I feeling right now?",
    "What triggered these feelings?",
    "What would I tell a friend in this situation?",
    "What DBT skill could help me right now?",
    "What am I grateful for today?",
];

export const JournalScreen = ({ navigation }: any) => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [currentEntry, setCurrentEntry] = useState('');
    const [currentMood, setCurrentMood] = useState(5);
    const [isWriting, setIsWriting] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        try {
            const stored = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
            if (stored) {
                setEntries(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading journal entries:', error);
        }
    };

    const saveEntry = async () => {
        if (!currentEntry.trim()) return;

        const newEntry: JournalEntry = {
            id: Date.now().toString(),
            content: selectedPrompt ? `${selectedPrompt}\n\n${currentEntry}` : currentEntry,
            mood: currentMood,
            timestamp: new Date().toISOString(),
            tags: [],
        };

        const updatedEntries = [newEntry, ...entries];
        setEntries(updatedEntries);

        try {
            await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updatedEntries));
            setCurrentEntry('');
            setSelectedPrompt(null);
            setIsWriting(false);
            Alert.alert('Saved', 'Your journal entry has been saved.');
        } catch (error) {
            console.error('Error saving journal entry:', error);
        }
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const getMoodEmoji = (mood: number) => {
        if (mood <= 3) return '😔';
        if (mood <= 5) return '😐';
        if (mood <= 7) return '🙂';
        return '😊';
    };

    if (isWriting) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setIsWriting(false)} style={styles.backButton}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>New Entry</Text>
                    <TouchableOpacity onPress={saveEntry} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    style={styles.writeContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView style={styles.writeScroll} showsVerticalScrollIndicator={false}>
                        <Text style={styles.moodLabel}>How are you feeling? {getMoodEmoji(currentMood)}</Text>
                        <View style={styles.moodSlider}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={[
                                        styles.moodButton,
                                        currentMood === num && styles.moodButtonActive,
                                    ]}
                                    onPress={() => setCurrentMood(num)}
                                >
                                    <Text
                                        style={[
                                            styles.moodButtonText,
                                            currentMood === num && styles.moodButtonTextActive,
                                        ]}
                                    >
                                        {num}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {!selectedPrompt && (
                            <View style={styles.promptsSection}>
                                <Text style={styles.promptsLabel}>Need a prompt?</Text>
                                {PROMPT_SUGGESTIONS.map((prompt, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.promptChip}
                                        onPress={() => setSelectedPrompt(prompt)}
                                    >
                                        <Text style={styles.promptText}>{prompt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {selectedPrompt && (
                            <View style={styles.selectedPromptContainer}>
                                <Text style={styles.selectedPromptLabel}>Prompt:</Text>
                                <Text style={styles.selectedPromptText}>{selectedPrompt}</Text>
                                <TouchableOpacity onPress={() => setSelectedPrompt(null)}>
                                    <Text style={styles.changePromptText}>Change prompt</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TextInput
                            style={styles.textInput}
                            placeholder="Write your thoughts here..."
                            placeholderTextColor={colors.textMuted}
                            value={currentEntry}
                            onChangeText={setCurrentEntry}
                            multiline
                            textAlignVertical="top"
                            autoFocus
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Journal</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {entries.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="journal-outline" size={64} color={colors.textMuted} />
                        <Text style={styles.emptyTitle}>Your journal is empty</Text>
                        <Text style={styles.emptyText}>
                            Start writing to track your thoughts and emotions over time.
                        </Text>
                    </View>
                ) : (
                    entries.map((entry) => (
                        <View key={entry.id} style={styles.entryCard}>
                            <View style={styles.entryHeader}>
                                <Text style={styles.entryDate}>{formatDate(entry.timestamp)}</Text>
                                <Text style={styles.entryMood}>{getMoodEmoji(entry.mood)} {entry.mood}/10</Text>
                            </View>
                            <Text style={styles.entryContent} numberOfLines={4}>
                                {entry.content}
                            </Text>
                        </View>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => setIsWriting(true)}>
                <Ionicons name="add" size={28} color={colors.text} />
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
    headerSpacer: {
        width: 40,
    },
    saveButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
    },
    saveButtonText: {
        ...typography.bodySmall,
        color: colors.text,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.xxl * 2,
    },
    emptyTitle: {
        ...typography.h3,
        color: colors.text,
        marginTop: spacing.lg,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.sm,
        paddingHorizontal: spacing.xl,
    },
    entryCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    entryDate: {
        ...typography.caption,
        color: colors.textMuted,
    },
    entryMood: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    entryContent: {
        ...typography.body,
        color: colors.text,
    },
    fab: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.lg,
        width: 56,
        height: 56,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    writeContainer: {
        flex: 1,
    },
    writeScroll: {
        flex: 1,
        padding: spacing.lg,
    },
    moodLabel: {
        ...typography.body,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    moodSlider: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    moodButton: {
        width: 28,
        height: 28,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moodButtonActive: {
        backgroundColor: colors.primary,
    },
    moodButtonText: {
        ...typography.caption,
        color: colors.textMuted,
    },
    moodButtonTextActive: {
        color: colors.text,
        fontWeight: '700',
    },
    promptsSection: {
        marginBottom: spacing.lg,
    },
    promptsLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    promptChip: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    promptText: {
        ...typography.bodySmall,
        color: colors.text,
    },
    selectedPromptContainer: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.lg,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
    },
    selectedPromptLabel: {
        ...typography.caption,
        color: colors.textMuted,
        marginBottom: spacing.xs,
    },
    selectedPromptText: {
        ...typography.body,
        color: colors.text,
        fontStyle: 'italic',
    },
    changePromptText: {
        ...typography.caption,
        color: colors.primary,
        marginTop: spacing.sm,
    },
    textInput: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        color: colors.text,
        ...typography.body,
        minHeight: 200,
        marginBottom: spacing.xxl,
    },
});
