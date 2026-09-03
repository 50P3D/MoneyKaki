import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, SectionLabel, Pulse, GhostButton, FormSheet, ResourceTip } from '../components/Common';
import SankeyFlow from '../components/SankeyFlow';
import { colors, radius, type, categoryColors, categoryLabels } from '../theme/tokens';
import { useApp, useProfile, useActiveGoal, useLedgerTotal, useCashflowBars } from '../state/AppState';

export default function LedgerScreen() {
  const { cancelCharge, addCharge } = useApp();
  const profile = useProfile();
  const activeGoal = useActiveGoal();
  const ledgerTotal = useLedgerTotal();
  const cashflow = useCashflowBars();
  const multiplier = activeGoal ? (ledgerTotal / activeGoal.target).toFixed(1) : null;
  const [addVisible, setAddVisible] = useState(false);
  const hasBnpl = profile.ledger.charges.some((c) => /bnpl/i.test(c.name));
  const categoryTotals = profile.ledger.charges.reduce((acc, c) => {
    const key = c.category || 'subscription';
    acc[key] = (acc[key] || 0) + c.monthly;
    return acc;
  }, {});
  const categoryNodes = Object.keys(categoryTotals).map((key) => ({
    key,
    label: categoryLabels[key] || key,
    value: categoryTotals[key],
    color: categoryColors[key] || colors.inkSoft,
  }));

  const confirmCancel = (charge) => {
    Alert.alert(
      `Cancel ${charge.name}?`,
      `$${charge.monthly.toFixed(2)}/mo will be redirected straight into ${activeGoal?.title ?? 'your goal'}.`,
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Cancel & redirect',
          style: 'destructive',
          onPress: () => cancelCharge(charge.id, activeGoal.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.greet}>Commitment Ledger</Text>

        <LinearGradient colors={profile.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headline}>
          <Text style={styles.headlineLbl}>ALREADY COMMITTED, NEXT 12 MONTHS</Text>
          <Pulse dep={ledgerTotal}>
            <Text style={styles.headlineBig}>${ledgerTotal.toFixed(0)}</Text>
          </Pulse>
          <Text style={styles.headlineSub}>
            {multiplier
              ? `That's ${multiplier}× your ${activeGoal.title} goal — before you add anything new`
              : 'Before you add anything new'}
          </Text>
        </LinearGradient>

        {categoryNodes.length > 0 ? (
          <>
            <SectionLabel>Where it goes</SectionLabel>
            <Card style={styles.sankeyCard}>
              <SankeyFlow
                nodes={categoryNodes}
                rootLabel="Committed"
                rootSub={`$${(ledgerTotal / 12).toFixed(0)}/mo`}
              />
            </Card>
          </>
        ) : null}

        <SectionLabel>30-day cash flow vs payday</SectionLabel>
        <Card>
          <View style={styles.calStrip}>
            {cashflow.map((bar, i) => (
              <View
                key={i}
                style={[
                  styles.calBar,
                  { height: `${bar.h * 100}%` },
                  bar.type === 'deduct' && { backgroundColor: colors.coral },
                  bar.type === 'payday' && { backgroundColor: colors.jade },
                ]}
              />
            ))}
          </View>
          <View style={styles.calLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: colors.coral }]} />
              <Text style={styles.legendText}>Deduction</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: colors.jade }]} />
              <Text style={styles.legendText}>Payday</Text>
            </View>
          </View>
        </Card>

        <SectionLabel>Recurring charges</SectionLabel>
        {profile.ledger.charges.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>Nothing left to trim — every charge you've cancelled is now feeding a goal.</Text>
          </Card>
        ) : (
          <Card style={{ paddingVertical: 4 }}>
            {profile.ledger.charges.map((c, i) => (
              <View
                key={c.id}
                style={[styles.chargeRow, i === profile.ledger.charges.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View>
                  <Text style={styles.chargeName}>{c.name}</Text>
                  <Text style={styles.chargeSub}>${(c.monthly * 12).toFixed(2)} this year</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.chargeAmt}>${c.monthly.toFixed(2)}/mo</Text>
                  <TouchableOpacity onPress={() => confirmCancel(c)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.cancelLink}>Cancel → pot</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Card>
        )}

        {hasBnpl ? (
          <ResourceTip
            source="🏛️ From MoneySense (MAS)"
            text={'A national survey found 27% of Buy Now, Pay Later users ended up financially worse off, mostly from overspending.'}
            ctaLabel="Read MoneySense's guide"
            url="https://www.moneysense.gov.sg/3-traps-to-avoid-when-you-go-shopping/"
          />
        ) : null}

        <GhostButton title="+ Add a recurring charge" onPress={() => setAddVisible(true)} />
      </ScrollView>

      <FormSheet
        visible={addVisible}
        title="Add a recurring charge"
        submitLabel="Add"
        fields={[
          { key: 'name', label: 'What is it?', placeholder: 'e.g. Spotify', autoFocus: true },
          { key: 'monthly', label: 'Monthly cost ($)', placeholder: '15', keyboardType: 'numeric' },
          {
            key: 'category',
            label: 'Category',
            type: 'select',
            options: [
              { value: 'essential', label: 'Essential' },
              { value: 'subscription', label: 'Subscription' },
              { value: 'debt', label: 'Debt / BNPL' },
            ],
          },
        ]}
        onSubmit={(values) => {
          addCharge(values.name, Number(values.monthly), values.category);
          setAddVisible(false);
        }}
        onClose={() => setAddVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sage },
  scroll: { padding: 18, paddingBottom: 100 },
  greet: { ...type.h1, color: colors.ink, marginTop: 4 },
  headline: { borderRadius: radius.lg, padding: 18, marginTop: 14 },
  sankeyCard: { alignItems: 'center', paddingVertical: 14 },
  headlineLbl: { ...type.micro, color: 'rgba(255,255,255,0.6)' },
  headlineBig: { ...type.display, color: '#fff', marginTop: 4 },
  headlineSub: { ...type.caption, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  calStrip: { flexDirection: 'row', gap: 3, alignItems: 'flex-end', height: 44 },
  calBar: { flex: 1, backgroundColor: colors.line, borderRadius: 3, minHeight: 4 },
  calLegend: { flexDirection: 'row', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { ...type.caption, color: colors.textDim },
  emptyText: { ...type.body, color: colors.textDim },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  chargeName: { ...type.subheading, color: colors.ink },
  chargeSub: { ...type.micro, color: colors.textDim, marginTop: 2, fontWeight: '500' },
  chargeAmt: { ...type.subheading, color: colors.ink },
  cancelLink: { ...type.micro, color: colors.coral, marginTop: 4 },
});
