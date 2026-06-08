import { Alert, StyleSheet, View } from "react-native";
import { useCartStore } from "../store/cartStore";
import { MovementRepository } from "../database/repositories/movementRepository";
import { ProductRepository } from "../database/repositories/productRepository";
import { MetodoPagoRepository } from "../database/repositories/metodoPagoRepository";
import PaymentModal from "./PaymentModal";
import { useEffect, useState } from "react";
import CustomButton from "./CustomButton";
import { SaleRepository } from "../database/repositories/saleRepository";
import { SaleDetailRepository } from "../database/repositories/saleDetailRepository";
import { PrintTicket, PrintInvoice } from "../print_service/Print";
import PrintOptionsModal from "./PrintOptionsModal";

export default function ProcessSale() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const clearCart = useCartStore((state) => state.clearCart);
  const payments = useCartStore((state) => state.payments);
  const [showPayment, setShowPayment] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [saleData, setSaleData] = useState<any>(null);

  const handlePrintSelect = async (option: "ticket" | "invoice") => {
    setShowPrintModal(false);
    if (saleData) {
      if (option === "ticket") {
        await PrintTicket(saleData.items, saleData.payments, saleData.total, saleData.numSale);
      } else {
        await PrintInvoice(saleData.items, saleData.payments, saleData.total, saleData.numSale);
      }
      setSaleData(null);
    }
  };

  useEffect(() => {
    handleSale();
  }, [payments]);

  const handleSale = async () => {
    try {
      if (items.length > 0 && total > 0 && payments.length === 0) {
        setShowPayment(true);
        return;
      }
      if (items.length > 0 && total && payments.length > 0) {
        const montoPagado = payments.reduce((sum, p) => sum + p.amount, 0);
        const hasEfectivo = payments.some((p) => p.type === "efectivo");
        const cambio = hasEfectivo ? montoPagado - total : 0;

        const resultsale = await SaleRepository.create(total, montoPagado, cambio);

        for (const payment of payments) {
          await MetodoPagoRepository.create(
            resultsale.lastInsertRowId,
            payment.type,
            payment.amount
          );
        }

        for (const item of items) {
          await MovementRepository.create(
            item.product.id,
            "Venta POS",
            "salida",
            item.quantity,
            resultsale.lastInsertRowId
          );
          await ProductRepository.adjustStock(item.product.id, -item.quantity);

          await SaleDetailRepository.create(
            resultsale.lastInsertRowId,
            item.product.id,
            item.quantity,
            item.product.precio
          );
        }
        setShowPayment(false);
        Alert.alert(
          "Exito",
          "Venta procesada correctamente. Seleccione el formato de comprobante."
        );
        setSaleData({ items: [...items], payments, total, numSale: resultsale.lastInsertRowId });
        setShowPrintModal(true);
        clearCart();
      }
    } catch (error) {
      Alert.alert("Error", `No se pudo procesar la venta. ${error}`);
    }
  };
  return (
    <View>
      <CustomButton
        onPress={handleSale}
        disable={items.length === 0}
        title="Procesar Venta"
        iconName="cart-arrow-down"
      />
      <PaymentModal
        visible={showPayment}
        onClose={() => setShowPayment(false)}
      />
      <PrintOptionsModal
        visible={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onSelectOption={handlePrintSelect}
        saleData={saleData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  processSaleButton: {
    alignSelf: "center",
    backgroundColor: "green",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  processSaleButtonInactive: {
    backgroundColor: "gray",
  },
  processSaleText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
