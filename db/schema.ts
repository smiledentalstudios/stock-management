import {
  pgTable,
  integer,
  serial,
  text,
  boolean,
  timestamp,
  bigint,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Single-row table holding a revision counter. Every successful write bumps it,
// so devices can cheaply check whether anything changed since their last sync.
export const appMeta = pgTable("app_meta", {
  id: integer().primaryKey(),
  revision: bigint({ mode: "number" }).notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: serial().primaryKey(),
  name: text().notNull().unique(),
  url: text().notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const inventoryItems = pgTable(
  "inventory_items",
  {
    // Identity "by default" so imported records can keep their original IDs.
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    clinic: text().notNull().default("Tarneit"),
    position: integer().notNull().default(0),
    category: text().notNull().default("General"),
    name: text().notNull(),
    unit: text().notNull().default("Each"),
    stock: integer().notNull().default(0),
    minLevel: integer("min_level").notNull().default(0),
    onOrder: integer("on_order").notNull().default(0),
    supplier: text().notNull().default(""),
    sku: text().notNull().default(""),
    notes: text().notNull().default(""),
    photoKey: text("photo_key").notNull().default(""),
    orderSelected: boolean("order_selected").notNull().default(false),
    orderQty: integer("order_qty").notNull().default(0),
    orderSupplier: text("order_supplier").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    updatedBy: text("updated_by").notNull().default(""),
  },
  (t) => [index("inventory_items_clinic_position_idx").on(t.clinic, t.position, t.id)],
);

// One-off items requested on the Shopping List that are not permanent inventory.
export const customRequests = pgTable("custom_requests", {
  id: text().primaryKey(),
  clinic: text().notNull().default("Tarneit"),
  name: text().notNull(),
  qty: integer().notNull().default(1),
  unit: text().notNull().default("Each"),
  supplier: text().notNull().default(""),
  category: text().notNull().default("Custom order"),
  notes: text().notNull().default(""),
  photoKey: text("photo_key").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  createdBy: text("created_by").notNull().default(""),
});

export const orders = pgTable(
  "orders",
  {
    id: text().primaryKey(),
    clinic: text().notNull().default("Tarneit"),
    supplier: text().notNull().default(""),
    supplierOrderNo: text("supplier_order_no").notNull().default(""),
    // Calendar dates are stored as YYYY-MM-DD in the clinic's local time.
    dateOrdered: text("date_ordered").notNull().default(""),
    dateReceived: text("date_received").notNull().default(""),
    itemsSummary: text("items_summary").notNull().default(""),
    status: text().notNull().default("Order placed"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    createdBy: text("created_by").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("orders_clinic_created_idx").on(t.clinic, t.createdAt)],
);

export const orderLines = pgTable(
  "order_lines",
  {
    id: serial().primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    position: integer().notNull().default(0),
    productId: integer("product_id").references(() => inventoryItems.id, { onDelete: "set null" }),
    customId: text("custom_id"),
    name: text().notNull(),
    qty: integer().notNull().default(0),
    unit: text().notNull().default("Each"),
    photo: text().notNull().default(""),
    receivedQty: integer("received_qty").notNull().default(0),
    receivedDate: text("received_date").notNull().default(""),
  },
  (t) => [index("order_lines_order_idx").on(t.orderId, t.position)],
);

// Item-level delivery history. Each row is a change in the cumulative quantity received.
export const receiptEvents = pgTable(
  "receipt_events",
  {
    id: serial().primaryKey(),
    lineId: integer("line_id")
      .notNull()
      .references(() => orderLines.id, { onDelete: "cascade" }),
    eventDate: text("event_date").notNull(),
    delta: integer().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    createdBy: text("created_by").notNull().default(""),
  },
  (t) => [index("receipt_events_line_idx").on(t.lineId, t.id)],
);

// Audit trail of every change, keyed by a client-generated request ID so that a
// retried or duplicated request is applied at most once.
export const activityLog = pgTable(
  "activity_log",
  {
    id: serial().primaryKey(),
    requestId: text("request_id").notNull(),
    action: text().notNull(),
    userEmail: text("user_email").notNull().default(""),
    details: jsonb().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("activity_log_request_id_idx").on(t.requestId)],
);
