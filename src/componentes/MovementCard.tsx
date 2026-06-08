import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

interface Movement {
  id: number;
  product_id: number;
  codigo: string;
  descripcion: string;
  nombre: string;
  tipo: "entrada" | "salida";
  cantidad: number;
  fecha: string;
  estado: boolean;
  id_venta: number | null;
}
interface MovementCardProps {
  item: Movement;
  onAnular: (
    id_mov: number,
    id_prod: number,
    tipo_mov: string,
    cantidad: number
  ) => void;
}

export default function MovementCard({ item, onAnular }: MovementCardProps) {
  return (
    <View
      style={[
        styles.card,
        item.estado && { borderWidth: 1, borderColor: "#FFBF00" },
      ]}
    >
      <View>
        <Text style={styles.name}>{item.nombre}</Text>

        <Text>Descripcion: {item.descripcion}</Text>
        {item.id_venta !== null && (
          <Text>Numero de venta asociada: #{item.id_venta!.toString()}</Text>
        )}

        <Text>Tipo: {item.tipo}</Text>
        <Text>Cantidad {item.cantidad.toString()}</Text>
        <Text>{item.fecha}</Text>
        {/* <Text>Estado: {item.estado == false ? "Activo" : "Inactivo"}</Text> */}
      </View>
      {item.estado == false ? (
        <View style={styles.anularButton}>
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>Anular</Text>
          <Pressable
            onPress={() =>
              onAnular(item.id, item.product_id, item.tipo, item.cantidad)
            }
          >
            <FontAwesome5 name="times-circle" size={24} color="black" />
          </Pressable>
        </View>
      ) : (
        <View>
          <Text style={styles.anulado}>Anulado</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  anularButton: {
    marginRight: 15,
    alignItems: "center",
  },
  anulado: {
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#FFBF00",
    padding: 5,
    borderRadius: 8,
  },
});
