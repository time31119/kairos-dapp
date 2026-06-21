import { pgTable, serial, timestamp, index, unique, uuid, varchar, foreignKey, text, jsonb, boolean, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	walletAddress: varchar("wallet_address", { length: 50 }),
	phone: varchar({ length: 20 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_users_wallet").using("btree", table.walletAddress.asc().nullsLast().op("text_ops")),
	unique("users_wallet_address_key").on(table.walletAddress),
	unique("users_phone_key").on(table.phone),
]);

export const userBinanceApi = pgTable("user_binance_api", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	apiKey: varchar("api_key", { length: 100 }),
	apiSecretEncrypted: text("api_secret_encrypted"),
	permissions: jsonb().default(["spot"]),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_binance_api_user_id_fkey"
		}).onDelete("cascade"),
]);

export const userPositions = pgTable("user_positions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	symbol: varchar({ length: 20 }),
	amount: numeric({ precision: 20, scale:  8 }),
	avgPrice: numeric("avg_price", { precision: 20, scale:  8 }),
	currentPrice: numeric("current_price", { precision: 20, scale:  8 }),
	pnl: numeric({ precision: 20, scale:  10 }),
	pnlPercent: numeric("pnl_percent", { precision: 10, scale:  4 }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_positions_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_positions_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_positions_user_id_symbol_key").on(table.userId, table.symbol),
]);

export const userOrders = pgTable("user_orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	orderId: varchar("order_id", { length: 50 }),
	symbol: varchar({ length: 20 }),
	side: varchar({ length: 10 }),
	price: numeric({ precision: 20, scale:  8 }),
	amount: numeric({ precision: 20, scale:  8 }),
	filled: numeric({ precision: 20, scale:  8 }),
	status: varchar({ length: 20 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_orders_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_orders_user_id_fkey"
		}).onDelete("cascade"),
]);

export const subscriptions = pgTable("subscriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	planId: varchar("plan_id", { length: 20 }),
	billingCycle: varchar("billing_cycle", { length: 20 }),
	status: varchar({ length: 20 }).default('pending'),
	txHash: varchar("tx_hash", { length: 100 }),
	amount: numeric({ precision: 20, scale:  8 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_subscriptions_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "subscriptions_user_id_fkey"
		}).onDelete("cascade"),
]);
