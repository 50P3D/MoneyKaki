import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProgressRing from './ProgressRing';
import { colors, radius, type } from '../theme/tokens';
import { getPaceMessage } from '../state/nudges';

export default function GoalCard({ goal, onPress, gradient, statusLabel }) {
  const pace = getPaceMessage(goal);
  const percent = Math.round((goal.saved / goal.target) * 100);
  const gradientColors = gradient || [colors.jade, colors.jadeDark];

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {statusLabel ? (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{statusLabel}</Text>
          </View>
        ) : null}

        <View style={styles.top}>
          <ProgressRing percent={percent} />
          <View style={styles.meta}>
            <Text style={styles.title}>
              {goal.emoji} {goal.title}
            </Text>
            <Text style={styles.amount}>
              ${goal.saved} of ${goal.target} · {goal.daysLeft} days left
            </Text>
          </View>
        </View>

        <Text style={styles.paceLine}>{pace.message}</Text>

        <View style={styles.suggestRow}>
          <View>
            <Text style={styles.suggestLabel}>Suggested today</Text>
            <Text style={styles.suggestAmt}>${goal.suggested}</Text>
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={onPress}>
            <Text style={[styles.saveBtnText, { color: gradientColors[1] }]}>Save now →</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: 18, marginTop: 14 },
  statusBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusBadgeText: { color: '#fff', ...type.micro },
  top: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  meta: { flex: 1 },
  title: { color: '#fff', ...type.h2 },
  amount: { color: 'rgba(255,255,255,0.85)', ...type.caption, marginTop: 3 },
  paceLine: {
    color: 'rgba(255,255,255,0.92)',
    ...type.caption,
    fontWeight: '600',
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  suggestRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestLabel: { color: 'rgba(255,255,255,0.85)', ...type.caption },
  suggestAmt: { color: '#fff', ...type.h2, marginTop: 2 },
  saveBtn: {
    backgroundColor: '#fff',
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  saveBtnText: { ...type.bodyStrong },
});
