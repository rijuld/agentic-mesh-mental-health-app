import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    ActivityIndicator,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { databaseService } from '../../services/databaseService';

export const LinkPatientScreen = ({ navigation }: { navigation: any }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState<Array<{ id: string; name: string; email: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingSent, setPendingSent] = useState<Set<string>>(new Set());
    const { sendConnectionRequest, linkedAccounts } = useStore();

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        setIsLoading(true);
        try {
            const allPatients = await databaseService.getAllUsersByRole('patient');
            setPatients(allPatients);
        } catch (error) {
            console.error('Error loading patients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendRequest = async (patientId: string) => {
        const success = await sendConnectionRequest(patientId, 'patient');
        if (success) {
            setPendingSent(prev => new Set(prev).add(patientId));
            Alert.alert('Request Sent', 'Connection request sent to patient!');
        } else {
            Alert.alert('Error', 'Failed to send request.');
        }
    };

    const filteredPatients = patients.filter(p => 
        !linkedAccounts.some(la => la.id === p.id) &&
        !pendingSent.has(p.id) &&
        (searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Find Patient</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
                ) : filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                        <View key={patient.id} style={styles.patientCard}>
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={24} color={colors.text} />
                            </View>
                            <View style={styles.patientInfo}>
                                <Text style={styles.patientName}>{patient.name}</Text>
                                <Text style={styles.patientEmail}>{patient.email}</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.connectButton}
                                onPress={() => handleSendRequest(patient.id)}
                            >
                                <Text style={styles.connectButtonText}>Connect</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                        <Text style={styles.emptyStateText}>
                            {searchQuery ? 'No patients found' : 'No available patients'}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: spacing.md,
        color: colors.text,
        ...typography.body,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    patientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        backgroundColor: colors.cardPatient,
        justifyContent: 'center',
        alignItems: 'center',
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
    patientEmail: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    connectButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
    },
    connectButtonText: {
        ...typography.bodySmall,
        color: colors.text,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyStateText: {
        ...typography.body,
        color: colors.textMuted,
        marginTop: spacing.md,
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
});
