import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    ActivityIndicator,
    Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useStore } from '../../store/useStore';

export const LinkPatientScreen = ({ navigation }: { navigation: any }) => {
    const [inputCode, setInputCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { linkWithAnchorCode } = useStore();

    const handleLinkPatient = async () => {
        if (!inputCode.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const success = await linkWithAnchorCode(inputCode);
            if (success) {
                navigation.goBack();
            } else {
                setError('Invalid code or connection failed. Please check the code and try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Link New Patient</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="link-outline" size={48} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>Connect with Patient</Text>
                    <Text style={styles.description}>
                        Enter the Anchor Code found in your patient's "Team" tab to establish a secure connection.
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Patient's Anchor Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. ABC-123-XYZ"
                            placeholderTextColor={colors.textMuted}
                            value={inputCode}
                            onChangeText={setInputCode}
                            autoCapitalize="characters"
                            autoCorrect={false}
                        />
                    </View>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color={colors.statusRed} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.connectButton, !inputCode.trim() && styles.disabledButton]}
                        onPress={handleLinkPatient}
                        disabled={isLoading || !inputCode.trim()}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.surface} />
                        ) : (
                            <Text style={styles.connectButtonText}>Connect Patient</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                        <Text style={styles.infoText}>Access is determined by patient settings</Text>
                    </View>
                </View>
            </View>
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
        padding: spacing.lg,
    },
    backButton: {
        marginRight: spacing.md,
    },
    headerTitle: {
        ...typography.h3,
        color: colors.text,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.full,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h2,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    description: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    inputContainer: {
        width: '100%',
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.caption,
        color: colors.textMuted,
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        color: colors.text,
        ...typography.h3,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: colors.surfaceLight,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
        backgroundColor: colors.statusRed + '20',
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        width: '100%',
    },
    errorText: {
        ...typography.caption,
        color: colors.statusRed,
        flex: 1,
    },
    connectButton: {
        width: '100%',
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    connectButtonText: {
        ...typography.body,
        color: colors.surface,
        fontWeight: '600',
    },
    infoSection: {
        gap: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    infoText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
});
