import { View, Text } from "react-native";

export function SignalCard(props: {
  token: string; timeframe: string; ts: string;
  price: number | null; action: string; confidence: number | null; risk?: string | null;
}) {
  const Item = ({ label, value }: { label: string; value: string }) => (
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
      <Text style={{ fontWeight: "600", color: "white" }}>{label}</Text>
      <Text style={{ color: "white" }}>{value}</Text>
    </View>
  );
  return (
    <View style={{ padding: 14, borderRadius: 16, backgroundColor: "#111318", gap: 6 }}>
      <Item label="Token:" value={props.token} />
      <Item label="Timeframe:" value={props.timeframe} />
      <Item label="Hora:" value={new Date(props.ts).toLocaleTimeString()} />
      <Item label="Precio:" value={props.price != null ? String(props.price) : "N/D"} />
      <Item label="Acción:" value={props.action || "N/D"} />
      <Item label="Confianza:" value={props.confidence != null ? `${props.confidence}/100` : "N/D"} />
      <Item label="Riesgo:" value={props.risk || "N/D"} />
    </View>
  );
}
