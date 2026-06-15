import { Alert, StyleSheet, View } from "react-native";
import { useCartStore } from "../store/cartStore";
import { db } from "../database/database";
import { MovementRepository } from "../database/repositories/movementRepository";
import { ProductRepository } from "../database/repositories/productRepository";
import { MetodoPagoRepository } from "../database/repositories/metodoPagoRepository";
import PaymentModal from "./PaymentModal";
import { useEffect, useRef, useState } from "react";
import CustomButton from "./CustomButton";
import { SaleRepository } from "../database/repositories/saleRepository";
import { SaleDetailRepository } from "../database/repositories/saleDetailRepository";
import { PrintTicket, PrintInvoice } from "../print_service/Print";
import PrintOptionsModal from "./PrintOptionsModal";
import {
  Cliente,
  clientesRepository,
} from "../database/repositories/clientesRepository";

export default function ProcessSale() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const clearCart = useCartStore((state) => state.clearCart);
  const payments = useCartStore((state) => state.payments);
  const clientId = useCartStore((state) => state.clientId);
  const isProcessing = useRef(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [saleData, setSaleData] = useState<any>(null);

  const handlePrintSelect = async (option: "ticket" | "invoice") => {
    setShowPrintModal(false);
    if (saleData) {
      if (option === "ticket") {
        await PrintTicket(
          saleData.items,
          saleData.payments,
          saleData.total,
          saleData.numSale,
          saleData.cliente
        );
      } else {
        await PrintInvoice(
          saleData.items,
          saleData.payments,
          saleData.total,
          saleData.numSale,
          saleData.cliente
        );
      }
      setSaleData(null);
    }
  };

  useEffect(() => {
    handleSale();
  }, [payments]);

  const handleSale = async () => {
    if (isProcessing.current) return;
    try {
      if (items.length > 0 && total > 0 && payments.length === 0) {
        setShowPayment(true);
        return;
      }
      if (items.length > 0 && total && payments.length > 0) {
        isProcessing.current = true;
        const database = await db;
        const montoPagado = payments.reduce((sum, p) => sum + p.amount, 0);
        const soloEfectivo = payments.every((p) => p.type === "efectivo");
        const cambio = soloEfectivo ? montoPagado - total : 0;

        await database.execAsync("BEGIN TRANSACTION");

        try {
          const resultsale = await SaleRepository.create(
            total,
            montoPagado,
            cambio,
            clientId
          );

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
            await ProductRepository.adjustStock(
              item.product.id,
              -item.quantity
            );

            await SaleDetailRepository.create(
              resultsale.lastInsertRowId,
              item.product.id,
              item.quantity,
              item.product.precio
            );
          }

          const clienteInfo =
            clientId !== null
              ? ((await clientesRepository.getById(clientId)) as Cliente)
              : { id: 0, nombre: "Cliente de normal", numero: "", ruc: "" };

          await database.execAsync("COMMIT");

          setShowPayment(false);
          setSaleData({
            items: [...items],
            payments,
            cambio,
            total,
            numSale: resultsale.lastInsertRowId,
            cliente: clienteInfo,
          });
          setShowPrintModal(true);
          clearCart();
        } catch (txError) {
          await database.execAsync("ROLLBACK");
          throw txError;
        }
      }
    } catch (error) {
      Alert.alert("Error", `No se pudo procesar la venta. ${error}`);
    } finally {
      isProcessing.current = false;
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
