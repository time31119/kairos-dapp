import { relations } from "drizzle-orm/relations";
import { users, userBinanceApi, userPositions, userOrders, subscriptions } from "./schema";

export const userBinanceApiRelations = relations(userBinanceApi, ({one}) => ({
	user: one(users, {
		fields: [userBinanceApi.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userBinanceApis: many(userBinanceApi),
	userPositions: many(userPositions),
	userOrders: many(userOrders),
	subscriptions: many(subscriptions),
}));

export const userPositionsRelations = relations(userPositions, ({one}) => ({
	user: one(users, {
		fields: [userPositions.userId],
		references: [users.id]
	}),
}));

export const userOrdersRelations = relations(userOrders, ({one}) => ({
	user: one(users, {
		fields: [userOrders.userId],
		references: [users.id]
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
}));