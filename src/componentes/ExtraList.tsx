import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { useFocusEffect } from "expo-router";
import { VariosRepository } from "../database/repositories/variosRepository";

export default function ExtrasList() {
  const [extras, setExtras] = useState<any[]>([]);

  const cargarIngresos = async () => {
    const hoy = new Date().toISOString().split('T')[0];
    const data = await VariosRepository.getReportByDateRange(hoy, hoy);
    setExtras(data || []);
  };

  useFocusEffect(
    React.useCallback(() => {
      cargarIngresos();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingresos Varios del día</Text>
      <FlatList
        data={extras}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Aquí unimos descripción y motivo para que se vea completo */}
            <View>
              <Text style={styles.desc}>{item.descripcion}</Text>
              <Text style={styles.motivo}>{item.motivo}</Text>
            </View>
            <Text style={styles.monto}>C$ {item.monto.toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay ingresos registrados hoy</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#fff", margin: 10, borderRadius: 8, flex: 1 },
  title: { fontWeight: "bold", fontSize: 16, marginBottom: 10, color: "#333" },
  card: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  desc: { fontSize: 15, fontWeight: '600', color: "#333" },
  motivo: { fontSize: 12, color: "#888" },
  monto: { fontWeight: "bold", fontSize: 15, color: "#0ab546" },
  empty: { fontSize: 14, color: "#999", textAlign: "center", marginTop: 20 }
});