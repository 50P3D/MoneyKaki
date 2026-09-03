import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoalCard from '../components/GoalCard';
import { Card, SectionLabel, StreakPill } from '../components/Common';
import { colors } from '../theme/tokens';

export const GOAL = {
  title: 'Bali Trip',
  saved: 696,
  target: 1200,
  percent: 58,
  daysLeft: 62,
  suggested: 12,
};

const FRIENDS = [
  { initials: 'ME', name: 'Mei', streak: 9 },
  { initials: 'AI', name: 'Aidil', streak: 21 },
  { initials: 'ZC', name: 'Zach', streak: 6 },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.greet}>Hi, Aisyah 👋</Text>
          <StreakPill days={14} />
        </View>

        <GoalCard goal={GOAL} onPress={() => navigation.navigate('GoalDetail', { goal: GOAL })} />

        <SectionLabel action="View all" onAction={() => navigation.navigate('Ledger')}>
          Commitment Ledger
        </SectionLabel>
        <Card onPress={() => navigation.navigate('Ledger')}>
          <Text style={styles.ledgerLbl}>NEXT 12 MONTHS</Text>
          <Text style={styles.ledgerVal}>$4,820</Text>
        </Card>

        <SectionLabel action="See all" onAction={() => navigation.navigate('Kakis')}>
          Kakis on a streak
        </SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
          {FRIENDS.map((f) => (
            <View key={f.name} style={styles.friendChip}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{f.initials}</Text>
              </View>
              <Text style={styles.fname}>{f.name}</Text>
              <Text style={styles.fstreak}>🔥 {f.streak}d</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sage },
  scroll: { padding: 18, paddingBottom: 100 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  greet: { fontSize: 19, fontWeight: '600', color: colors.ink },
  ledgerLbl: { fontSize: 11, fontWeight: '600', color: colors.textDim },
  ledgerVal: { fontSize: 20, fontWeight: '700', color: colors.ink, marginTop: 3 },
  friendChip: { alignItems: 'center', width: 62, marginRight: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  fname: { fontSize: 10.5, fontWeight: '600', color: colors.ink, textAlign: 'center' },
  fstreak: { fontSize: 9.5, color: colors.textDim },
});
