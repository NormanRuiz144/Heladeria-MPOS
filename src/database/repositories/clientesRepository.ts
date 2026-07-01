import { db } from "../database";

export interface Cliente {
  id: number;
  nombre: string;
  ruc: string;
  telefono: string;
}

export const clientesRepository = {
  async getAll() {
    const database = await db;
    return database.getAllAsync("SELECT * FROM clientes ORDER BY id DESC");
  },

  async create(nombre: string, ruc: string, telefono: string) {
    return (await db).runAsync(
      "INSERT INTO clientes (nombre, ruc, telefono) VALUES (?, ?, ?)",
      [nombre, ruc, telefono]
    );
  },
  async search(parametro: string) {
    return (await db).getAllAsync(
      "SELECT * FROM clientes WHERE nombre LIKE ? OR ruc LIKE ?",
      [`%${parametro}%`, `%${parametro}%`]
    );
  },
  async getByRuc(ruc: string) {
    return (await db).getFirstAsync("SELECT * FROM clientes WHERE ruc = ?", [
      ruc,
    ]);
  },
  async getById(id: number) {
    return (await db).getFirstAsync("SELECT * FROM clientes WHERE id = ?", [
      id,
    ]);
  },
  async update(id: number, nombre: string, ruc: string, telefono: string) {
    return (await db).runAsync(
      "UPDATE clientes SET nombre=?, ruc=?, telefono=? WHERE id=?",
      [nombre, ruc, telefono, id]
    );
  },
};
