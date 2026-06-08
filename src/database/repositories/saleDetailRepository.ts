import { db } from "../database";

export const SaleDetailRepository = {
  async getDetails(id: number) {
    const database = await db;
    return database.getAllAsync(
      "SELECT product_id, cantidad FROM detalle_ventas WHERE ventas_id = ?",
      [id]
    );
  },
  async create(
    venta_id: number,
    product_id: number,
    cantidad: number,
    precio: number
  ) {
    return (await db).runAsync(
      "INSERT INTO detalle_ventas (ventas_id, product_id, cantidad, precio) VALUES (?, ?, ?, ?)",
      [venta_id, product_id, cantidad, precio]
    );
  },
};
