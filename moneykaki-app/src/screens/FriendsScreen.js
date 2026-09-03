import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, SectionLabel, GhostButton } from '../components/Common';
import { colors, radius } from '../theme/tokens';

const FRIENDS = [
  { initials: 'ME', name: 'Mei', streak: 9, isYou: false },
  { initials: 'AI', name: 'Aidil', streak: 21, isYou: false },
  { initials: 'YOU', name: 'You', streak: 14, isYou: true },
];

export default function FriendsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.greet}>Your Kakis</Text>
        <Text style={styles.subhead}>Streaks are visible. Balances never are.</Text>

        <Card style={{ paddingVertical: 4 }}>
          {FRIENDS.map((f, i) => (
            <View
              key={f.name}
              style={[styles.friendRow, i === FRIENDS.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={styles.friendLeft}>
                <View style={[styles.avatar, f.isYou && { backgroundColor: colors.jade }]}>
                  <Text style={styles.avatarText}>{f.initials}</Text>
                </View>
                <View>
                  <Text style={styles.fname}>{f.name}</Text>
                  <Text style={styles.fstreak}>🔥 {f.streak}-day streak</Text>
                </View>
              </View>
              {f.isYou ? (
                <Text style={styles.youLabel}>That's you!</Text>
              ) : (
                <TouchableOpacity style={styles.nudgeBtn}>
                  <Text style={styles.nudgeBtnText}>Nudge</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </Card>

        <SectionLabel>Public commitment pots</SectionLabel>
        <View style={styles.potCard}>
          <Text style={styles.potTitle}>🏆 Emergency Fund</Text>
          <Text style={styles.potAmt}>$650 pledged</Text>
          <Text style={styles.potSub}>Spoken for — visible to Mei, Aidil &amp; Zach</Text>
        </View>

        <GhostButton title="+ Add a Kaki" onPress={() => {}} style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sage },
  scroll: { padding: 18, paddingBottom: 100 },
  greet: { fontSize: 19, fontWeight: '600', color: colors.ink, marginTop: 4 },
  subhead: { fontSize: 12, color: colors.textDim, marginTop: 2 },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  friendLeft: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 12.5 },
  fname: { fontSize: 13, fontWeight: '600', color: colors.ink },
  fstreak: { fontSize: 11, color: colors.textDim, marginTop: 1 },
  youLabel: { fontSize: 11, color: colors.textDim, fontWeight: '600' },
  nudgeBtn: {
    borderWidth: 1,
    borderColor: colors.jade,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  nudgeBtnText: { color: colors.jadeDark, fontSize: 11, fontWeight: '700' },
  potCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.gold,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 10,
  },
  potTitle: { fontWeight: '600', fontSize: 13, color: colors.ink },
  potAmt: { fontSize: 18, fontWeight: '700', color: colors.jadeDark, marginTop: 4 },
  potSub: { fontSize: 10.5, color: colors.textDim, marginTop: 3 },
});
