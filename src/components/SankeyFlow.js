import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors, type } from '../theme/tokens';

// A small, self-contained 2-column Sankey: one root node on the left
// (100% of the total, undivided) flowing into N category nodes on the
// right, each sized proportionally and separated by a gap — connected by
// curved ribbons. Built on plain react-native-svg (Path + Rect), no
// charting library.
//
// The curve isn't decorative: the left-side attachment points are
// contiguous (no gaps — they're slices of one continuous source), while
// the right-side nodes have padding between them, so their positions
// genuinely diverge from the left slice positions. That divergence is
// what makes the ribbon curve, exactly like a standard Sankey layout.
//
// `nodes`: [{ key, label, value, color }] — the right-hand column.
export default function SankeyFlow({ nodes, rootLabel, rootSub, width = 250, height = 190 }) {
  const total = nodes.reduce((sum, n) => sum + n.value, 0) || 1;
  const barWidth = 8;
  const x0 = 4;
  const x1 = width - 4;
  const gap = 8;
  const sx0 = x0 + barWidth;
  const sx1 = x1 - barWidth;
  const midX = (sx0 + sx1) / 2;

  // Left side: contiguous slices of the full height, in list order.
  let leftCursor = 0;
  const leftSlices = nodes.map((n) => {
    const h = (n.value / total) * height;
    const slice = { yStart: leftCursor, yEnd: leftCursor + h };
    leftCursor += h;
    return slice;
  });

  // Right side: padded bars, in the same order, rescaled to still fit `height`.
  const availableContent = Math.max(1, height - gap * Math.max(0, nodes.length - 1));
  let rightCursor = 0;
  const rightBars = nodes.map((n) => {
    const h = Math.max(10, (n.value / total) * availableContent);
    const bar = { yStart: rightCursor, yEnd: rightCursor + h };
    rightCursor += h + gap;
    return bar;
  });

  return (
    <View style={{ width, alignItems: 'center' }}>
      <View style={{ width, height }}>
        <Svg width={width} height={height}>
          <Rect x={x0} y={0} width={barWidth} height={height} rx={3} fill={colors.ink} />
          {nodes.map((n, i) => {
            const l = leftSlices[i];
            const r = rightBars[i];
            const d = `M ${sx0},${l.yStart} C ${midX},${l.yStart} ${midX},${r.yStart} ${sx1},${r.yStart} L ${sx1},${r.yEnd} C ${midX},${r.yEnd} ${midX},${l.yEnd} ${sx0},${l.yEnd} Z`;
            return <Path key={n.key} d={d} fill={n.color} opacity={0.32} />;
          })}
          {nodes.map((n, i) => {
            const r = rightBars[i];
            return (
              <Rect
                key={`bar-${n.key}`}
                x={sx1}
                y={r.yStart}
                width={barWidth}
                height={Math.max(2, r.yEnd - r.yStart)}
                rx={3}
                fill={n.color}
              />
            );
          })}
        </Svg>

        {/* root label, vertically centered on the left bar */}
        <View style={[styles.rootLabelBox, { top: height / 2 - 16 }]}>
          <Text style={styles.rootLabelText} numberOfLines={1}>
            {rootLabel}
          </Text>
          {rootSub ? (
            <Text style={styles.rootSubText} numberOfLines={1}>
              {rootSub}
            </Text>
          ) : null}
        </View>

        {/* category labels, one per right-hand bar */}
        {nodes.map((n, i) => {
          const r = rightBars[i];
          return (
            <View key={`label-${n.key}`} style={[styles.nodeLabelBox, { top: (r.yStart + r.yEnd) / 2 - 13 }]}>
              <Text style={styles.nodeLabelText} numberOfLines={1}>
                {n.label}
              </Text>
              <Text style={styles.nodeSubText} numberOfLines={1}>
                ${n.value.toFixed(0)}/mo
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootLabelBox: { position: 'absolute', left: 16, width: 74 },
  rootLabelText: { ...type.micro, color: colors.ink, fontWeight: '700' },
  rootSubText: { ...type.micro, color: colors.textDim, fontWeight: '500', marginTop: 1 },
  nodeLabelBox: { position: 'absolute', right: 14, width: 108, alignItems: 'flex-end' },
  nodeLabelText: { ...type.micro, color: colors.ink, fontWeight: '700', textAlign: 'right' },
  nodeSubText: { ...type.micro, color: colors.textDim, fontWeight: '500', textAlign: 'right', marginTop: 1 },
});
