import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../lib/theme';

interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  minHeight?: number;
}

export function TextArea({ label, error, minHeight = 100, style, ...props }: TextAreaProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.textArea,
          { minHeight },
          error ? styles.textAreaError : null,
          style
        ]}
        placeholderTextColor={theme.colors.textMuted}
        multiline
        textAlignVertical="top"
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  textArea: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  textAreaError: {
    borderColor: theme.colors.error,
  },
  error: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});
