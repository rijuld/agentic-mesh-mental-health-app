import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export const CrisisButton: React.FC = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePressIn = () => {
    setIsPressed(true);
    Vibration.vibrate(50);
    
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    holdTimer.current = setTimeout(() => {
      Vibration.vibrate([0, 100, 50, 100]);
      setShowCrisisModal(true);
      setIsPressed(false);
      progressAnim.setValue(0);
    }, 3000);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
    }
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <>
      <TouchableOpacity
        style={styles.crisisButton}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.crisisButtonInner}>
          <Ionicons 
            name="alert-circle" 
            size={20} 
            color={isPressed ? colors.text : colors.crisis} 
          />
          {isPressed && (
            <Animated.View 
              style={[styles.progressBar, { width: progressWidth }]} 
            />
          )}
        </View>
        {isPressed && (
          <Text style={styles.holdText}>Hold for crisis support...</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={showCrisisModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.crisisModal}>
          <View style={styles.crisisHeader}>
            <Ionicons name="heart" size={48} color={colors.crisis} />
            <Text style={styles.crisisTitle}>Crisis Protocol Activated</Text>
            <Text style={styles.crisisSubtitle}>You are not alone. Help is here.</Text>
          </View>

          <View style={styles.crisisContent}>
            <View style={styles.crisisStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>TIPP: Temperature</Text>
                <Text style={styles.stepDescription}>
                  Hold ice cubes or splash cold water on your face. This activates your dive reflex and slows your heart rate.
                </Text>
              </View>
            </View>

            <View style={styles.crisisStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Breathe</Text>
                <Text style={styles.stepDescription}>
                  Breathe in for 4 counts, hold for 4, out for 4, hold for 4. Repeat 4 times.
                </Text>
              </View>
            </View>

            <View style={styles.crisisStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Ground Yourself</Text>
                <Text style={styles.stepDescription}>
                  5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.crisisActions}>
            <TouchableOpacity style={styles.emergencyButton}>
              <Ionicons name="call" size={24} color={colors.text} />
              <Text style={styles.emergencyButtonText}>Call 988 (Crisis Line)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.allyButton}>
              <Ionicons name="people" size={24} color={colors.text} />
              <Text style={styles.allyButtonText}>Alert My Ally</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowCrisisModal(false)}
            >
              <Text style={styles.closeButtonText}>I'm feeling better</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  crisisButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    zIndex: 100,
    alignItems: 'flex-end',
  },
  crisisButtonInner: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.crisis,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '100%',
    backgroundColor: colors.crisis,
    opacity: 0.3,
  },
  holdText: {
    ...typography.caption,
    color: colors.crisis,
    marginTop: spacing.xs,
  },
  crisisModal: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  crisisHeader: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  crisisTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
  },
  crisisSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  crisisContent: {
    flex: 1,
    gap: spacing.lg,
  },
  crisisStep: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.crisis,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  stepContent: {
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
  crisisActions: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.crisis,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  emergencyButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  allyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  allyButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  closeButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  closeButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
