import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import { useCartStore, PaymentMethod, PaymentType, PAYMENT_TYPES, PAYMENT_CONFIG } from "../store/cartStore";
import CustomButton from "./CustomButton";
import { useEffect, useRef, useState } from "react";
import { FontAwesome5 } from "@expo/vector-icons";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PaymentModal({ visible, onClose }: PaymentModalProps) {
  const total = useCartStore((state) => state.total);
  const setPayments = useCartStore((state) => state.setPayments);
  const [committed, setCommitted] = useState<PaymentMethod[]>([]);
  const [selectedType, setSelectedType] = useState<PaymentType | null>(null);
  const [inputAmount, setInputAmount] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setCommitted([]);
      setSelectedType(null);
      setInputAmount("");
    }
  }, [visible]);

  const totalPagado = committed.reduce((sum, c) => sum + c.amount, 0);
  const currentValue = parseFloat(inputAmount) || 0;
  const subtotal = totalPagado + currentValue;
  const pendiente = total - subtotal;
  const completado = subtotal >= total;
  const pagoCompletado = totalPagado >= total && currentValue === 0;
  const esSoloEfectivo = committed.every(c => c.type === "efectivo") && (!selectedType || selectedType === "efectivo");

  const isTypeCommitted = (type: string) =>
    committed.some((c) => c.type === type);

  const isTypeBlocked = (type: string) =>
    pagoCompletado && !isTypeCommitted(type) && selectedType !== type;

  const commitCurrent = (): boolean => {
    const amt = parseFloat(inputAmount);
    if (!selectedType) return false;
    if (!amt || amt <= 0) {
      Alert.alert("Error", `Ingrese un monto válido mayor a 0 para ${PAYMENT_CONFIG[selectedType].label}`);
      return false;
    }
    if (isTypeCommitted(selectedType)) {
      Alert.alert("Método ya usado", `Ya registró un pago con ${PAYMENT_CONFIG[selectedType].label}. Quite el pago si desea cambiarlo.`);
      return false;
    }
    const soloEfectivo = committed.every(c => c.type === "efectivo") && selectedType === "efectivo";
    if (!soloEfectivo && totalPagado + amt > total) {
      Alert.alert("Error", "No puede exceder el monto a pagar");
      return false;
    }
    setCommitted([...committed, { type: selectedType, amount: amt }]);
    setInputAmount("");
    return true;
  };

  const handleTypePress = (type: PaymentType) => {
    if (isTypeBlocked(type)) {
      Alert.alert("Pago completado", `El total de C$${total.toFixed(2)} ya fue cubierto. Si desea agregar más, quite un pago primero.`);
      return;
    }
    if (isTypeCommitted(type) && type !== selectedType) {
      Alert.alert("Método ya usado", `Ya pagó con ${PAYMENT_CONFIG[type].label}. Quite el pago si desea cambiarlo.`);
      return;
    }
    if (type === selectedType) {
      if (inputAmount) commitCurrent();
      return;
    }
    if (selectedType && inputAmount) {
      const amt = parseFloat(inputAmount);
      const ok = commitCurrent();
      if (!ok) return;
      if (totalPagado + amt >= total) {
        setSelectedType(null);
        return;
      }
    }
    setSelectedType(type);
    setInputAmount("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const removePayment = (index: number) => {
    setCommitted(committed.filter((_, i) => i !== index));
  };

  const buildFormula = (): string => {
    const parts = committed.map((c) => c.amount.toString());
    const totalCommitted = committed.reduce((s, c) => s + c.amount, 0);

    if (totalCommitted >= total && currentValue === 0) {
      return parts.join(" + ");
    }

    if (currentValue > 0) {
      return [...parts, currentValue.toString()].join(" + ");
    }

    if (parts.length > 0) return parts.join(" + ") + " + ";
    return "";
  };

  const canProcessAll = (): boolean => {
    const effective = [...committed];
    const amt = parseFloat(inputAmount);
    if (selectedType && amt > 0 && !isTypeCommitted(selectedType)) {
      effective.push({ type: selectedType, amount: amt });
    }
    if (effective.length === 0) return false;
    const totalP = effective.reduce((s, c) => s + c.amount, 0);
    const soloEfectivo = effective.every((c) => c.type === "efectivo");
    return soloEfectivo ? totalP >= total : totalP === total;
  };

  const handleProcess = () => {
    let finalCommitted = [...committed];
    const amt = parseFloat(inputAmount);
    if (selectedType && amt > 0 && !isTypeCommitted(selectedType)) {
      finalCommitted.push({ type: selectedType, amount: amt });
    }
    if (finalCommitted.length === 0) return;
    const totalP = finalCommitted.reduce((s, c) => s + c.amount, 0);
    const soloEfectivo = finalCommitted.every((c) => c.type === "efectivo");
    if (soloEfectivo ? totalP < total : totalP !== total) return;
    const payments: PaymentMethod[] = finalCommitted.map((c) => ({
      type: c.type,
      amount: c.amount,
    }));
    setPayments(payments);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <Pressable style={styles.buttonBack} onPress={onClose}>
        <FontAwesome5 name="arrow-circle-left" size={24} color="black" />
      </Pressable>
      <View style={styles.container}>
        <Text style={styles.amount}>C${total.toFixed(2)}</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min((subtotal / total) * 100, 100)}%`,
                backgroundColor: completado ? "#4CAF50" : "#FF9800",
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Pagado: C${subtotal.toFixed(2)} de C${total.toFixed(2)}
          {completado && currentValue === 0 ? " ✓" : ""}
        </Text>
        {!completado && (
          <Text style={styles.pendingText}>Pendiente: C${pendiente.toFixed(2)}</Text>
        )}

        <View style={styles.calculatorBox}>
          <Text style={styles.calculatorText} numberOfLines={1}>
            {buildFormula()}
          </Text>
        </View>

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={selectedType ? "" : "Seleccione un método"}
          value={inputAmount}
          onChangeText={setInputAmount}
          keyboardType="numeric"
          editable={!!selectedType && !pagoCompletado}
        />

        <View style={styles.iconRow}>
          {PAYMENT_TYPES.map((type) => {
            const cfg = PAYMENT_CONFIG[type];
            const isSelected = selectedType === type;
            const isUsed = isTypeCommitted(type);
            const isBlocked = isTypeBlocked(type);
            return (
              <Pressable
                key={type}
                style={[
                  styles.iconButton,
                  isSelected && styles.iconButtonSelected,
                  isUsed && !isSelected && styles.iconButtonUsed,
                  isBlocked && styles.iconButtonBlocked,
                ]}
                onPress={() => handleTypePress(type)}
              >
                <FontAwesome5
                  name={cfg.icon}
                  size={22}
                  color={isSelected ? "#fff" : isUsed ? "#4A90D9" : isBlocked ? "#ccc" : 
                    "#666"}
                />
                <Text
                  style={[
                    styles.iconLabel,
                    isSelected && styles.iconLabelSelected,
                    isUsed && !isSelected && styles.iconLabelUsed,
                    isBlocked && styles.iconLabelBlocked,
                  ]}
                >
                  {cfg.label}
                </Text>
                {isUsed && !isSelected && (
                  <Text style={styles.usedBadge}>✓</Text>
                )}
                {isBlocked && (
                  <Text style={styles.blockedBadge}>🔒</Text>              
                )}
              </Pressable>
            );
          })}
        </View>

        {committed.length > 0 && (
          <View style={styles.paymentsList}>
            <Text style={styles.paymentsTitle}>Pagos ingresados:</Text>
            <ScrollView style={styles.paymentsScroll} nestedScrollEnabled>
              {committed.map((c, i) => {
                const cfg = PAYMENT_CONFIG[c.type];
                return (
                  <View key={i} style={styles.paymentRow}>
                    <FontAwesome5 name={cfg.icon} size={14} color="#4A90D9" />
                    <Text style={styles.paymentMethod}>{cfg.label}</Text>
                    <Text style={styles.paymentAmount}>C${c.amount.toFixed(2)}</Text>
                    <Pressable onPress={() => removePayment(i)} hitSlop={8}>
                      <FontAwesome5 name="times-circle" size={18} color="#e74c3c" />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

          {esSoloEfectivo && subtotal > total && (
          <Text style={styles.cambioText}>
            Cambio: C${(subtotal - total).toFixed(2)}
          </Text>
        )}
    {!esSoloEfectivo && subtotal > total && (
          <Text style={styles.warningText}>No puede exceder el monto a pagar</Text>
        )}

        <CustomButton
          title={canProcessAll() ? "Procesar Venta" : "Complete el pago"}
          onPress={handleProcess}
          disable={!canProcessAll()}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonBack: {
    padding: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
  },
  amount: {
    fontSize: 34,
    alignSelf: "center",
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
  pendingText: {
    textAlign: "center",
    fontSize: 14,
    color: "#e74c3c",
    fontWeight: "600",
  },
  calculatorBox: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  calculatorText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
    fontFamily: "monospace",
  },
  input: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    height: 54,
    fontSize: 18,
  },
  iconRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  iconButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
    gap: 6,
    position: "relative",
  },
  iconButtonSelected: {
    backgroundColor: "#4A90D9",
    borderColor: "#4A90D9",
  },
  iconButtonUsed: {
    backgroundColor: "#e8f4e8",
    borderColor: "#4A90D9",
    borderStyle: "dashed",
  },
  iconButtonBlocked: {
    opacity: 0.5,
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  iconLabelSelected: {
    color: "#fff",
  },
  iconLabelUsed: {
    color: "#4A90D9",
  },
  iconLabelBlocked: {
    color: "#ccc",
  },
  usedBadge: {
    position: "absolute",
    top: 4,
    right: 6,
    fontSize: 10,
    color: "#4A90D9",
    fontWeight: "bold",
  },
  blockedBadge: {
    position: "absolute",
    top: 4,
    right: 6,
    fontSize: 10,
  },
  paymentsList: {
    maxHeight: 120,
  },
  paymentsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
  },
  paymentsScroll: {
    maxHeight: 100,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 13,
    color: "#333",
    flex: 1,
  },
  paymentAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginRight: 4,
  },
  cambioText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  warningText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
  },
});
