import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, type } from '../theme/tokens';

// Generic multi-segment ring chart built on the same react-native-svg
// primitive as ProgressRing (stacked Circle strokes, no charting library —
// avoids adding a dependency in an environment where npm installs have
// been unreliable). `segments` is [{ label, value, color }]; values don't
// need to sum to 100 — they're normalized here.
export default function DonutChart({ segments, size = 108, strokeWidth = 16, centerLabel, centerSub }) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {total > 0 ? (
          segments.map((seg, i) => {
            const fraction = seg.value / total;
            const dash = fraction * circumference;
            const dashOffset = -cumulative * circumference;
            cumulative += fraction;
            return (
              <Circle
                key={`${seg.label}-${i}`}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={seg.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${dash}, ${circumference - dash}`}
                strokeDashoffset={dashOffset}
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
              />
            );
          })
        ) : (
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.line} strokeWidth={strokeWidth} fill="none" />
        )}
      </Svg>
      {centerLabel || centerSub ? (
        <View style={styles.center}>
          {centerLabel ? <Text style={styles.centerLabel}>{centerLabel}</Text> : null}
          {centerSub ? <Text style={styles.centerSub}>{centerSub}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

// Legend row list to pair with a DonutChart — separate so callers can format
// the trailing value however fits (a $ amount, a %, etc).
export function DonutLegend({ segments, total, formatValue }) {
  return (
    <View style={styles.legend}>
      {segments.map((seg, i) => (
        <View key={`${seg.label}-${i}`} style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
          <Text style={styles.legendLabel} numberOfLines={1}>
            {seg.label}
          </Text>
          <Text style={styles.legendValue}>
            {formatValue ? formatValue(seg.value, total) : seg.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: { ...type.h2, color: colors.ink },
  centerSub: { ...type.micro, color: colors.textDim, marginTop: 1 },
  legend: { marginTop: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 5, marginRight: 8 },
  legendLabel: { ...type.caption, color: colors.ink, flex: 1 },
  legendValue: { ...type.caption, color: colors.textDim, fontWeight: '600', marginLeft: 8 },
});
