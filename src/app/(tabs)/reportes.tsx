import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SaleRepository } from "../../database/repositories/saleRepository";
import { VariosRepository } from "../../database/repositories/variosRepository";
import { MetodoPagoRepository } from "../../database/repositories/metodoPagoRepository";
import SalesCard from "../../componentes/SalesCard";
import { IVenta, MetodoPagoItem } from "../../componentes/SalesHistory";
import { FontAwesome5 } from "@expo/vector-icons";
import { PrintSalesReport } from "../../print_service/Print";

export default function Reportes() {
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [reportData, setReportData] = useState<any[]>([]);
  const [totalPeriodo, setTotalPeriodo] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [currentField, setCurrentField] = useState<"start" | "end">("start");

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString("en-CA");
      if (currentField === "start") setDateStart(formattedDate);
      else setDateEnd(formattedDate);
    }
  };

  const generarReporte = async () => {
    if (!dateStart || !dateEnd) {
      Alert.alert("Campos vacíos", "Por favor selecciona ambas fechas.");
      return;
    }

    if (dateStart > dateEnd) {
      Alert.alert(
        "Rango Inválido",
        "La fecha de inicio no puede ser mayor a la final."
      );
      return;
    }

    setLoading(true);
    try {
      const ventas = (await SaleRepository.getReportByDateRange(
        dateStart,
        dateEnd
      )) as IVenta[];
      const extras = (await VariosRepository.getReportByDateRange(
        dateStart,
        dateEnd
      )) as any[];

      for (const venta of ventas) {
        venta.metodos_pago = (await MetodoPagoRepository.getByVentaId(
          venta.id
        )) as MetodoPagoItem[];
      }

      const totalVentas = ventas.reduce(
        (acc, v) => acc + (v.estado ? 0 : v.total),
        0
      );
      const totalExtras = extras.reduce((acc, e) => acc + e.monto, 0);

      const combinado = [
        ...ventas.map((v) => ({ ...v, tipo: "venta" })),
        ...extras.map((e) => ({ ...e, tipo: "extra" })),
      ].sort(
        (a: any, b: any) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );

      setReportData(combinado);
      setTotalPeriodo(totalVentas + totalExtras);

      if (combinado.length === 0)
        Alert.alert("Info", "No se encontraron registros.");
    } catch (error) {
      Alert.alert("Error", "Fallo al obtener datos: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reportes Administrativos</Text>

      <View style={styles.filterContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.inputGroup}
            onPress={() => {
              setCurrentField("start");
              setShowPicker(true);
            }}
          >
            <Text style={styles.label}>Fecha Inicial:</Text>
            <Text style={styles.input}>{dateStart || "AAAA-MM-DD"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.inputGroup}
            onPress={() => {
              setCurrentField("end");
              setShowPicker(true);
            }}
          >
            <Text style={styles.label}>Fecha Final:</Text>
            <Text style={styles.input}>{dateEnd || "AAAA-MM-DD"}</Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

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
              reportData.length === 0 && styles.btnDisabled,
            ]}
            onPress={() =>
              PrintSalesReport(reportData, totalPeriodo, dateStart, dateEnd)
            }
            disabled={reportData.length === 0 || loading}
          >
            <FontAwesome5 name="file-pdf" size={16} color="white" />
            <Text style={styles.btnText}> Exportar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>TOTAL RECAUDADO (NETO)</Text>
        <Text style={styles.summaryAmount}>C$ {totalPeriodo.toFixed(2)}</Text>
      </View>

      <FlatList
        data={reportData}
        keyExtractor={(item, index) => `${item.tipo}-${item.id || index}`}
        renderItem={({ item }) =>
          item.tipo === "venta" ? (
            <View style={styles.cardVenta}>
              <SalesCard
                item={item}
                anularVenta={() => {}}
                printVoucher={() => {}}
                zone="reporte"
              />
            </View>
          ) : (
            <View style={styles.cardExtra}>
              <Text style={styles.name}>Venta Extra: {item.descripcion}</Text>
              <Text style={styles.motivo}>{item.motivo}</Text>
              <Text style={styles.monto}>C$ {item.monto.toFixed(2)}</Text>
            </View>
          )
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
    color: "#1a1a1a",
    marginBottom: 15,
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
  label: { fontSize: 12, color: "#777" },
  input: {
    borderBottomWidth: 1,
    borderColor: "#0ab546",
    paddingVertical: 6,
    fontSize: 16,
    color: "#333",
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
  cardVenta: { backgroundColor: "#ffffff", borderRadius: 8, marginBottom: 10 }, // Sin bordes verdes
  cardExtra: {
    backgroundColor: "#fff8e1",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ffe0b2",
    borderLeftWidth: 5,
    borderLeftColor: "#ff9800",
  },
  name: { fontWeight: "bold", fontSize: 16, color: "#333" },
  motivo: { fontSize: 12, color: "#666" },
  monto: { fontWeight: "bold", fontSize: 16, color: "#0ab546" },
});
