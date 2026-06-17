import {
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InputField from "./InputField";
import { useEffect, useState } from "react";
import { ProductRepository } from "../../database/repositories/productRepository";
import { router, useLocalSearchParams } from "expo-router";
import BarcodeGenerator from "../../componentes/showBarCode";
import { CategoriaRepository } from "../../database/repositories/categoriaRepository";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  codigo: string;
  codigo_barras: string;
}

export default function editarProducto() {
  const { id } = useLocalSearchParams();
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [codigo, setCodigo] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
    number | null
  >(null);

  const validar = () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio.");
      return false;
    }
    if (!codigo.trim()) {
      Alert.alert("Error", "El codigo es obligatorio.");
      return false;
    }
    if (!precio.trim() || isNaN(Number(precio)) || Number(precio) < 0) {
      Alert.alert(
        "Error",
        "El precio debe ser un numero mayor o igual que cero."
      );
      return false;
    }
    if (!stock.trim() || isNaN(Number(stock)) || Number(stock) < 0) {
      Alert.alert(
        "Error",
        "El stock debe ser un numero mayor o igual que cero."
      );
      return false;
    }
    return true;
  };

  useEffect(() => {
    const loadData = async () => {
      // 1. Cargamos categorías
      const cats = await CategoriaRepository.getAll();
      setCategorias(cats);

      // 2. Cargamos el producto actual
      if (id) {
        const product: any = await ProductRepository.getById(Number(id));
        if (product) {
          setNombre(product.nombre);
          setPrecio(product.precio.toString());
          setStock(product.stock.toString());
          setCodigo(product.codigo || "");
          setCategoriaSeleccionada(product.categoria_id); // Cargamos la categoría guardada
        }
      }
    };
    loadData();
  }, [id]);

  const editar = async () => {
    if (!nombre.trim() || !codigo.trim() || categoriaSeleccionada === null) {
      Alert.alert("Error", "Todos los campos y la categoría son obligatorios.");
      return;
    }

    try {
      const isUnique = await ProductRepository.isCodigoUnique(
        codigo,
        Number(id)
      );

      if (!isUnique) {
        Alert.alert("Error", "El codigo ya existe.");
        return;
      }
      await ProductRepository.update(
        Number(id),
        nombre,
        Number(precio),
        Number(stock),
        codigo,
        categoriaSeleccionada
      );
      Alert.alert("Exito", "Producto actualizado exitosamente.");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo actualizar el producto");
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Editar Producto</Text>
      <InputField
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <InputField
        placeholder="Codigo"
        value={codigo}
        onChangeText={setCodigo}
      />
      <InputField
        placeholder="Precio"
        value={precio}
        onChangeText={setPrecio}
      />
      <InputField placeholder="Stock" value={stock} onChangeText={setStock} />
      <View style={styles.barcodeContanier}>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          Código de Barras asignado para el producto:
        </Text>
        <BarcodeGenerator value={codigoBarras} showText={true} />
      </View>

      <Text style={styles.subtitle}>Categoría:</Text>
      <FlatList
        horizontal
        data={categorias}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setCategoriaSeleccionada(item.id)}
            style={[
              styles.chip,
              categoriaSeleccionada === item.id && styles.chipActive,
            ]}
          >
            <Text
              style={
                categoriaSeleccionada === item.id ? { color: "white" } : {}
              }
            >
              {item.nombre}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.chipList}
      />

      <Button title="Guardar Cambios" onPress={editar} color="#0ab546" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#eee",
    marginRight: 10,
    borderRadius: 20,
  },
  chipActive: { backgroundColor: "#0ab546" },
  chipList: { flexGrow: 0, marginBottom: 20 },
  barcodeContanier: {
    alignItems: "center",
    borderRadius: 8,
    paddingBottom: 10,
  },
});
