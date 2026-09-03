import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Easing,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { colors, radius, type, minTouchTarget } from '../theme/tokens';
import { useApp } from '../state/AppState';

export function Card({ children, style, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={[styles.card, style]} onPress={onPress} activeOpacity={onPress ? 0.85 : 1}>
      {children}
    </Wrapper>
  );
}

export function SectionLabel({ children, action, onAction }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{children}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.link}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function StreakPill({ days, broken, accentColor }) {
  return (
    <View
      style={[
        styles.streakPill,
        accentColor && !broken && { backgroundColor: accentColor },
        broken && styles.streakPillBroken,
      ]}
    >
      <Text style={[styles.streakPillText, broken && styles.streakPillTextBroken]}>
        {broken ? '🔄' : '🔥'} {days} {broken ? 'day restart' : 'days'}
      </Text>
    </View>
  );
}

export function PrimaryButton({ title, onPress, style, disabled, color }) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, color && { backgroundColor: color }, disabled && styles.btnDisabled, style]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      <Text style={styles.primaryBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function GhostButton({ title, onPress, style, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.ghostBtn, disabled && styles.btnDisabled, style]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      <Text style={styles.ghostBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

// Small scale-pulse used to make a stat feel alive when it changes
// (streak/gems ticking up, progress moving). Cheap, no extra deps.
export function usePulse(dep) {
  const scale = useRef(new Animated.Value(1)).current;
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.18, duration: 140, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
  }, [dep]);
  return scale;
}

export function Pulse({ dep, children, style }) {
  const scale = usePulse(dep);
  return <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>;
}

// Global toast — driven off shared app state so any screen can trigger one
// with `showToast('message')` and it renders once at the app root.
export function ToastHost() {
  const { state, hideToast } = useApp();
  const { toast } = state;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (!toast) return undefined;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => hideToast());
    }, 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <View pointerEvents="none" style={styles.toastWrap}>
      <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.toastText}>{toast.message}</Text>
      </Animated.View>
    </View>
  );
}

// A single, contextual pointer to a real official resource (CPF Board,
// MAS/MoneySense, etc). Deliberately NOT a resources/FAQ page — screens
// render at most one of these, only when it's actually relevant to what's
// on screen (e.g. only shown to a platform worker, or only when a BNPL
// charge exists), and it opens straight out to the real source.
export function ResourceTip({ source, text, ctaLabel, url, style }) {
  return (
    <View style={[styles.resourceTip, style]}>
      <Text style={styles.resourceTipSource}>{source}</Text>
      <Text style={styles.resourceTipText}>{text}</Text>
      <TouchableOpacity onPress={() => Linking.openURL(url)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.resourceTipCta}>{ctaLabel} ↗</Text>
      </TouchableOpacity>
    </View>
  );
}

// Reusable bottom-sheet-style form modal, used for "+ New goal" and
// "+ Add a Kaki" so those actions do something instead of being no-ops.
export function FormSheet({ visible, title, fields, submitLabel = 'Save', onSubmit, onClose }) {
  const [values, setValues] = useState({});

  useEffect(() => {
    if (visible) {
      const initial = {};
      fields.forEach((f) => {
        if (f.defaultValue !== undefined) initial[f.key] = f.defaultValue;
        else if (f.type === 'select' && f.options?.length) initial[f.key] = f.options[0].value;
        else initial[f.key] = '';
      });
      setValues(initial);
    }
  }, [visible]);

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetBackdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{title}</Text>
          {fields.map((f) => (
            <View key={f.key} style={{ marginTop: 12 }}>
              <Text style={styles.sheetLabel}>{f.label}</Text>
              {f.type === 'select' ? (
                <View style={styles.sheetChipRow}>
                  {f.options.map((opt) => {
                    const active = values[f.key] === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.sheetChip, active && styles.sheetChipActive]}
                        onPress={() => setValues((prev) => ({ ...prev, [f.key]: opt.value }))}
                      >
                        <Text style={[styles.sheetChipText, active && styles.sheetChipTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <TextInput
                  style={styles.sheetInput}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.textDim}
                  keyboardType={f.keyboardType || 'default'}
                  value={values[f.key]}
                  onChangeText={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
                  autoFocus={f.autoFocus}
                />
              )}
            </View>
          ))}
          <View style={styles.sheetActions}>
            <GhostButton title="Cancel" onPress={onClose} style={{ flex: 1, marginRight: 8 }} />
            <PrimaryButton title={submitLabel} onPress={handleSubmit} style={{ flex: 1, marginLeft: 8 }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 16,
    marginTop: 14,
  },
  sectionRow: {
    marginTop: 22,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: { ...type.subheading, color: colors.ink },
  link: { ...type.caption, color: colors.jadeDark, fontWeight: '700' },
  streakPill: {
    backgroundColor: colors.ink,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  streakPillText: { color: '#fff', ...type.caption, fontWeight: '700' },
  streakPillBroken: { backgroundColor: 'rgba(255,107,71,0.16)' },
  streakPillTextBroken: { color: colors.coral },
  primaryBtn: {
    backgroundColor: colors.jade,
    borderRadius: radius.sm,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryBtnText: { color: '#fff', ...type.bodyStrong },
  ghostBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#fff',
  },
  ghostBtnText: { color: colors.ink, ...type.subheading },
  btnDisabled: { opacity: 0.45 },
  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 90,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  toast: {
    backgroundColor: colors.ink,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    maxWidth: '100%',
  },
  toastText: { color: '#fff', ...type.caption, fontWeight: '600', textAlign: 'center' },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(14,36,56,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 20,
    paddingBottom: 32,
  },
  sheetTitle: { ...type.h2, color: colors.ink },
  sheetLabel: { ...type.caption, color: colors.textDim, marginBottom: 6 },
  sheetInput: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...type.body,
    color: colors.ink,
    backgroundColor: '#fff',
  },
  sheetActions: { flexDirection: 'row', marginTop: 20 },
  sheetChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sheetChip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  sheetChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  sheetChipText: { ...type.caption, color: colors.ink, fontWeight: '600' },
  sheetChipTextActive: { color: '#fff' },
  resourceTip: {
    backgroundColor: 'rgba(240,180,41,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(240,180,41,0.35)',
    borderRadius: radius.md,
    padding: 14,
    marginTop: 12,
  },
  resourceTipSource: { ...type.micro, color: colors.ink, opacity: 0.6, marginBottom: 4 },
  resourceTipText: { ...type.caption, color: colors.ink, lineHeight: 18 },
  resourceTipCta: { ...type.caption, color: colors.jadeDark, fontWeight: '700', marginTop: 8 },
});
