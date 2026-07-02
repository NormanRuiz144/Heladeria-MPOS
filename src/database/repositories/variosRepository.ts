import { db } from "../database";

export const VariosRepository = {
  async getReportByDateRange(startDate: string, endDate: string) {
    const database = await db;
    return database.getAllAsync(
      "SELECT * FROM ventas_varias WHERE ventas_id IS NULL AND date(fecha) BETWEEN ? AND ? ORDER BY fecha DESC",
      [startDate, endDate]
    );
  },
  async getAll() {
    const database = await db;
    return database.getAllAsync("SELECT * FROM ventas_varias WHERE ventas_id IS NULL ORDER BY fecha DESC");
  },
  async getById(id: number) {
    const database = await db;
    return database.getFirstAsync("SELECT * FROM ventas_varias WHERE id = ?", [id]);
  },
  async getByVentaId(ventaId: number) {
    const database = await db;
    return database.getAllAsync("SELECT * FROM ventas_varias WHERE ventas_id = ? ORDER BY id ASC", [ventaId]);
  },
  async create(descripcion: string, motivo: string, monto: number) {
    const database = await db;
    return database.runAsync(
      "INSERT INTO ventas_varias (descripcion, motivo, monto) VALUES (?, ?, ?)",
      [descripcion, motivo, monto]
    );
  },
  async createWithVentaId(descripcion: string, motivo: string, monto: number, ventas_id: number) {
    const database = await db;
    return database.runAsync(
      "INSERT INTO ventas_varias (descripcion, motivo, monto, ventas_id) VALUES (?, ?, ?, ?)",
      [descripcion, motivo, monto, ventas_id]
    );
  },
  async update(id: number, descripcion: string, motivo: string, monto: number) {
    const database = await db;
    return database.runAsync(
      "UPDATE ventas_varias SET descripcion = ?, motivo = ?, monto = ? WHERE id = ?",
      [descripcion, motivo, monto, id]
    );
  },
  async delete(id: number) {
    const database = await db;
    return database.runAsync("DELETE FROM ventas_varias WHERE id = ?", [id]);
  },
  async getTotalVentasVarias() {
    const database = await db;
    const result = await database.getFirstAsync("SELECT SUM(monto) as total FROM ventas_varias WHERE ventas_id IS NULL");
    return (result as any)?.total || 0;
  }
};
