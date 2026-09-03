import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius } from '../theme/tokens';

export function Card({ children, style, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={[styles.card, style]} onPress={onPress} activeOpacity={onPress ? 0.85 : 1}>
      {children}
    </Wrapper>
  );
}

export function SectionLabel({ children, action, onAction }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{children}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.link}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function StreakPill({ days }) {
  return (
    <View style={styles.streakPill}>
      <Text style={styles.streakPillText}>🔥 {days} days</Text>
    </View>
  );
}

export function PrimaryButton({ title, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.primaryBtn, style]} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.primaryBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function GhostButton({ title, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.ghostBtn, style]} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.ghostBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 16,
    marginTop: 14,
  },
  sectionRow: {
    marginTop: 22,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: colors.ink },
  link: { fontSize: 11.5, color: colors.jadeDark, fontWeight: '600' },
  streakPill: {
    backgroundColor: colors.ink,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 11,
  },
  streakPillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: colors.jade,
    borderRadius: radius.sm,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13.5 },
  ghostBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#fff',
  },
  ghostBtnText: { color: colors.ink, fontWeight: '600', fontSize: 13 },
});
