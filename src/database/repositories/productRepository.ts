import { db } from "../database";
import * as FileSystem from "expo-file-system/legacy";

export const ProductRepository = {
  async getAll() {
    const database = await db;
    return database.getAllAsync(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias c ON p.categoria_id = c.id
    `);
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

  async create(
    nombre: string,
    precio: number,
    stock: number,
    codigo: string,
    codigoBarras: string,
    categoria_id: number,
    imagen: string,
    info_relevante: string
  ) {
    const database = await db;
    return database.runAsync(
      "INSERT INTO productos (nombre,precio,stock,codigo,codigo_barras,categoria_id,imagen,info_relevante) VALUES (?,?,?,?,?,?,?,?)",
      [
        nombre,
        precio,
        stock,
        codigo,
        codigoBarras,
        categoria_id,
        imagen,
        info_relevante,
      ]
    );
  },
  async update(
    id: number,
    nombre: string,
    precio: number,
    stock: number,
    codigo: string,
    categoria_id: number,
    imagen: string,
    info_relevante: string
  ) {
    const database = await db;
    return database.runAsync(
      "UPDATE productos SET nombre=?,precio=?,stock=?,codigo=?, categoria_id = ?,imagen=?,info_relevante=? WHERE id=?",
      [nombre, precio, stock, codigo, categoria_id, imagen, info_relevante, id]
    );
  },

  async adjustStock(id: number, cantidad: number) {
    (await db).runAsync(`UPDATE productos SET stock= stock + ? WHERE id=?`, [
      cantidad,
      id,
    ]);
  },
  async delete(id: number, imagenPath?: string) {
    if (imagenPath) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(imagenPath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(imagenPath);
        }
      } catch (error) {
        console.log("Error al eliminar archivo de imagen:", error);
      }
    }
    const database = await db;
    return database.runAsync(`DELETE FROM productos WHERE id=?`, [id]);
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

  async searchByCodigoBarras(codigoBarras: string) {
    const database = await db;
    return database.getFirstAsync(
      "SELECT * FROM productos WHERE codigo_barras = ?",
      [codigoBarras]
    );
  },
};
