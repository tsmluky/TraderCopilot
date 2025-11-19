import { View, Button, Share } from 'react-native';
import Markdown from 'react-native-markdown-display';
import * as Clipboard from 'expo-clipboard';
import React from 'react';

export function MarkdownCard({ text }: { text: string }) {
  const copy = async () => Clipboard.setStringAsync(text);
  const share = async () => Share.share({ message: text });
  return (
    <View style={{ gap: 12, padding: 14, borderRadius: 16, backgroundColor: '#111318' }}>
      <Markdown>{text}</Markdown>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title='Copiar' onPress={copy} />
        <Button title='Compartir' onPress={share} />
      </View>
    </View>
  );
}
