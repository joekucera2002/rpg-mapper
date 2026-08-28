import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import { Toast, ToastType, useToastStore } from '../../store/toastStore';

function toastColors(type: ToastType) {
  switch (type) {
    case 'error':
      return {
        border: colors.red,
        icon: colors.red,
        iconName: 'alert-circle-outline' as const,
        bg: 'rgba(232,64,64,0.1)',
      };
    case 'success':
      return {
        border: '#4a9940',
        icon: '#7bc464',
        iconName: 'checkmark-circle-outline' as const,
        bg: 'rgba(74,153,64,0.1)',
      };
    case 'info':
    default:
      return {
        border: colors.border2,
        icon: colors.text2,
        iconName: 'information-circle-outline' as const,
        bg: colors.surface2,
      };
  }
}

function ToastItem({ toast }: { toast: Toast }) {
  const { hideToast } = useToastStore();
  const [translateY] = useState(() => new Animated.Value(100));
  const [opacity] = useState(() => new Animated.Value(0));
  const tc = toastColors(toast.type);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, opacity]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          borderColor: tc.border,
          backgroundColor: tc.bg,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      testID={`toast-${toast.id}`}
    >
      <Ionicons name={tc.iconName} size={16} color={tc.icon} style={styles.icon} />
      <Text style={styles.message} testID="toast-message">
        {toast.message}
      </Text>
      <TouchableOpacity
        onPress={() => hideToast(toast.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        testID="toast-dismiss"
      >
        <Ionicons name="close" size={14} color={colors.text3} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();

  if (!toasts.length) return null;

  return (
    <View style={styles.container} pointerEvents="box-none" testID="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
    zIndex: 9999,
  },
  icon: {
    marginRight: 6,
  },
  message: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: colors.surface2,
    maxWidth: 480,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
