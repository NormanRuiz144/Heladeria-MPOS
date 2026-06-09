import { db } from "../database";
export const MovementRepository = {
  async getAll() {
    const database = await db;
    return database.getAllAsync(
      "SELECT m.id, m.product_id, p.nombre, p.codigo, m.fecha, m.tipo,m.descripcion, m.cantidad, m.estado, m.id_venta FROM movimientos_inventario m JOIN productos p ON p.id = m.product_id ORDER BY m.fecha DESC"
    );
  },
  async create(
    product_id: number,
    descripcion: string,
    tipo: string,
    cantidad: number,
    id_venta: number | null
  ) {
    (await db).runAsync(
      "INSERT INTO movimientos_inventario (product_id, descripcion, tipo, cantidad, id_venta) VALUES (?, ?, ?, ?, ?)",
      [product_id, descripcion, tipo, cantidad, id_venta]
    );
  },
  async updateState(id: number, wasSale: boolean = false) {
    let search: string;
    search = "id";
    if (wasSale) {
      search = "id_venta";
    }
    (await db).runAsync(
      `UPDATE movimientos_inventario SET estado = ? WHERE ${search} = ?`,
      [true, id]
    );
  },
};
