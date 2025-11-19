import { View, Text, FlatList } from 'react-native';
import { useSession } from '../../src/store/session';
import { useLogs } from '../../src/features/analyze/hooks';

export default function History() {
  const { token, mode } = useSession();
  const q = useLogs(token, mode);

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0e14', padding: 16 }}>
      <Text style={{ color: 'white', marginBottom: 10, fontWeight: '600' }}>
        Historial · {token} · {mode}
      </Text>
      <FlatList
        data={q.data || []}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderRadius: 12, backgroundColor: '#111318', marginBottom: 8 }}>
            <Text style={{ color: 'white' }}>{item.ts}</Text>
            <Text style={{ color: '#a3e635' }}>{item.action || item.token || ''}</Text>
          </View>
        )}
      />
    </View>
  );
}
