import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ProgressRing({
  percent = 0,
  size = 78,
  strokeWidth = 8,
  label = 'saved',
  trackColor = 'rgba(255,255,255,0.28)',
  fillColor = '#fff',
  textColor = '#fff',
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  const animated = useRef(new Animated.Value(0)).current;
  const displayPercent = useRef(new Animated.Value(0)).current;
  const [shownPercent, setShownPercent] = React.useState(Math.round(clamped));

  useEffect(() => {
    Animated.timing(animated, {
      toValue: clamped,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // strokeDashoffset can't use the native driver
    }).start();
    const id = displayPercent.addListener(({ value }) => setShownPercent(Math.round(value)));
    Animated.timing(displayPercent, {
      toValue: clamped,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => displayPercent.removeListener(id);
  }, [clamped]);

  const strokeDashoffset = animated.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={fillColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}, ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.percent, { color: textColor }]}>{shownPercent}%</Text>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
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
  percent: { fontWeight: '700', fontSize: 16 },
  label: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
});
