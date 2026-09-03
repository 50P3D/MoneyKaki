import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, SectionLabel } from '../components/Common';
import { colors, radius } from '../theme/tokens';

const CHARGES = [
  { name: 'Netflix', yearly: 215.76, monthly: 17.98 },
  { name: 'Grab BNPL', yearly: 720.0, monthly: 60.0 },
  { name: 'Insurance', yearly: 2520.0, monthly: 210.0 },
  { name: 'Telco plan', yearly: 540.0, monthly: 45.0 },
];

// heights (0-1) for a 12-day sample of the 30-day view, and which are deduction / payday days
const CASHFLOW = [
  { h: 0.3 }, { h: 0.2 }, { h: 0.6, type: 'deduct' }, { h: 0.15 },
  { h: 0.25 }, { h: 0.7, type: 'deduct' }, { h: 0.2 }, { h: 1.0, type: 'payday' },
  { h: 0.2 }, { h: 0.35 }, { h: 0.55, type: 'deduct' }, { h: 0.18 },
];

export default function LedgerScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.greet}>Commitment Ledger</Text>

        <View style={styles.headline}>
          <Text style={styles.headlineLbl}>ALREADY COMMITTED, NEXT 12 MONTHS</Text>
          <Text style={styles.headlineBig}>$4,820</Text>
          <Text style={styles.headlineSub}>Before you add anything new</Text>
        </View>

        <SectionLabel>30-day cash flow vs payday</SectionLabel>
        <Card>
          <View style={styles.calStrip}>
            {CASHFLOW.map((bar, i) => (
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
        <Card style={{ paddingVertical: 4 }}>
          {CHARGES.map((c, i) => (
            <View
              key={c.name}
              style={[styles.chargeRow, i === CHARGES.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View>
                <Text style={styles.chargeName}>{c.name}</Text>
                <Text style={styles.chargeSub}>${c.yearly.toFixed(2)} this year</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.chargeAmt}>${c.monthly.toFixed(2)}/mo</Text>
                <TouchableOpacity>
                  <Text style={styles.cancelLink}>Cancel → pot</Text>
                </TouchableOpacity>
              </View>
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
  greet: { fontSize: 19, fontWeight: '600', color: colors.ink, marginTop: 4 },
  headline: { backgroundColor: colors.ink, borderRadius: radius.lg, padding: 18, marginTop: 14 },
  headlineLbl: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  headlineBig: { fontSize: 28, fontWeight: '700', color: '#fff', marginTop: 4 },
  headlineSub: { fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  calStrip: { flexDirection: 'row', gap: 3, alignItems: 'flex-end', height: 40 },
  calBar: { flex: 1, backgroundColor: colors.line, borderRadius: 3, minHeight: 4 },
  calLegend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 10, color: colors.textDim },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  chargeName: { fontSize: 13, fontWeight: '600', color: colors.ink },
  chargeSub: { fontSize: 10.5, color: colors.textDim, marginTop: 2 },
  chargeAmt: { fontSize: 13, fontWeight: '700', color: colors.ink },
  cancelLink: { fontSize: 10, color: colors.coral, fontWeight: '700', marginTop: 2 },
});
