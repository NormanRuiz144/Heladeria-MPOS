# Guía de Cambios - Unificación de Ventas (Opción A: Pseudo-Productos)

## Fecha: 30/06/2026

## Descripción General
Se unificaron los dos tipos de venta ("Ventas" de productos y "Ventas Varias") en un solo flujo usando pseudo-productos. Los extras ahora se agregan al carrito como productos con `codigo = "EXTRA"`, permitiendo ventas combinadas o solo extras.

---

## Archivos Modificados (8 archivos)

### 1. `src/store/cartStore.ts`
**Reversión completa** al estado original. Se eliminaron:
- Interfaz `ExtraCartItem`
- Estado `extraItems`
- Métodos `addExtraItem` / `removeExtraItem`
- Lógica de `extraTotal` en `calcularTotal`

El store ahora solo maneja `items: CartItem[]`, donde los extras son pseudo-productos con `codigo === "EXTRA"`.

---

### 2. `src/app/(tabs)/pos.tsx`
**Líneas 1,21-23** — Importación: se agregó `useState` y se cambió `addExtraItem` por `addItem` del store.

**Líneas 35-49** — `agregarExtraAlCarrito`: en lugar de usar `addExtraItem`, crea un pseudo-producto con `id = -Date.now()`, `nombre = descripción (+ motivo)`, `precio = monto`, `codigo = "EXTRA"`, `info_relevante = motivo`. Luego usa `addItem(extraProduct)` para agregarlo al carrito como un item normal.

**Líneas 66** — Condición `{items.length === 0 ? (` restaurada a la original. Como los extras son pseudo-productos en `items`, cuando hay extras `items.length > 0` y el `Cart` se muestra correctamente.

---

### 3. `src/componentes/Cart.tsx`
**Líneas 37-68** — Renderizado condicional basado en `item.product.codigo === "EXTRA"`:
- **EXTRA**: muestra nombre, motivo (info_relevante), monto en verde, solo botón eliminar (sin +/-).
- **Normal**: muestra nombre, precio x cantidad = total, controles +/- y eliminar.

**Línea 40** — `extraItem` style: fondo `#fff9f0`, borde izquierdo naranja de 3px.

**Líneas 114-117** — Nuevos estilos: `extraItem`, `motivo`, `extraAmount`.

---

### 4. `src/componentes/ProcessSale.tsx`
**Líneas 108-127** — Separación de lógica por tipo:
- Si `item.product.codigo === "EXTRA"` → guarda en `ventas_varias` via `VariosRepository.createWithVentaId` (con `ventas_id` de la venta).
- Si **no** es EXTRA → guarda en `detalle_ventas`, crea movimiento de inventario y ajusta stock (comportamiento original).

**Líneas 20-21** — Eliminado `extraItems` del store.

**Línea 147** — `saleData` ya no incluye `extraItems` (los extras están dentro de `items`).

---

### 5. `src/print_service/Print.tsx`
**Líneas 23-38** — `PrintTicket`: cada item se verifica con `item.product.codigo === "EXTRA"`. Si es EXTRA se renderiza con fondo `#f5f5f5` y sin cantidad. Si es normal, se renderiza como antes.

**Líneas 132-149** — `PrintInvoice`: misma lógica. Los EXTRA se muestran con código "EXTRA", fondo gris claro, cantidad 1 y precio = subtotal = monto.

**Parámetros**: se eliminó el parámetro `extraItems` de ambas funciones.

---

### 6. `src/componentes/PrintOptionsModal.tsx`
**Líneas 48-60** — Vista previa: se verifica `item.product.codigo === "EXTRA"` para aplicar fondo `#fff9f0` y ocultar cantidad.

**Interfaz `PrintOptionsModalProps`**: se eliminó `extraItems` del `saleData`.

---

### 7. `src/componentes/SalesHistory.tsx`
**Líneas 114-127** — `printVoucher`: después de cargar productos, también carga extras vinculados via `VariosRepository.getByVentaId(id)` y los convierte a pseudo-productos `CartItem` con `codigo = "EXTRA"`, `id = -e.id`.

**Línea 130** — `allItems = [...productos, ...extras]` combinados en un solo array.

**Línea 143** — `selectedPrintData.items = allItems` (ya no se separan).

---

### 8. `src/database/repositories/variosRepository.ts`
**Sin cambios** respecto a la versión anterior. Se mantienen:
- `createWithVentaId` — para guardar extras vinculados a una venta.
- `getByVentaId` — para cargar extras al reimprimir desde historial.
- `getReportByDateRange` — filtra con `WHERE ventas_id IS NULL`.

---

## Resumen del Nuevo Flujo

### Venta combinada (productos + extras):
1. Buscar y agregar productos → se agregan a `items` (como siempre)
2. Presionar "Agregar Extra" → llenar descripción, motivo, monto
3. Se crea un pseudo-producto con `codigo: "EXTRA"` y se agrega al mismo `items`
4. `items.length > 0` → se muestra `Cart` con todos los items
5. Presionar "Procesar Venta" → modal de pago → confirmar
6. En la BD:
   - Items normales → `detalle_ventas` + movimiento inventario + ajuste stock
   - Items EXTRA → `ventas_varias` con `ventas_id` vinculado
7. Ticket/Factura muestran todo junto (extras con fondo distintivo)

### Venta extra sola:
1. Presionar "Agregar Extra" → llenar formulario
2. Se crea pseudo-producto EXTRA en `items`
3. `items.length > 0` → se muestra `Cart` con el extra
4. Botón "Procesar Venta" habilitado → flujo normal de pago
5. Se guarda solo en `ventas_varias` (sin stock, sin detalle_ventas)

### Reimpresión desde historial:
- Se cargan productos de `detalle_ventas` y extras de `ventas_varias`
- Se convierten a `CartItem[]` (extras como pseudo-productos)
- Se pasa un solo array `items` a `PrintTicket`/`PrintInvoice`
- Los extras se renderizan con formato especial (fondo distintivo)

### Reportes:
- Extras vinculados a ventas (`ventas_id IS NOT NULL`) se excluyen del reporte de extras (evita doble conteo)
- Extras independientes (`ventas_id IS NULL`) siguen apareciendo como "EXTRA"
- El total del período suma ventas (con sus extras incluidos) + extras independientes

---

## Mejora: Indicador visual de ventas con extras en Reportes

**Fecha:** 30/06/2026

**Problema:** Las ventas combinadas (productos + extras) se mostraban idénticas a las ventas normales en el apartado Reportes. No se podía diferenciar visualmente.

**Archivos Modificados (2):**

### 1. `src/app/(tabs)/reportes.tsx`
**Líneas 67-68** — `generarReporte`: después de cargar `metodos_pago`, se consultan extras vinculados via `VariosRepository.getByVentaId(venta.id)` y se asigna flag `tiene_extras` a la venta.

**Línea 178** — Se pasa prop `tieneExtras={(item as any).tiene_extras}` al componente `<SalesCard>`.

### 2. `src/componentes/SalesCard.tsx`
**Línea 11** — Nuevo prop opcional `tieneExtras?: boolean` en `SaleCardProps`.

**Líneas 37-43** — Renderizado condicional: si `tieneExtras` es `true`, se muestra un badge con fondo `#fff3e0`, borde izquierdo naranja `#ff9800`, icono `plus-circle` y texto "Incluye Extra".

**Líneas 139-150** — Nuevos estilos: `extraBadge` y `extraBadgeText`.

### Visual resultante en Reportes:
| Tipo | Apariencia (pantalla) | Apariencia (PDF) |
|---|---|---|
| Venta normal | Card blanco sin indicador | Fila blanca, ID `#123` |
| Venta combinada (prod + extras) | Card blanco con badge naranja "Incluye Extra" | Fila fondo `#fff9f0`, ID `#123 + EXTRA` |
| Extra independiente | Card naranja "Venta Extra:" | Fila fondo `#e8f5e9`, ID `EXTRA` |

### 3. `src/print_service/Print.tsx`
**Líneas 359-370** — `PrintSalesReport`: al generar la fila HTML de una venta, se verifica `item.tiene_extras`. Si es `true`, se agrega fondo `#fff9f0` a la fila `<tr>` y se muestra `#${item.id} + EXTRA` en la primera celda. Si es `false`, se mantiene el comportamiento original (fondo blanco).
