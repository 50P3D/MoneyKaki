import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Card } from './Common';
import DonutChart, { DonutLegend } from './DonutChart';
import { colors, radius, type, chartPalette } from '../theme/tokens';

// Illustrative CPF snapshot for a platform/gig-worker profile.
//
// Deliberately NOT a calculator: MoneyKaki is a third-party app and has no
// business computing or reporting someone's actual CPF contribution. What
// this shows is the two OFFICIAL, PUBLISHED rate tables (contribution
// split, account allocation split) for one specific age band, each with an
// explicit source link, plus a prominent link out to CPF Board's own
// calculator for a real, personalised figure. "Apply, don't overstep" —
// the numbers here are public facts we're citing, not a result we computed.
//
// Figures below are for platform workers aged 35 & under who opted in
// (born on/after 1 Jan 1995), matching the Aisyah persona. Update the
// constants (and the citations) if this is reused for a different age band.
const CONTRIBUTION_SPLIT = [
  { label: 'You (platform worker)', value: 10.5, color: chartPalette[0] },
  { label: 'Platform operator', value: 3.5, color: chartPalette[3] },
];

const ALLOCATION_SPLIT = [
  { label: 'Ordinary Account', value: 62.2, color: chartPalette[0] },
  { label: 'MediSave Account', value: 21.6, color: chartPalette[1] },
  { label: 'Special Account', value: 16.2, color: chartPalette[3] },
];

const CONTRIBUTION_SOURCE_URL =
  'https://www.cpf.gov.sg/employer/platform-operators/obligations/how-much-cpf-contributions-to-pay-platform-workers';
const ALLOCATION_SOURCE_URL =
  'https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFAllocationRatesfromJanuary2026.pdf';
const CALCULATOR_URL =
  'https://www.cpf.gov.sg/member/tools-and-services/calculators/platform-worker-cpf-contribution-calculator';

export default function CpfSnapshot() {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>🇸🇬 CPF snapshot — illustrative</Text>
      <Text style={styles.subtitle}>For platform workers aged 35 & under who've opted in</Text>

      <View style={styles.row}>
        <DonutChart segments={CONTRIBUTION_SPLIT} size={92} strokeWidth={14} centerLabel="14%" centerSub="total" />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.chartLabel}>Who contributes</Text>
          <DonutLegend segments={CONTRIBUTION_SPLIT} formatValue={(v) => `${v}%`} />
        </View>
      </View>

      <View style={[styles.row, { marginTop: 16 }]}>
        <DonutChart segments={ALLOCATION_SPLIT} size={92} strokeWidth={14} centerLabel="3" centerSub="accounts" />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.chartLabel}>Where it's allocated</Text>
          <DonutLegend segments={ALLOCATION_SPLIT} formatValue={(v) => `${v}%`} />
        </View>
      </View>

      <Text style={styles.disclaimer}>
        These are CPF Board's own published rates, shown for context — not your actual contribution.
        MoneyKaki doesn't calculate or report CPF figures; get your real number from CPF Board directly.
      </Text>

      <TouchableOpacity onPress={() => Linking.openURL(CONTRIBUTION_SOURCE_URL)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
        <Text style={styles.sourceLink}>Source: CPF Board — platform worker contribution rates ↗</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL(ALLOCATION_SOURCE_URL)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
        <Text style={styles.sourceLink}>Source: CPF Board — account allocation rates (PDF) ↗</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.calcBtn} onPress={() => Linking.openURL(CALCULATOR_URL)} activeOpacity={0.85}>
        <Text style={styles.calcBtnText}>Get your exact numbers — CPF calculator ↗</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 14 },
  title: { ...type.subheading, color: colors.ink },
  subtitle: { ...type.micro, color: colors.textDim, marginTop: 2, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  chartLabel: { ...type.micro, color: colors.textDim, fontWeight: '700', marginBottom: 2 },
  disclaimer: { ...type.micro, color: colors.textDim, lineHeight: 16, marginTop: 16, fontWeight: '500' },
  sourceLink: { ...type.micro, color: colors.jadeDark, fontWeight: '700', marginTop: 8 },
  calcBtn: {
    marginTop: 14,
    backgroundColor: colors.ink,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  calcBtnText: { color: '#fff', ...type.caption, fontWeight: '700' },
});
