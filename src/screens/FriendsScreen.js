import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, SectionLabel, GhostButton, FormSheet } from '../components/Common';
import { colors, radius, type } from '../theme/tokens';
import { useApp, useProfile, useActiveGoal } from '../state/AppState';

function NudgeButton({ onPress }) {
  const [sent, setSent] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.nudgeBtn, sent && styles.nudgeBtnSent]}
      disabled={sent}
      onPress={() => {
        setSent(true);
        onPress();
        setTimeout(() => setSent(false), 2500);
      }}
    >
      <Text style={[styles.nudgeBtnText, sent && styles.nudgeBtnTextSent]}>{sent ? 'Nudged ✓' : 'Nudge'}</Text>
    </TouchableOpacity>
  );
}

export default function FriendsScreen() {
  const { state, nudgeFriend, addFriend, setAccountabilityPartner, removeAccountabilityPartner } = useApp();
  const profile = useProfile();
  const activeGoal = useActiveGoal();
  const [addVisible, setAddVisible] = useState(false);
  const [partnerVisible, setPartnerVisible] = useState(false);
  const partner = state.accountabilityPartner;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.greet}>Your Kakis</Text>
        <Text style={styles.subhead}>Streaks are visible. Balances never are.</Text>

        <Card style={{ paddingVertical: 4 }}>
          <View style={styles.friendRow}>
            <View style={styles.friendLeft}>
              <View style={[styles.avatar, { backgroundColor: profile.accent }]}>
                <Text style={styles.avatarText}>{profile.avatar}</Text>
              </View>
              <View>
                <Text style={styles.fname}>{profile.name}</Text>
                <Text style={styles.fstreak}>🔥 {profile.streak}-day streak</Text>
              </View>
            </View>
            <Text style={styles.youLabel}>That's you!</Text>
          </View>
          {state.friends.map((f, i) => (
            <View
              key={f.id}
              style={[styles.friendRow, i === state.friends.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={styles.friendLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{f.initials}</Text>
                </View>
                <View>
                  <Text style={styles.fname}>{f.name}</Text>
                  <Text style={styles.fstreak}>🔥 {f.streak}-day streak</Text>
                </View>
              </View>
              <NudgeButton onPress={() => nudgeFriend(f.id)} />
            </View>
          ))}
        </Card>

        <SectionLabel>Public commitment pots</SectionLabel>
        {activeGoal ? (
          <View style={styles.potCard}>
            <Text style={styles.potTitle}>🏆 {activeGoal.title}</Text>
            <Text style={[styles.potAmt, { color: profile.accent }]}>${activeGoal.saved} pledged</Text>
            <Text style={styles.potSub}>
              Spoken for — visible to {state.friends.map((f) => f.name).join(', ')}
            </Text>
          </View>
        ) : null}

        <GhostButton title="+ Add a Kaki" onPress={() => setAddVisible(true)} style={{ marginTop: 16 }} />

        <SectionLabel>Accountability partner</SectionLabel>
        {partner ? (
          <View style={styles.partnerCard}>
            <Text style={styles.partnerTitle}>👀 {partner.name}</Text>
            <Text style={styles.partnerSub}>
              Notified whenever a new recurring charge crosses ${partner.threshold}/mo
            </Text>
            <TouchableOpacity onPress={removeAccountabilityPartner} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.partnerRemove}>Remove partner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.partnerCard}>
            <Text style={styles.partnerSub}>
              An optional accountability partner (or parent) gets notified when a new commitment
              crosses a threshold you set — a Section 2 feature from the proposal that isn't wired
              up yet.
            </Text>
            <GhostButton title="+ Add accountability partner" onPress={() => setPartnerVisible(true)} />
          </View>
        )}
      </ScrollView>

      <FormSheet
        visible={addVisible}
        title="Add a Kaki"
        submitLabel="Add"
        fields={[{ key: 'name', label: 'Their name', placeholder: 'e.g. Priya', autoFocus: true }]}
        onSubmit={(values) => {
          addFriend(values.name);
          setAddVisible(false);
        }}
        onClose={() => setAddVisible(false)}
      />

      <FormSheet
        visible={partnerVisible}
        title="Add accountability partner"
        submitLabel="Save"
        fields={[
          { key: 'name', label: 'Their name', placeholder: 'e.g. Mum', autoFocus: true },
          { key: 'threshold', label: 'Alert threshold ($/mo)', placeholder: '100', keyboardType: 'numeric' },
        ]}
        onSubmit={(values) => {
          setAccountabilityPartner(values.name, Number(values.threshold));
          setPartnerVisible(false);
        }}
        onClose={() => setPartnerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sage },
  scroll: { padding: 18, paddingBottom: 100 },
  greet: { ...type.h1, color: colors.ink, marginTop: 4 },
  subhead: { ...type.caption, color: colors.textDim, marginTop: 2 },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  friendLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  fname: { ...type.subheading, color: colors.ink },
  fstreak: { ...type.caption, color: colors.textDim, marginTop: 1, fontWeight: '500' },
  youLabel: { ...type.caption, color: colors.textDim, fontWeight: '600' },
  nudgeBtn: {
    borderWidth: 1,
    borderColor: colors.jade,
    borderRadius: 20,
    minHeight: 36,
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  nudgeBtnSent: { borderColor: colors.line, backgroundColor: colors.sage },
  nudgeBtnText: { color: colors.jadeDark, ...type.caption, fontWeight: '700' },
  nudgeBtnTextSent: { color: colors.textDim },
  potCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.gold,
    borderRadius: radius.md,
    padding: 16,
    marginTop: 10,
  },
  potTitle: { ...type.subheading, color: colors.ink },
  potAmt: { ...type.h1, color: colors.jadeDark, marginTop: 4 },
  potSub: { ...type.caption, color: colors.textDim, marginTop: 4 },
  partnerCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 16,
    marginTop: 10,
  },
  partnerTitle: { ...type.subheading, color: colors.ink },
  partnerSub: { ...type.caption, color: colors.textDim, marginTop: 4, lineHeight: 18 },
  partnerRemove: { ...type.caption, color: colors.coral, fontWeight: '700', marginTop: 10 },
});
