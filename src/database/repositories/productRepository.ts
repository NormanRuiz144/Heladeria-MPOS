import { db } from "../database";

export const ProductRepository = {
  async getAll() {
    const database = await db;
    return database.getAllAsync("SELECT * FROM productos");
  },

  async getById(id: number) {
    const database = await db;
    return database.getFirstAsync("SELECT * FROM productos WHERE id = ?", [id]);
  },

  async search(term: string) {
    const database = await db;
    const like = `%${term}%`;
    return database.getAllAsync(
      `SELECT * FROM productos WHERE nombre LIKE ? OR codigo LIKE ?`,
      [like, like]
    );
  },

  async create(nombre: string, precio: number, stock: number, codigo: string) {
    const database = await db;
    return database.runAsync(
      "INSERT INTO productos (nombre,precio,stock,codigo) VALUES (?,?,?,?)",
      [nombre, precio, stock, codigo]
    );
  },
  async update(
    id: number,
    nombre: string,
    precio: number,
    stock: number,
    codigo: string
  ) {
    const database = await db;
    return database.runAsync(
      "UPDATE productos SET nombre=?,precio=?,stock=?,codigo=? WHERE id=?",
      [nombre, precio, stock, codigo, id]
    );
  },

  async adjustStock(id: number, cantidad: number) {
    (await db).runAsync(`UPDATE productos SET stock= stock + ? WHERE id=?`, [
      cantidad,
      id,
    ]);
  },
  async delete(id: number) {
    const database = db;
    (await database).runAsync(`DELETE FROM productos WHERE id=?`, [id]);
  },

  async isCodigoUnique(codigo: string, excludeId?: number) {
    const database = await db;
    const query = excludeId
      ? "SELECT COUNT(*) as count FROM productos WHERE codigo = ? AND id != ?"
      : "SELECT COUNT(*) as count FROM productos WHERE codigo = ?";
    const params = excludeId ? [codigo, excludeId] : [codigo];
    const result = await database.getFirstAsync(query, params);
    return (result as any).count === 0;
  },

  
};
