import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { MovementRepository } from "../../database/repositories/movementRepository";
import MovementCard from "../../componentes/MovementCard";
import { ProductRepository } from "../../database/repositories/productRepository";

interface Movement {
  id: number;
  product_id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: "entrada" | "salida";
  cantidad: number;
  fecha: string;
  estado: boolean;
  id_venta: number | null;
}

const movimientos = () => {
  const [data, setData] = useState<Movement[]>([]);
  const loadData = async () => {
    const movimientos = await MovementRepository.getAll();
    setData(movimientos as Movement[]);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const anularMovimiento = async (
    id_mov: number,
    id_prod: number,
    tipo_mov: string,
    cantidad: number
  ) => {
    let ajuste = cantidad;
    if (tipo_mov === "entrada") {
      ajuste = -ajuste;
    }
    await ProductRepository.adjustStock(id_prod, ajuste);
    await MovementRepository.updateState(id_mov);
    loadData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Movimientos</Text>
      <Button
        title="Nuevo movimiento"
        onPress={() => router.push("/movimientos/crear")}
      />
      <FlatList
        style={styles.lista}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MovementCard item={item} onAnular={anularMovimiento} />
        )}
      />
    </SafeAreaView>
  );
};

export default movimientos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  lista: {
    paddingTop: 10,
  },
});
