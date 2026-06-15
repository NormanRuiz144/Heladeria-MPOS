import { db } from "./database";

export const runMigrations = async () => {
  try {
    (await db).execAsync(`
      CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      codigo_barras TEXT UNIQUE,
      precio REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      codigo TEXT,
      create_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      ruc TEXT UNIQUE,
      telefono TEXT NULL
      );
      
      CREATE TABLE IF NOT EXISTS ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_cliente INTEGER,
      total REAL,
      fecha TEXT DEFAULT CURRENT_TIMESTAMP,
      monto_pagado REAL,
      cambio REAL
      );

      CREATE TABLE IF NOT EXISTS detalle_ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ventas_id INTEGER,
      product_id INTEGER,
      cantidad INTEGER,
      precio REAL
      );

      CREATE TABLE IF NOT EXISTS movimientos_inventario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      descripcion TEXT,
      tipo TEXT,
      cantidad INTEGER,
      fecha TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS metodo_pago (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_venta INTEGER NOT NULL,
      metodo_pago TEXT NOT NULL,
      monto REAL NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS empresa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,      
      impuesto REAL NOT NULL
      );
      
      -- Alteraciones de columnas
      --ALTER TABLE productos ADD COLUMN codigo_barras TEXT;
      --ALTER TABLE ventas ADD COLUMN id_cliente INTEGER;
      --ALTER TABLE ventas DROP COLUMN id_cliente INTEGER;
      --DROP TABLE IF EXISTS clientes;

      -- Crear indices para mejorar el rendimiento de las consultas
      -- CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo_barras);
      -- CREATE INDEX IF NOT EXISTS idx_clientes_ruc ON clientes(ruc);
    `);

    const database = await db;
    try {
      await database.runAsync(
        "ALTER TABLE movimientos_inventario ADD COLUMN estado BOOLEAN DEFAULT false"
      );
    } catch {}
    try {
      await database.runAsync(
        "ALTER TABLE movimientos_inventario ADD COLUMN id_venta INTEGER DEFAULT NULL"
      );
    } catch {}
    try {
      await database.runAsync(
        "ALTER TABLE ventas ADD COLUMN estado BOOLEAN DEFAULT false"
      );
    } catch {}

    try {
      await database.runAsync(`
        INSERT INTO metodo_pago (id_venta, metodo_pago, monto)
        SELECT id, metodo_pago, monto_pagado FROM ventas
        WHERE metodo_pago IS NOT NULL
        AND id NOT IN (SELECT DISTINCT id_venta FROM metodo_pago)
      `);
    } catch {}

    try {
      await database.runAsync("ALTER TABLE ventas DROP COLUMN metodo_pago");
    } catch {}
    // try {
    //   await database.runAsync("ALTER TABLE clientes ADD COLUMN ruc TEXT");
    // } catch {}
    // try {
    //   await database.runAsync(
    //     "CREATE INDEX IF NOT EXISTS idx_clientes_ruc ON clientes(ruc)"
    //   );
    // } catch {}
  } catch (error) {
    console.log("Migration error:", error);
  }
};
