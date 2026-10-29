import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSettings } from '@/context/SettingsContext';
import { AppText } from './AppText';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AppScreen({ title, subtitle, children }: Props) {
  const { colors } = useSettings();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <AppText variant="title">{title}</AppText>
            {subtitle ? <AppText variant="muted">{subtitle}</AppText> : null}
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  header: {
    gap: 6,
    marginBottom: 4,
  },
});
