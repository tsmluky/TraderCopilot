import { View, Text } from 'react-native';

export default function Settings() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0b0e14', padding: 16, gap: 10 }}>
      <Text style={{ color: 'white', fontWeight: '600' }}>API Base</Text>
      <Text style={{ color: '#94a3b8' }}>{process.env.EXPO_PUBLIC_API_BASE}</Text>
      <Text style={{ color: '#64748b' }}>Edita el archivo .env y reinicia el bundler para cambiarlo.</Text>
    </View>
  );
}
