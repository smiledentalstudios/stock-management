-- Seed the existing supplier directory (same names, links and order as the app).
INSERT INTO "suppliers" ("name", "url", "sort_order") VALUES
  ('Orien Dental', 'https://oriendentalsupplies.com.au/', 1),
  ('Adam Dental', '', 2),
  ('Nu Medical', 'https://numedical.com.au/', 3),
  ('Henry Schein', 'https://www.henryschein.com.au/', 4),
  ('Amazon', 'https://www.amazon.com.au/', 5),
  ('AliExpress', 'https://www.aliexpress.com/', 6),
  ('Kmart', '', 7),
  ('SDI', '', 8)
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
INSERT INTO "app_meta" ("id", "revision") VALUES (1, 0) ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
-- Database-level guards so stock and receipt counts can never become invalid.
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_stock_nonneg" CHECK ("stock" >= 0 AND "min_level" >= 0 AND "on_order" >= 0 AND "order_qty" >= 0);
--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_received_range" CHECK ("qty" >= 0 AND "received_qty" >= 0 AND "received_qty" <= "qty");
--> statement-breakpoint
ALTER TABLE "custom_requests" ADD CONSTRAINT "custom_requests_qty_positive" CHECK ("qty" >= 1);
