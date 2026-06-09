import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import CustomButton from "./CustomButton";
import { CartItem, PaymentMethod, PAYMENT_CONFIG } from "../store/cartStore";

interface PrintOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: "ticket" | "invoice", aplicarImp?: boolean) => void;
  saleData?: {
    items: CartItem[];
    payments: PaymentMethod[];
    total: number;
    numSale: number;
    cambio: number;
  } | null;
}

export default function PrintOptionsModal({
  visible,
  onClose,
  onSelectOption,
  saleData,
}: PrintOptionsModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Opciones de Impresión</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={24} color="black" />
            </Pressable>
          </View>

          {saleData && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>
                Vista Previa - Venta #{saleData.numSale}
              </Text>
              <ScrollView style={styles.previewScroll} nestedScrollEnabled>
                {saleData.items.map((item, index) => (
                  <View key={index} style={styles.previewItem}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.product.nombre}
                    </Text>
                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                    <Text style={styles.itemPrice}>
                      C$ {(item.product.precio * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.previewTotals}>
                {saleData.payments.map((p, i) => {
                  const cfg = PAYMENT_CONFIG[p.type];
                  return (
                    <View key={i} style={styles.totalsRow}>
                      <Text>{cfg?.label || p.type}:</Text>
                      <Text>C$ {p.amount.toFixed(2)}</Text>
                    </View>
                  );
                })}
                {saleData.cambio > 0 && (
                  <View style={styles.totalsRow}>
                    <Text>Cambio:</Text>
                    <Text>C$ {saleData.cambio.toFixed(2)}</Text>
                  </View>
                )}
                <View style={[styles.totalsRow, { marginTop: 5 }]}>
                  <Text style={styles.totalBold}>TOTAL:</Text>
                  <Text style={styles.totalBold}>
                    C$ {saleData.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <Text style={styles.subtitle}>
            ¿En qué formato deseas imprimir el comprobante?
          </Text>
          <View>
            <CustomButton
              iconName=""
              title="Aplicar impuesto"
              onPress={() => onSelectOption("ticket", true)}
            />
          </View>

          <View style={styles.buttonsContainer}>
            <CustomButton
              iconName="receipt"
              title="Ticket (80mm)"
              onPress={() => onSelectOption("ticket")}
            />
            <CustomButton
              iconName="file-pdf"
              title="Factura (PDF)"
              onPress={() => onSelectOption("invoice")}
            />
          </View>
        </View>
      </View>
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
    backgroundColor: "white",
    width: "85%",
    maxHeight: "90%",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  previewContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
    maxHeight: 250, // Limitar altura para que el modal no sea tan grande
  },
  previewTitle: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 5,
  },
  previewScroll: {
    flexGrow: 0,
  },
  previewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  itemName: {
    flex: 2,
    fontSize: 12,
  },
  itemQty: {
    flex: 0.5,
    textAlign: "center",
    fontSize: 12,
  },
  itemPrice: {
    flex: 1,
    textAlign: "right",
    fontSize: 12,
  },
  previewTotals: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
    marginTop: 10,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  totalBold: {
    fontWeight: "bold",
    fontSize: 14,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 15,
    textAlign: "center",
    color: "#555",
  },
  buttonsContainer: {
    gap: 15,
  },
});
