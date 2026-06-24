import { Pressable, StyleSheet, Text, View } from "react-native";
import { IVenta, MetodoPagoItem } from "./SalesHistory";
import { ComponentProps } from "react";
import { FontAwesome5 } from "@expo/vector-icons";

type SaleCardProps = {
  zone?: string;
  item: IVenta;
  anularVenta: (id: number) => void;
  printVoucher: (
    id: number,
    metodos_pago: MetodoPagoItem[],
    total: number,
    subtotal?: number,
    impuestoAmount?: number
  ) => void;
} & ComponentProps<typeof Pressable>;

const icons: Record<string, string> = {
  efectivo: "money-bill",
  tarjeta: "credit-card",
  transferencia: "money-check-alt",
};

const hasEfectivo = (metodos: MetodoPagoItem[]) =>
  metodos.some((m) => m.metodo_pago === "efectivo");

export default function SalesCard({
  item,
  anularVenta,
  printVoucher,
  zone = "venta",
}: SaleCardProps) {
  return (
    <View
      style={[
        styles.cardContainer,
        item.estado && { borderWidth: 1, borderColor: "#FFBF00" },
      ]}
    >
      <Text style={{ textAlign: "center" }}>Numero de Venta: #{item.id}</Text>
      <View
        style={{
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Métodos de Pago:</Text>
        {item.metodos_pago?.map((mp, idx) => {
          const iconName = icons[mp.metodo_pago] || "money-bill";
          return (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginLeft: 8,
              }}
            >
              <FontAwesome5 name={iconName} size={16} color="black" />
              <Text>
                {mp.metodo_pago.charAt(0).toUpperCase() +
                  mp.metodo_pago.slice(1)}
                : C$
                {mp.monto.toFixed(2)}
              </Text>
            </View>
          );
        })}
      </View>
      <Text>Fecha de Venta: {item.fecha}</Text>
      <Text>Monto Pagado: C${item.monto_pagado}</Text>
      <Text>Subtotal: C${item.subtotal?.toFixed(2) ?? item.total.toFixed(2)}</Text>
      {item.impuesto_amount > 0 && (
        <Text>Impuesto: C${item.impuesto_amount.toFixed(2)}</Text>
      )}
      <Text>Total: C${item.total}</Text>

      {hasEfectivo(item.metodos_pago) && item.cambio > 0 && (
        <Text>Cambio: C${item.cambio.toFixed(2)}</Text>
      )}

      {item.estado == false && zone == "venta" ? (
        <View style={styles.Buttons}>
          <View style={styles.btnImprinir}>
            <Text style={{ fontSize: 15, fontWeight: "bold" }}>Imprimir</Text>
            <Pressable
              onPress={() =>
                printVoucher(item.id, item.metodos_pago, item.total, item.subtotal, item.impuesto_amount)
              }
            >
              <FontAwesome5 name="print" size={24} color="black" />
            </Pressable>
          </View>
          <View style={styles.btnAnular}>
            <Text style={{ fontSize: 15, fontWeight: "bold" }}>Anular</Text>
            <Pressable onPress={() => anularVenta(item.id)}>
              <FontAwesome5 name="times-circle" size={24} color="black" />
            </Pressable>
          </View>
        </View>
      ) : (
        zone == "venta" && (
          <View>
            <Text style={styles.anulado}>Anulado</Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 5,
    borderRadius: 8,
  },
  Buttons: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btnImprinir: { paddingLeft: "30%", alignItems: "center" },
  btnAnular: { paddingRight: "30%", alignItems: "center" },
  anulado: {
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    backgroundColor: "#FFBF00",
    padding: 4,
    marginTop: 5,
    borderRadius: 8,
  },
});
