import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerStyle: { backgroundColor: '#0b0e14' }, headerTintColor: 'white' }}>
      <Tabs.Screen name='chat' options={{ title: 'Chat' }} />
      <Tabs.Screen name='history' options={{ title: 'Historial' }} />
      <Tabs.Screen name='settings' options={{ title: 'Ajustes' }} />
    </Tabs>
  );
}
