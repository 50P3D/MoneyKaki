import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProgressRing from './ProgressRing';
import { colors, radius } from '../theme/tokens';

export default function GoalCard({ goal, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <LinearGradient
        colors={[colors.jade, colors.jadeDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.top}>
          <ProgressRing percent={goal.percent} />
          <View style={styles.meta}>
            <Text style={styles.title}>{goal.title}</Text>
            <Text style={styles.amount}>
              ${goal.saved} of ${goal.target} · {goal.daysLeft} days left
            </Text>
          </View>
        </View>

        <View style={styles.suggestRow}>
          <View>
            <Text style={styles.suggestLabel}>Suggested today</Text>
            <Text style={styles.suggestAmt}>${goal.suggested}</Text>
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={onPress}>
            <Text style={styles.saveBtnText}>Save now →</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: 18, marginTop: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  meta: { flex: 1 },
  title: { color: '#fff', fontWeight: '600', fontSize: 15 },
  amount: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, marginTop: 3 },
  suggestRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5 },
  suggestAmt: { color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 2 },
  saveBtn: {
    backgroundColor: '#fff',
    borderRadius: 9,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  saveBtnText: { color: colors.jadeDark, fontWeight: '700', fontSize: 13 },
});
