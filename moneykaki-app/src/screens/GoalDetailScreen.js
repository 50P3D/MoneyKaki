import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, PrimaryButton, GhostButton, SectionLabel } from '../components/Common';
import { colors } from '../theme/tokens';

const CHECKPOINTS = [
  { label: 'Week 1 — $100', status: 'done' },
  { label: 'Week 2 — $100', status: 'done' },
  { label: 'Week 3 — $100', status: 'progress' },
];

export default function GoalDetailScreen({ route, navigation }) {
  const { goal } = route.params;
  const [amount, setAmount] = useState(String(goal.suggested));
  const segments = 10;
  const filledSegments = Math.round((goal.percent / 100) * segments);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹  Home</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🏝️ {goal.title}</Text>
        <Text style={styles.sub}>
          ${goal.saved} of ${goal.target} · {goal.daysLeft} days left
        </Text>

        <View style={styles.segBar}>
          {Array.from({ length: segments }).map((_, i) => (
            <View key={i} style={[styles.seg, i < filledSegments && styles.segFilled]} />
          ))}
        </View>
        <Text style={styles.segLabel}>{goal.percent}% saved</Text>

        <View style={styles.statTrio}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>🔥 14</Text>
            <Text style={styles.statLbl}>day streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>💎 220</Text>
            <Text style={styles.statLbl}>gems</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>❄️ 1</Text>
            <Text style={styles.statLbl}>freeze left</Text>
          </View>
        </View>

        <SectionLabel>Today's contribution</SectionLabel>
        <View style={styles.inputWrap}>
          <Text style={styles.inputPrefix}>$</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        <GhostButton title="📷  Add screenshot (optional)" onPress={() => {}} />
        <PrimaryButton title="Confirm by 23:59" onPress={() => {}} />

        <SectionLabel>Sub-goal checkpoints</SectionLabel>
        <Card style={{ paddingVertical: 4 }}>
          {CHECKPOINTS.map((c, i) => (
            <View
              key={c.label}
              style={[styles.checkpoint, i === CHECKPOINTS.length - 1 && { borderBottomWidth: 0 }]}
            >
              <Text style={styles.checkpointLabel}>{c.label}</Text>
              {c.status === 'done' ? (
                <View style={styles.doneChip}>
                  <Text style={styles.doneChipText}>Done</Text>
                </View>
              ) : (
                <Text style={styles.progressText}>In progress</Text>
              )}
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sage },
  scroll: { padding: 18, paddingBottom: 100 },
  backRow: { paddingVertical: 6 },
  backText: { fontSize: 13, fontWeight: '600', color: colors.ink },
  title: { fontSize: 19, fontWeight: '600', color: colors.ink, marginTop: 12 },
  sub: { fontSize: 12.5, color: colors.textDim, marginTop: 2 },
  segBar: { flexDirection: 'row', gap: 4, marginTop: 16 },
  seg: { flex: 1, height: 10, borderRadius: 4, backgroundColor: colors.line },
  segFilled: { backgroundColor: colors.jade },
  segLabel: { fontSize: 11, color: colors.textDim, marginTop: 6 },
  statTrio: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 16, fontWeight: '600', color: colors.ink },
  statLbl: { fontSize: 10, color: colors.textDim, marginTop: 2 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginTop: 6,
  },
  inputPrefix: { fontWeight: '700', color: colors.textDim, marginRight: 6, fontSize: 15 },
  input: { fontSize: 15, fontWeight: '600', color: colors.ink, flex: 1, padding: 0 },
  checkpoint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  checkpointLabel: { fontSize: 12.5, color: colors.ink },
  doneChip: { backgroundColor: 'rgba(30,138,102,0.14)', borderRadius: 20, paddingVertical: 3, paddingHorizontal: 8 },
  doneChipText: { color: colors.jadeDark, fontSize: 10.5, fontWeight: '700' },
  progressText: { fontSize: 11, color: colors.textDim, fontWeight: '600' },
});
