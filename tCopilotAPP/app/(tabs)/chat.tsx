import { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView, Switch } from 'react-native';
import { useSession } from '../../src/store/session';
import { useLiteAnalyze, useProAnalyze } from '../../src/features/analyze/hooks';
import { SignalCard } from '../../src/components/SignalCard';
import { MarkdownCard } from '../../src/components/MarkdownCard';

export default function Chat() {
  const { token, timeframe, mode, setToken, toggleMode } = useSession();
  const [prompt, setPrompt] = useState('');
  const lite = useLiteAnalyze();
  const pro = useProAnalyze();

  const send = async () => {
    if (!prompt.trim()) return;
    if (mode === 'LITE') { await lite.mutateAsync({ token, timeframe, message: prompt }); }
    else { await pro.mutateAsync({ token, timeframe, message: prompt }); }
    setPrompt('');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0b0e14', padding: 16 }}>
      <View style={{ gap: 8, marginBottom: 12 }}>
        <Text style={{ color: 'white', fontWeight: '600' }}>Token:</Text>
        <TextInput value={token} onChangeText={setToken} style={{ backgroundColor: '#111318', color: 'white', padding: 10, borderRadius: 8 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: 'white' }}>LITE</Text>
          <Switch value={mode === 'PRO'} onValueChange={toggleMode} />
          <Text style={{ color: 'white' }}>PRO</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder='¿Qué deseas preguntar?'
          placeholderTextColor='#94a3b8'
          style={{ flex: 1, backgroundColor: '#111318', color: 'white', padding: 12, borderRadius: 12 }}
        />
        <Button title='Enviar' onPress={send} />
      </View>

      {mode === 'LITE' && lite.data && (
        <SignalCard
          token={lite.data.token}
          timeframe={lite.data.timeframe}
          ts={lite.data.ts}
          price={lite.data.price}
          action={lite.data.action}
          confidence={lite.data.confidence}
          risk={lite.data.risk}
        />
      )}

      {mode === 'PRO' && pro.data && <MarkdownCard text={pro.data.analysis_md} />}
    </ScrollView>
  );
}
