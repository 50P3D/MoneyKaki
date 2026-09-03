import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, PrimaryButton, GhostButton, SectionLabel, Pulse } from '../components/Common';
import CpfSnapshot from '../components/CpfSnapshot';
import { colors, type } from '../theme/tokens';
import { useApp, useProfile } from '../state/AppState';
import { getPaceMessage } from '../state/nudges';

export default function GoalDetailScreen({ route, navigation }) {
  const { goalId } = route.params;
  const { contribute, applyFreeze } = useApp();
  const profile = useProfile();
  const goal = profile.goals.find((g) => g.id === goalId) ?? profile.goals[0];

  const [amount, setAmount] = useState(String(goal.suggested));
  const [attached, setAttached] = useState(false);

  const percent = Math.round((goal.saved / goal.target) * 100);
  const segments = 10;
  const filledSegments = Math.round((percent / 100) * segments);
  const pace = getPaceMessage(goal);
  const streakBroken = profile.streakStatus === 'broken';
  const projectedSaved = goal.saved + goal.suggested * goal.daysLeft;
  const projectedShortfall = Math.max(0, goal.target - Math.min(goal.target, projectedSaved));

  const [warningVisible, setWarningVisible] = useState(false);
  useEffect(() => {
    if (pace.state === 'behind') setWarningVisible(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = () => {
    const value = Number(amount);
    contribute(goal.id, value);
    setAttached(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Modal
        visible={warningVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWarningVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalKicker}>⚠️  Heads up</Text>
            <Text style={styles.modalTitle}>At this pace, {goal.title} falls short</Text>
            <Text style={styles.modalBody}>
              You're currently on ${goal.suggested}/day. Keep that up for the {goal.daysLeft} days left
              and you'd land around ${Math.min(goal.target, projectedSaved)} of your ${goal.target} goal —
              about ${projectedShortfall} short.
            </Text>
            <Text style={styles.modalBody}>
              Bumping to ${pace.required}/day gets {goal.title} back on track. Nothing's locked in — this
              is just today's honest projection so there's no surprise later.
            </Text>
            <PrimaryButton
              title={`Bump to $${pace.required}/day`}
              color={profile.accent}
              onPress={() => {
                setAmount(String(pace.required));
                setWarningVisible(false);
              }}
            />
            <TouchableOpacity
              style={styles.modalDismiss}
              onPress={() => setWarningVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.modalDismissText}>I understand — let's keep going</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>‹  Home</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{goal.emoji} {goal.title}</Text>
        <Text style={styles.sub}>
          ${goal.saved} of ${goal.target} · {goal.daysLeft} days left
        </Text>

        <View style={styles.segBar}>
          {Array.from({ length: segments }).map((_, i) => (
            <View
              key={i}
              style={[styles.seg, i < filledSegments && { backgroundColor: profile.accent }]}
            />
          ))}
        </View>
        <Text style={styles.segLabel}>{percent}% saved</Text>
        <Text style={[styles.paceLine, pace.state === 'behind' && styles.paceLineBehind]}>{pace.message}</Text>

        {streakBroken ? (
          <View style={styles.reassureCard}>
            <Text style={styles.reassureText}>
              Your streak reset a few days ago — that's okay. The ${goal.saved} and {profile.gems} gems you've
              already banked are still yours. Confirm today's contribution to start the next one.
            </Text>
          </View>
        ) : null}

        <View style={styles.statTrio}>
          <Pulse dep={profile.streak} style={styles.statItem}>
            <Text style={styles.statNum}>🔥 {profile.streak}</Text>
            <Text style={styles.statLbl}>day streak</Text>
          </Pulse>
          <Pulse dep={profile.gems} style={styles.statItem}>
            <Text style={styles.statNum}>💎 {profile.gems}</Text>
            <Text style={styles.statLbl}>gems</Text>
          </Pulse>
          <Pulse dep={profile.freezesLeft} style={styles.statItem}>
            <Text style={styles.statNum}>❄️ {profile.freezesLeft}</Text>
            <Text style={styles.statLbl}>freeze left</Text>
          </Pulse>
        </View>

        {profile.freezesLeft > 0 ? (
          <GhostButton title="Use a streak freeze" onPress={applyFreeze} />
        ) : (
          <Text style={styles.freezeExhausted}>
            No freezes left this period — they refresh every 2 months.
          </Text>
        )}

        {profile.worker === 'platform' ? <CpfSnapshot /> : null}

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

        <GhostButton
          title={attached ? '✅ Screenshot attached' : '📷  Add screenshot (optional)'}
          onPress={() => setAttached((v) => !v)}
        />
        <PrimaryButton title="Confirm by 23:59" onPress={handleConfirm} disabled={!Number(amount)} color={profile.accent} />

        <SectionLabel>Sub-goal checkpoints</SectionLabel>
        <Card style={{ paddingVertical: 4 }}>
          {goal.checkpoints.map((c, i) => {
            const done = goal.saved >= c.amount;
            const prevAmount = i === 0 ? 0 : goal.checkpoints[i - 1].amount;
            const inProgress = !done && goal.saved >= prevAmount;
            return (
              <View
                key={c.label}
                style={[styles.checkpoint, i === goal.checkpoints.length - 1 && { borderBottomWidth: 0 }]}
              >
                <Text style={styles.checkpointLabel}>
                  {c.label} — ${c.amount}
                </Text>
                {done ? (
                  <View style={styles.doneChip}>
                    <Text style={styles.doneChipText}>Done</Text>
                  </View>
                ) : inProgress ? (
                  <Text style={styles.progressText}>In progress</Text>
                ) : (
                  <Text style={styles.upcomingText}>Upcoming</Text>
                )}
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sage },
  scroll: { padding: 18, paddingBottom: 100 },
  backRow: { paddingVertical: 8 },
  backText: { ...type.subheading, color: colors.ink },
  title: { ...type.h1, color: colors.ink, marginTop: 12 },
  sub: { ...type.caption, color: colors.textDim, marginTop: 2 },
  segBar: { flexDirection: 'row', gap: 4, marginTop: 16 },
  seg: { flex: 1, height: 10, borderRadius: 4, backgroundColor: colors.line },
  segLabel: { ...type.caption, color: colors.textDim, marginTop: 6 },
  paceLine: {
    ...type.caption,
    fontWeight: '600',
    color: colors.jadeDark,
    backgroundColor: 'rgba(30,138,102,0.10)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 11,
    marginTop: 10,
  },
  paceLineBehind: {
    color: colors.coral,
    backgroundColor: 'rgba(255,107,71,0.10)',
  },
  reassureCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  reassureText: { ...type.caption, color: colors.ink, lineHeight: 18 },
  statTrio: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { ...type.h2, color: colors.ink },
  statLbl: { ...type.micro, color: colors.textDim, marginTop: 2, fontWeight: '500' },
  freezeExhausted: { ...type.caption, color: colors.textDim, textAlign: 'center', marginTop: 12 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginTop: 6,
  },
  inputPrefix: { fontWeight: '700', color: colors.textDim, marginRight: 6, ...type.body },
  input: { ...type.bodyStrong, color: colors.ink, flex: 1, padding: 0 },
  checkpoint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  checkpointLabel: { ...type.caption, color: colors.ink, fontWeight: '600' },
  doneChip: { backgroundColor: 'rgba(30,138,102,0.14)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 9 },
  doneChipText: { color: colors.jadeDark, ...type.micro },
  progressText: { ...type.micro, color: colors.ink },
  upcomingText: { ...type.micro, color: colors.textDim, fontWeight: '500' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,24,22,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
  },
  modalKicker: { ...type.caption, color: colors.coral, fontWeight: '700' },
  modalTitle: { ...type.h2, color: colors.ink, marginTop: 4, marginBottom: 10 },
  modalBody: { ...type.body, color: colors.ink, lineHeight: 20, marginBottom: 10 },
  modalDismiss: { alignItems: 'center', paddingVertical: 12, marginTop: 2 },
  modalDismissText: { ...type.caption, color: colors.textDim, fontWeight: '600' },
});
