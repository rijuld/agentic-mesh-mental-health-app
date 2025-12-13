import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { agentService } from '../../services/agentService';
import { ChatMessage } from '../../types';

interface ChatScreenProps {
  navigation: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const { user, chatHistory, addChatMessage, currentMood } = useStore();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const getAgentName = () => {
    switch (user?.role) {
      case 'patient': return 'Anchor AI (DBT Coach)';
      case 'ally': return 'Anchor AI (Support Guide)';
      case 'therapist': return 'Anchor AI (Clinical Assistant)';
      default: return 'Anchor AI';
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await agentService.chatWithRole(
        user?.role || 'patient',
        inputText.trim(),
        { mood_level: currentMood }
      );

      if (response.success && response.response) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
          agentType: response.agent_type,
        };
        addChatMessage(assistantMessage);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{getAgentName()}</Text>
          <Text style={styles.headerSubtitle}>Here to support you</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {chatHistory.length === 0 && (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeIcon}>
                <Ionicons name="chatbubbles" size={48} color={colors.primary} />
              </View>
              <Text style={styles.welcomeTitle}>Welcome to Anchor AI</Text>
              <Text style={styles.welcomeText}>
                {user?.role === 'patient' && 
                  "I'm here to help you practice DBT skills and navigate difficult moments. How are you feeling today?"}
                {user?.role === 'ally' && 
                  "I'm here to help you understand and support your loved one. What would you like help with?"}
                {user?.role === 'therapist' && 
                  "I'm here to assist with clinical documentation and patient insights. How can I help?"}
              </Text>
              
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Try asking:</Text>
                {user?.role === 'patient' && (
                  <>
                    <TouchableOpacity 
                      style={styles.suggestionChip}
                      onPress={() => setInputText("I'm feeling overwhelmed right now")}
                    >
                      <Text style={styles.suggestionText}>I'm feeling overwhelmed right now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.suggestionChip}
                      onPress={() => setInputText("Help me with the STOP skill")}
                    >
                      <Text style={styles.suggestionText}>Help me with the STOP skill</Text>
                    </TouchableOpacity>
                  </>
                )}
                {user?.role === 'ally' && (
                  <>
                    <TouchableOpacity 
                      style={styles.suggestionChip}
                      onPress={() => setInputText("How do I respond when they're splitting?")}
                    >
                      <Text style={styles.suggestionText}>How do I respond when they're splitting?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.suggestionChip}
                      onPress={() => setInputText("I'm feeling burned out from caregiving")}
                    >
                      <Text style={styles.suggestionText}>I'm feeling burned out from caregiving</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          )}

          {chatHistory.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              {message.role === 'assistant' && (
                <View style={styles.assistantHeader}>
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                  <Text style={styles.assistantLabel}>Anchor AI</Text>
                </View>
              )}
              <Text style={[
                styles.messageText,
                message.role === 'user' ? styles.userText : styles.assistantText,
              ]}>
                {message.content}
              </Text>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? colors.text : colors.textMuted} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  welcomeTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  welcomeText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  suggestionsContainer: {
    marginTop: spacing.xl,
    width: '100%',
  },
  suggestionsTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  suggestionText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: spacing.xs,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: spacing.xs,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  assistantLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  messageText: {
    ...typography.body,
  },
  userText: {
    color: colors.text,
  },
  assistantText: {
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    ...typography.body,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
});
