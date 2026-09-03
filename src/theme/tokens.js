export const colors = {
  ink: '#0E2438',
  inkSoft: '#2C4058',
  sage: '#EAF0EA',
  surface: '#FFFFFF',
  jade: '#1E8A66',
  jadeDark: '#166B4F',
  coral: '#FF6B47',
  gold: '#F0B429',
  amber: '#D69423',
  amberDark: '#9C6414',
  chartBlue: '#3B7DD8',
  chartPlum: '#8E5DB0',
  line: 'rgba(14,36,56,0.12)',
  textDim: 'rgba(14,36,56,0.62)',
};

export const radius = {
  lg: 22,
  md: 14,
  sm: 9,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
};

// Central type scale. Every screen should pull sizes from here instead of
// hardcoding fontSize inline, so the whole app can be resized in one place.
// Minimums follow common mobile-readability guidance: 16px for anything a
// user is meant to actually read at length, 13px floor for meta/caption text.
export const type = {
  display: { fontSize: 30, fontWeight: '700' }, // big headline numbers
  h1: { fontSize: 22, fontWeight: '700' }, // page/screen titles
  h2: { fontSize: 17, fontWeight: '600' }, // card titles
  subheading: { fontSize: 15, fontWeight: '600' }, // section labels
  body: { fontSize: 15, fontWeight: '400' }, // primary readable text
  bodyStrong: { fontSize: 15, fontWeight: '700' },
  caption: { fontSize: 13, fontWeight: '500' }, // secondary/meta text
  micro: { fontSize: 11.5, fontWeight: '600' }, // smallest labels (badges, pills)
};

// Minimum comfortable touch target (Apple HIG / Material both land near here).
export const minTouchTarget = 44;

// Categorical palette for breakdown charts (DonutChart). Cycles in order —
// chosen from colors already used elsewhere in the app plus two neutral
// extras, so a multi-slice chart still reads as "this app" rather than a
// generic charting-library default.
export const chartPalette = [colors.jade, colors.amber, colors.coral, colors.chartBlue, colors.chartPlum, colors.inkSoft];

// Fixed colors for ledger-charge categories, used by the "Where it goes"
// Sankey on the Ledger screen. Deliberately distinct from colors.jade/amber
// (those are reserved for the active profile's identity) so the two color
// systems never get confused for one another.
export const categoryColors = {
  essential: colors.chartBlue,
  subscription: colors.chartPlum,
  debt: colors.coral,
};
export const categoryLabels = {
  essential: 'Essentials',
  subscription: 'Subscriptions',
  debt: 'Debt / BNPL',
};


