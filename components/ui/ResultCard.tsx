import { StyleSheet, View } from 'react-native';

import { useSettings } from '@/context/SettingsContext';
import { AppText } from './AppText';

function money(value: number) {
  return `${value.toFixed(2)} €`;
}

type Props = {
  bruto: number;
  neto: number;
  totalDeducciones?: number;
  extra?: { label: string; value: string }[];
  avisos?: string[];
};

export function ResultCard({ bruto, neto, totalDeducciones, extra, avisos }: Props) {
  const { colors } = useSettings();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <AppText variant="subtitle">Resultado</AppText>
      <View style={styles.row}>
        <AppText variant="muted">Bruto</AppText>
        <AppText>{money(bruto)}</AppText>
      </View>
      {totalDeducciones != null ? (
        <View style={styles.row}>
          <AppText variant="muted">Deducciones</AppText>
          <AppText>{money(totalDeducciones)}</AppText>
        </View>
      ) : null}
      {extra?.map((item) => (
        <View key={item.label} style={styles.row}>
          <AppText variant="muted">{item.label}</AppText>
          <AppText>{item.value}</AppText>
        </View>
      ))}
      <View style={[styles.neto, { borderTopColor: colors.border }]}>
        <AppText variant="subtitle">Neto</AppText>
        <AppText variant="subtitle" style={{ color: colors.primary }}>
          {money(neto)}
        </AppText>
      </View>
      {avisos?.map((aviso) => (
        <AppText key={aviso} variant="muted">
          {aviso}
        </AppText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  neto: {
    borderTopWidth: 1,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
