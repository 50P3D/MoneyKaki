import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoalCard from '../components/GoalCard';
import { Card, SectionLabel, StreakPill, GhostButton, FormSheet, Pulse } from '../components/Common';
import { colors, type } from '../theme/tokens';
import { useApp, useProfile, useActiveGoal, useLedgerTotal } from '../state/AppState';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen({ navigation }) {
  const { state, setActiveGoal, addGoal, switchProfile } = useApp();
  const profile = useProfile();
  const activeGoal = useActiveGoal();
  const ledgerTotal = useLedgerTotal();
  const [addGoalVisible, setAddGoalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSwitchRow}>
          <Text style={styles.profileSwitchLabel}>Demo — viewing as</Text>
          <View style={styles.profileChips}>
            {Object.values(state.profiles).map((p) => (
              <TouchableOpacity
                key={p.id}
                activeOpacity={0.8}
                onPress={() => switchProfile(p.id)}
                style={[styles.profileChip, p.id === profile.id && styles.profileChipActive]}
              >
                <View style={[styles.profileDot, { backgroundColor: p.gradient[0] }]} />
                <Text style={[styles.profileChipText, p.id === profile.id && styles.profileChipTextActive]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.headerRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.greet}>{greeting()}, {profile.name} 👋</Text>
            <Text style={styles.tagline}>{profile.tagline}</Text>
          </View>
          <Pulse dep={profile.streak}>
            <StreakPill days={profile.streak} broken={profile.streakStatus === 'broken'} accentColor={profile.accent} />
          </Pulse>
        </View>

        {profile.goals.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {profile.goals.map((g) => (
              <TouchableOpacity
                key={g.id}
                activeOpacity={0.8}
                style={[styles.goalChip, g.id === activeGoal.id && styles.goalChipActive]}
                onPress={() => setActiveGoal(g.id)}
              >
                <Text style={[styles.goalChipText, g.id === activeGoal.id && styles.goalChipTextActive]}>
                  {g.emoji} {g.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        <GoalCard
          goal={activeGoal}
          gradient={profile.gradient}
          statusLabel={profile.statusLabel}
          onPress={() => navigation.navigate('GoalDetail', { goalId: activeGoal.id })}
        />
        <GhostButton title="+ New goal" onPress={() => setAddGoalVisible(true)} />

        <SectionLabel action="View all" onAction={() => navigation.navigate('Ledger')}>
          Commitment Ledger
        </SectionLabel>
        <Card onPress={() => navigation.navigate('Ledger')}>
          <Text style={styles.ledgerLbl}>NEXT 12 MONTHS</Text>
          <Pulse dep={ledgerTotal}>
            <Text style={styles.ledgerVal}>${ledgerTotal.toFixed(0)}</Text>
          </Pulse>
        </Card>

        <SectionLabel action="See all" onAction={() => navigation.navigate('Kakis')}>
          Kakis on a streak
        </SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
          {state.friends.map((f) => (
            <View key={f.id} style={styles.friendChip}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{f.initials}</Text>
              </View>
              <Text style={styles.fname}>{f.name}</Text>
              <Text style={styles.fstreak}>🔥 {f.streak}d</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      <FormSheet
        visible={addGoalVisible}
        title="New savings goal"
        submitLabel="Create goal"
        fields={[
          { key: 'title', label: 'What are you saving for?', placeholder: 'e.g. New laptop' },
          { key: 'target', label: 'Target amount ($)', placeholder: '500', keyboardType: 'numeric' },
          { key: 'daysLeft', label: 'Days to reach it', placeholder: '60', keyboardType: 'numeric' },
        ]}
        onSubmit={(values) => {
          addGoal({
            title: values.title,
            target: Number(values.target),
            daysLeft: Number(values.daysLeft),
          });
          setAddGoalVisible(false);
        }}
        onClose={() => setAddGoalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sage },
  scroll: { padding: 18, paddingBottom: 100 },
  profileSwitchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileSwitchLabel: { ...type.micro, color: colors.textDim, fontWeight: '600' },
  profileChips: { flexDirection: 'row', gap: 6 },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  profileDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  profileChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  profileChipText: { ...type.micro, color: colors.ink, fontWeight: '700' },
  profileChipTextActive: { color: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  greet: { ...type.h1, color: colors.ink },
  tagline: { ...type.caption, color: colors.textDim, marginTop: 2 },
  goalChip: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  goalChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  goalChipText: { ...type.caption, color: colors.ink, fontWeight: '700' },
  goalChipTextActive: { color: '#fff' },
  ledgerLbl: { ...type.micro, color: colors.textDim },
  ledgerVal: { ...type.h1, color: colors.ink, marginTop: 3 },
  friendChip: { alignItems: 'center', width: 68, marginRight: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  fname: { ...type.caption, color: colors.ink, textAlign: 'center' },
  fstreak: { ...type.micro, color: colors.textDim, fontWeight: '500' },
});
