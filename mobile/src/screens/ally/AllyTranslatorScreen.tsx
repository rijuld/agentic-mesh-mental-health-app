import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { agentService } from '../../services/agentService';

interface AllyTranslatorScreenProps {
  navigation: any;
}

export const AllyTranslatorScreen: React.FC<AllyTranslatorScreenProps> = ({ navigation }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [translation, setTranslation] = useState<{
    original: string;
    feeling: string;
    translation: string;
    suggestedReply: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    try {
      const response = await agentService.translateMessage(inputMessage);
      
      if (response.success && response.response) {
        const lines = response.response.split('\n');
        setTranslation({
          original: inputMessage,
          feeling: extractSection(lines, 'feeling') || 'Unable to determine',
          translation: extractSection(lines, 'translation') || response.response,
          suggestedReply: extractSection(lines, 'suggested') || 'Take a moment before responding',
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractSection = (lines: string[], keyword: string): string | null => {
    const line = lines.find(l => l.toLowerCase().includes(keyword));
    if (line) {
      const colonIndex = line.indexOf(':');
      return colonIndex > -1 ? line.substring(colonIndex + 1).trim() : line;
    }
    return null;
  };

  const clearTranslation = () => {
    setInputMessage('');
    setTranslation(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Message Translator</Text>
          <Text style={styles.subtitle}>
            Paste a confusing or hurtful message to understand what's really being communicated
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Message to translate</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Paste the message here..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={inputMessage}
            onChangeText={setInputMessage}
            textAlignVertical="top"
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearTranslation}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.translateButton, !inputMessage.trim() && styles.translateButtonDisabled]}
              onPress={handleTranslate}
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <>
                  <Ionicons name="language-outline" size={20} color={colors.text} />
                  <Text style={styles.translateButtonText}>Translate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {translation && (
          <View style={styles.resultSection}>
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.resultLabel}>What they said</Text>
              </View>
              <Text style={styles.resultOriginal}>"{translation.original}"</Text>
            </View>

            <View style={[styles.resultCard, styles.feelingCard]}>
              <View style={styles.resultHeader}>
                <Ionicons name="heart-outline" size={20} color={colors.warning} />
                <Text style={styles.resultLabel}>What they might be feeling</Text>
              </View>
              <Text style={styles.resultText}>{translation.feeling}</Text>
            </View>

            <View style={[styles.resultCard, styles.translationCard]}>
              <View style={styles.resultHeader}>
                <Ionicons name="swap-horizontal-outline" size={20} color={colors.primary} />
                <Text style={styles.resultLabel}>Translation</Text>
              </View>
              <Text style={styles.resultText}>{translation.translation}</Text>
            </View>

            <View style={[styles.resultCard, styles.replyCard]}>
              <View style={styles.resultHeader}>
                <Ionicons name="chatbubbles-outline" size={20} color={colors.success} />
                <Text style={styles.resultLabel}>Suggested Response</Text>
              </View>
              <Text style={styles.resultText}>{translation.suggestedReply}</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Ionicons name="copy-outline" size={16} color={colors.primary} />
                <Text style={styles.copyButtonText}>Copy response</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Communication Tips</Text>
          
          <View style={styles.tipCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
            <Text style={styles.tipText}>Validate feelings before problem-solving</Text>
          </View>
          
          <View style={styles.tipCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
            <Text style={styles.tipText}>Use "I" statements instead of "You" statements</Text>
          </View>
          
          <View style={styles.tipCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
            <Text style={styles.tipText}>Take breaks if emotions are running high</Text>
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
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    color: colors.text,
    ...typography.body,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  clearButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  clearButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  translateButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  translateButtonDisabled: {
    opacity: 0.5,
  },
  translateButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  resultSection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  feelingCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  translationCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  replyCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  resultLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  resultOriginal: {
    ...typography.body,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  resultText: {
    ...typography.body,
    color: colors.text,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  copyButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  tipsSection: {
    marginBottom: spacing.xxl,
  },
  tipsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
});
