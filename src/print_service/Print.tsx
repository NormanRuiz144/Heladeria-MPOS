import * as Print from "expo-print";
import { shareAsync, isAvailableAsync } from "expo-sharing";
import { CartItem } from "../store/cartStore";
import { PaymentMethod } from "../store/cartStore";
import { Alert } from "react-native";
import { empresaRepository } from "../database/repositories/empresaRepository";
import { readAsStringAsync, EncodingType } from "expo-file-system/legacy";
import { Cliente } from "../database/repositories/clientesRepository";

export const PrintTicket = async (
  items: CartItem[],
  payments: PaymentMethod[],
  total: number,
  numSale: number,
  subtotal?: number,
  impuestoAmount?: number,
  clienteInfo?: Cliente
) => {
  try {
    let productFormat: string = "";
    for (let item of items) {
      productFormat += `
        <div class="item">
          <span class="item-name">${item.product.nombre}</span>
          <span class="item-qty">x${item.quantity}</span>
          <span class="item-price">C$ ${item.product.precio * item.quantity}</span>
        </div>
      `;
    }

    const montoPagado = payments.reduce((sum, p) => sum + p.amount, 0);
    const soloEfectivo = payments.every((p) => p.type === "efectivo");
    const cambio = soloEfectivo ? montoPagado - total : 0;

    let paymentsFormat = "";
    for (let p of payments) {
      paymentsFormat += `
        <div class="payment-line">
          <span>${p.type.charAt(0).toUpperCase() + p.type.slice(1)}</span>
          <span class="payment-amount">C$ ${p.amount.toFixed(2)}</span>
        </div>
      `;
    }

    const ticketFormat = `
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=80mm">
        <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            width: 80mm;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            padding: 5px;
        }
        .header { text-align: center; margin-bottom: 10px; }
        .header h1 { font-size: 16px; font-weight: bold; }
        .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
        .item { display: flex; }
        .item-name { width: 35mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .item-qty { width: 20px; text-align: center; font-size: 11px;}
        .item-price { width: 45px; text-align: right; font-size: 11px; }
        .total { font-weight: bold; font-size: 14px; margin-top: 10px; }
        .payment-line { display: flex; justify-content: space-between; }
        .payment-amount { text-align: right; }
        .summary { margin-top: 10px; font-size: 12px; }
        .summary-total { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 5px; border-top: 1px dashed #000; padding-top: 5px; }
        .footer { text-align: center; margin-top: 15px; font-size: 10px; }
        </style>
    </head>
    <body>
        <div class="header">
        <h1>MBPos Venta #${numSale}</h1>  
        <span>Nombre del Cliente: ${clienteInfo.nombre}</span>      
        </div>
        <div class="divider"></div>
        ${productFormat}
        <div class="divider"></div>
        <div class="summary">
          <strong>PAGOS:</strong>
          ${paymentsFormat}
          ${impuestoAmount !== undefined ? `
          <div class="summary-total" style="border-top: none; padding-top: 0; font-weight: normal; font-size: 12px;">
            <span>SUBTOTAL</span>
            <span>C$ ${(subtotal ?? total).toFixed(2)}</span>
          </div>
          <div class="summary-total" style="border-top: none; padding-top: 0; font-weight: normal; font-size: 12px;">
            <span>IMPUESTO</span>
            <span>C$ ${impuestoAmount.toFixed(2)}</span>
          </div>
          ` : ``}
          <div class="summary-total">
            <span>TOTAL</span>
            <span>C$ ${total.toFixed(2)}</span>
          </div>
          ${cambio > 0 ? `<div class="summary-total" style="border-top: none; padding-top: 0; font-weight: normal; font-size: 12px;"><span>CAMBIO</span><span>C$ ${cambio.toFixed(2)}</span></div>` : ``}
        </div>
        <div class="footer">Gracias por su compra</div>
    </body>
    </html>
        `;

    const { uri } = await Print.printToFileAsync({ html: ticketFormat });

    // Compartir el PDF generado d=====(￣▽￣*)b
    if (await isAvailableAsync()) {
      await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    }
  } catch (error) {
    Alert.alert("Alerta", "La generacion del voucher a fallado");
  }
};

export const PrintInvoice = async (
  items: CartItem[],
  payments: PaymentMethod[],
  total: number,
  numSale: number,
  subtotal?: number,
  impuestoAmount?: number,
  clienteInfo?: Cliente
) => {
  try {
    let productRows = "";
    for (let item of items) {
      productRows += `
        <tr>
          <td>${item.product.codigo || "-"}</td>
          <td>${item.product.nombre}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">C$ ${item.product.precio.toFixed(2)}</td>
          <td style="text-align: right;">C$ ${(item.product.precio * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    }

    const montoPagado = payments.reduce((sum, p) => sum + p.amount, 0);
    const soloEfectivo = payments.every((p) => p.type === "efectivo");
    const cambio = soloEfectivo ? montoPagado - total : 0;

    const today = new Date().toLocaleString();

    const invoiceFormat = `
    <html>
    <head>
        <meta charset="utf-8">
        <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; padding: 40px; font-size: 14px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0ab546; padding-bottom: 20px; margin-bottom: 30px; }
        .header-left h1 {
            color: #0ab546;
            margin: 0;
            font-size: 28px;
        }
        .header-right {
            text-align: right;
        }
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .invoice-details div {
            width: 48%;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th {
            background-color: #0ab546;
            color: white;
            padding: 12px;
            text-align: left;
        }
        td {
            border-bottom: 1px solid #ddd;
            padding: 12px;
        }
        .totals-container {
            width: 100%;
            display: flex;
            justify-content: flex-end;
        }
        .totals-table {
            width: 300px;
            border-collapse: collapse;
        }
        .totals-table td {
            padding: 8px 12px;
            border: none;
        }
        .totals-table tr:last-child {
            border-top: 2px solid #0ab546;
            font-weight: bold;
            font-size: 18px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="header-left">
                <h1>MBPos</h1>
                <p>Factura de Venta</p>
            </div>
            <div class="header-right">
                <h2>Factura #${numSale.toString().padStart(6, "0")}</h2>
                <p>Fecha: ${today}</p>
            </div>
        </div>

        <div class="invoice-details">
            <div>
                <h3>Empresa</h3>
                <p><strong>MBPos Inc.</strong></p>
                <p>Dirección Genérica, Rivas, Nicaragua</p>
                <p>Tel: +505 0000 0000</p>
            </div>
            <div>
                <h3>Cliente</h3>
                <p><strong>${clienteInfo.nombre}</strong></p>
              </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th style="text-align: center;">Cantidad</th>
                    <th style="text-align: right;">Precio Unit.</th>
                    <th style="text-align: right;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${productRows}
            </tbody>
        </table>

        <div class="totals-container">
            <table class="totals-table">
                <tr>
                    <td style="text-align: right;"><strong>Métodos de Pago:</strong></td>
                    <td style="text-align: right;">${payments.map((p) => p.type.toUpperCase()).join(" + ")}</td>
                </tr>
                <tr>
                    <td style="text-align: right;"><strong>Monto Pagado:</strong></td>
                    <td style="text-align: right;">C$ ${montoPagado.toFixed(2)}</td>
                </tr>
                ${
                  cambio > 0
                    ? `
                <tr>
                    <td style="text-align: right;"><strong>Cambio:</strong></td>
                    <td style="text-align: right;">C$ ${cambio.toFixed(2)}</td>
                </tr>
                `
                    : ""
                }
                ${
                  impuestoAmount !== undefined
                    ? `
                <tr>
                    <td style="text-align: right;"><strong>Subtotal:</strong></td>
                    <td style="text-align: right;">C$ ${(subtotal ?? total).toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="text-align: right;"><strong>Impuesto:</strong></td>
                    <td style="text-align: right;">C$ ${impuestoAmount.toFixed(2)}</td>
                </tr>
                `
                    : ""
                }
                <tr>
                    <td style="text-align: right;"><strong>TOTAL:</strong></td>
                    <td style="text-align: right;">C$ ${total.toFixed(2)}</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>Gracias por su preferencia.</p>
            <p>Este es un comprobante válido para sus registros.</p>
        </div>
    </body>
    </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: invoiceFormat });

    if (await isAvailableAsync()) {
      await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    }
  } catch (error) {
    Alert.alert("Alerta", "La generación de la factura PDF ha fallado");
  }
};

export const PrintSalesReport = async (
  sales: any[], // Esta lista ahora contiene objetos combinados con la propiedad 'tipo'
  totalPeriodo: number,
  startDate: string,
  endDate: string
) => {
  try {
    const empresa = await empresaRepository.getFirst();
    const empresaNombre = empresa?.nombre || "MBPos";
    const empresaDireccion = empresa?.direccion || "";
    const empresaLogo = empresa?.logo || "";
    let logoSrc = "";
    if (empresaLogo) {
      try {
        const base64 = await readAsStringAsync(empresaLogo, {
          encoding: EncodingType.Base64,
        });
        logoSrc = `data:image/jpeg;base64,${base64}`;
      } catch (e) {
        console.log("Error leyendo logo:", e);
      }
    }

    // Generamos las filas de la tabla de ventas
    let rowsFormat = "";
    sales.forEach((item) => {
      if (item.tipo === "venta") {
        // Formato para ventas normales
        rowsFormat += `
          <tr>
            <td>#${item.id}</td>
            <td>${item.fecha.split(" ")[0]}</td>
            <td>${item.metodos_pago?.map((m: any) => m.metodo_pago.toUpperCase()).join(" + ") || "—"}</td>
            <td style="color: ${item.estado ? "red" : "black"}">
              ${item.estado ? "ANULADA" : "C$ " + item.total.toFixed(2)}
            </td>
          </tr>
        `;
      } else {
        // Formato para ventas extras
        rowsFormat += `
          <tr style="background-color: #fff9f0;">
            <td>EXTRA</td>
            <td>${item.fecha.split(" ")[0]}</td>
            <td>${item.descripcion} (${item.motivo})</td>
            <td>C$ ${item.monto.toFixed(2)}</td>
          </tr>
        `;
      }
    });

    const reportHtml = `
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #0ab546; padding-bottom: 10px; }
        .title { font-size: 24px; font-weight: bold; color: #0ab546; }
        .info { margin: 20px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #0ab546; color: white; padding: 10px; text-align: left; }
        td { border-bottom: 1px solid #ddd; padding: 10px; font-size: 12px; }
        .total-section { margin-top: 30px; text-align: right; }
        .total-box { display: inline-block; background: #1a1a1a; color: white; padding: 15px 40px; 
        border-radius: 50px; border: 2px solid #0ab546; text-align: center;}
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #888; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${empresaNombre} - REPORTE DE VENTAS Y EXTRAS</div>
        ${logoSrc ? `<img src="${logoSrc}" alt="Logo" style="width: 80px; height: 80px; object-fit: contain; margin-top: 8px; margin-bottom: 8px;" />` : ""}
        ${empresaDireccion ? `<p style="margin: 2px 0; font-size: 12px; color: #555;">${empresaDireccion}</p>` : ""}
      </div>
      
      <div class="info">
        <p><strong>Periodo:</strong> Desde ${startDate} hasta ${endDate}</p>
        <p><strong>Fecha de Generación:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID / Tipo</th>
            <th>Fecha</th>
            <th>Detalle / Método</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          ${rowsFormat}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-box">
          <span style="font-size: 12px;">TOTAL NETO DEL PERIODO:</span><br/>
          <span style="font-size: 24px; font-weight: bold;">C$ ${totalPeriodo.toFixed(2)}</span>
        </div>
      </div>

      <div class="footer">
        Este documento es un reporte oficial generado por el sistema MBPOS.
      </div>
    </body>
    </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: reportHtml });

    if (await isAvailableAsync()) {
      await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    }
  } catch (error) {
    Alert.alert("Error", "No se pudo generar el reporte PDF: " + error);
  }
};
