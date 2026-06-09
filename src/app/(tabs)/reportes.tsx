import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SaleRepository } from "../../database/repositories/saleRepository";
import { MetodoPagoRepository } from "../../database/repositories/metodoPagoRepository";
import SalesCard from "../../componentes/SalesCard";
import { IVenta, MetodoPagoItem } from "../../componentes/SalesHistory";
import { FontAwesome5 } from "@expo/vector-icons";
import { PrintSalesReport } from "../../print_service/Print";

export default function Reportes() {
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [sales, setSales] = useState<IVenta[]>([]);
  const [totalPeriodo, setTotalPeriodo] = useState(0);
  const [loading, setLoading] = useState(false);

  const generarReporte = async () => {
    // 1. Validaciones de integridad
    if (!dateStart.trim() || !dateEnd.trim()) {
      Alert.alert(
        "Campos vacíos",
        "Por favor ingresa el rango de fechas (AAAA-MM-DD)."
      );
      return;
    }

    if (dateStart > dateEnd) {
      Alert.alert(
        "Rango Inválido",
        "La fecha de inicio no puede ser mayor a la fecha final."
      );
      return;
    }

    const hoy = new Date().toISOString().split("T")[0];
    if (dateEnd > hoy) {
      Alert.alert(
        "Fecha Futura",
        "No puedes consultar ventas que aún no han ocurrido."
      );
      return;
    }

    // 2. Consulta a Base de Datos
    setLoading(true);
    try {
      // Usamos el repositorio con el filtro de fechas
      const data = (await SaleRepository.getReportByDateRange(
        dateStart,
        dateEnd
      )) as IVenta[];
      for (const venta of data) {
        const metodos = await MetodoPagoRepository.getByVentaId(venta.id);
        venta.metodos_pago = metodos as MetodoPagoItem[];
      }
      setSales(data);

      // Calculamos el total (solo sumamos ventas activas, estado === false)
      const sum = data.reduce(
        (acc, current) => acc + (current.estado ? 0 : current.total),
        0
      );
      setTotalPeriodo(sum);

      if (data.length === 0) {
        Alert.alert("Info", "No se encontraron registros en estas fechas.");
      }
    } catch (error) {
      Alert.alert("Error SQL", "Hubo un fallo al obtener los datos: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reportes Administrativos</Text>

      {/* Panel de Filtros */}
      <View style={styles.filterContainer}>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha Inicial:</Text>
            <TextInput
              style={styles.input}
              value={dateStart}
              onChangeText={setDateStart}
              placeholder="2026-05-01"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha Final:</Text>
            <TextInput
              style={styles.input}
              value={dateEnd}
              onChangeText={setDateEnd}
              placeholder="2026-05-31"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.btnConsultar}
            onPress={generarReporte}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesome5 name="search-dollar" size={16} color="white" />
                <Text style={styles.btnText}> Consultar</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btnExportar,
              sales.length === 0 && styles.btnDisabled,
            ]}
            onPress={() =>
              PrintSalesReport(sales, totalPeriodo, dateStart, dateEnd)
            }
            disabled={sales.length === 0 || loading}
          >
            <FontAwesome5 name="file-pdf" size={16} color="white" />
            <Text style={styles.btnText}> Exportar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Resumen Financiero */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>TOTAL RECAUDADO (NETO)</Text>
        <Text style={styles.summaryAmount}>C$ {totalPeriodo.toFixed(2)}</Text>
      </View>

      {/* Lista de Resultados */}
      <FlatList
        data={sales}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SalesCard
            item={item}
            anularVenta={() => {}}
            printVoucher={() => {}}
            zone="reporte"
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No hay datos para mostrar</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f2f2f2" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#1a1a1a",
  },
  filterContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  inputGroup: { width: "48%" },
  label: { fontSize: 12, color: "#777", marginBottom: 4 },
  input: {
    borderBottomWidth: 1,
    borderColor: "#0ab546",
    paddingVertical: 6,
    fontSize: 16,
  },
  actionButtons: { flexDirection: "row", gap: 10 },
  btnConsultar: {
    flex: 1,
    backgroundColor: "#0ab546",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  btnExportar: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  btnDisabled: { backgroundColor: "#ccc" },
  btnText: { color: "#fff", fontWeight: "bold" },
  summaryCard: {
    backgroundColor: "#1a1a1a",
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
    borderLeftWidth: 5,
    borderLeftColor: "#0ab546",
  },
  summaryLabel: { color: "#0ab546", fontSize: 11, fontWeight: "bold" },
  summaryAmount: { color: "#fff", fontSize: 30, fontWeight: "bold" },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#999",
    fontStyle: "italic",
  },
});
