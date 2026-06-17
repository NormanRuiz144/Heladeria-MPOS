import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Product } from "../app/movimientos/crear";
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetailModal({ visible, product, onClose }: Props) {
  if (!product) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={() => {}}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>

          {product.imagen ? (
            <Image source={{ uri: product.imagen }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.noImage]}>
              <MaterialIcons name="image" size={48} color="#ccc" />
              <Text style={styles.noImageText}>Sin imagen</Text>
            </View>
          )}

          <View style={styles.info}>
            <Text style={styles.name}>{product.nombre}</Text>
            <Text style={styles.code}>Código: {product.codigo}</Text>
            <Text style={styles.price}>Precio: ${product.precio}</Text>
            <Text style={styles.stock}>Stock: {product.stock}</Text>
            {product.info_relevante ? (
              <Text style={styles.infoText}>{product.info_relevante}</Text>
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    maxHeight: "80%",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 4,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  noImage: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 4,
    color: "#ccc",
    fontSize: 12,
  },
  info: {
    width: "100%",
    gap: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  code: {
    fontSize: 14,
    color: "#666",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2e7d32",
  },
  stock: {
    fontSize: 14,
    color: "#555",
  },
  infoText: {
    fontSize: 14,
    color: "#444",
    marginTop: 8,
    fontStyle: "italic",
  },
});
