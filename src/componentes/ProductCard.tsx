import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
interface ProductProps {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  codigo: string;
  codigo_barras: string;
  categoria_nombre?: string;
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
      <View style={{ flex: 1 }}>
        {/* Aquí mostramos la categoría */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {producto.categoria_nombre || "Sin categoría"}
          </Text>
        </View>

        <Text style={styles.info}>Cód: {producto.codigo}</Text>
        <Text style={styles.info}>Nombre: {producto.nombre}</Text>
        <Text style={styles.info}>
          Stock: {producto.stock} | Precio: C$ {producto.precio.toFixed(2)}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(producto.id)}>
          <MaterialIcons name="edit" size={24} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(producto.id)}>
          <MaterialIcons name="delete" size={24} color="#FF5252" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  categoryBadge: {
    backgroundColor: "#e0f7fa",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginVertical: 5,
  },
  categoryText: {
    fontSize: 11,
    color: "#00796b",
    fontWeight: "600",
  },
  info: {
    fontSize: 13,
    color: "#666",
  },
  actions: {
    flexDirection: "row",
    gap: 15,
    marginLeft: 10,
  },
});
