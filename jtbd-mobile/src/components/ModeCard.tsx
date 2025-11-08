import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { Button } from './Button';
import { theme } from '../lib/theme';

interface ModeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  completed: boolean;
  progress?: string;
  onPress: () => void;
}

export function ModeCard({ icon, title, description, completed, progress, onPress }: ModeCardProps) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        {completed && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ Completed</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {progress && (
        <Text style={styles.progress}>{progress}</Text>
      )}

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={onPress}
        style={styles.button}
      >
        {completed ? 'Play Again' : 'Start'}
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
  },
  completedBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.success,
  },
  completedText: {
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
  title: {
    fontSize: theme.fontSize.title3,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: theme.fontSize.subhead,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  progress: {
    fontSize: theme.fontSize.footnote,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    fontWeight: theme.fontWeight.medium,
  },
  button: {
    marginTop: theme.spacing.xs,
  },
});
