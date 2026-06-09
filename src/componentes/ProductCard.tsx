import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
interface ProductProps {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  codigo: string;
  codigo_barras: string;
}
interface ProductCardProps {
  producto: ProductProps;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export const ProductCard = ({
  producto,
  onDelete,
  onEdit,
}: ProductCardProps) => {
  return (
    <View style={styles.card}>
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.name}>{producto.nombre}</Text>
        <Text>Codigo: {producto.codigo}</Text>
        <Text>Cantidad: {producto.stock}</Text>
        <Text>Precio: {producto.precio}</Text>
        {producto.codigo_barras && (
          <Text>Código de Barras: {producto.codigo_barras}</Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(producto.id)}>
          <MaterialIcons name="edit" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(producto.id)}>
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 20,
  },
});
