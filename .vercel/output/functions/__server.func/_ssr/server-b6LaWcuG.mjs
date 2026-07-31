import { n as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-b6LaWcuG.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var RTDB_ROOT = "https://zynlo-crm-default-rtdb.firebaseio.com";
var COLLECTIONS = [
	"agents",
	"customers",
	"clients",
	"calls",
	"messages"
];
function uid() {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
async function rtdbFetch(path, init) {
	const url = `${RTDB_ROOT}${path.startsWith("/") ? path : `/${path}`}`;
	const res = await fetch(url, {
		...init,
		headers: {
			Accept: "application/json",
			...init?.body ? { "Content-Type": "application/json" } : {},
			...init?.headers || {}
		},
		cache: "no-store"
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Firebase ${init?.method || "GET"} ${path} failed (${res.status}): ${text || res.statusText}`);
	}
	const text = await res.text();
	if (!text || text === "null") return null;
	return JSON.parse(text);
}
/** Turn list or sparse numeric-key object into id-keyed map. */
function toIdMap(raw) {
	if (!raw) return {};
	if (Array.isArray(raw)) {
		const m = {};
		for (const item of raw) {
			if (!item || typeof item !== "object") continue;
			const row = item;
			const id = String(row.id || uid());
			m[id] = {
				...row,
				id
			};
		}
		return m;
	}
	if (typeof raw === "object") {
		const m = {};
		for (const [key, item] of Object.entries(raw)) {
			if (!item || typeof item !== "object") continue;
			const row = item;
			const id = String(row.id || key);
			m[id] = {
				...row,
				id
			};
		}
		return m;
	}
	return {};
}
function needsMigration(raw) {
	if (raw == null) return false;
	if (Array.isArray(raw)) return true;
	if (typeof raw === "object") return Object.keys(raw).some((k) => /^\d+$/.test(k));
	return false;
}
var migratePromise = null;
/** One-time (per process) convert array collections → maps by id. */
async function ensureFirebaseMaps() {
	if (!migratePromise) migratePromise = (async () => {
		const root = await rtdbFetch("/.json");
		if (!root) return;
		const updates = {};
		for (const col of COLLECTIONS) {
			const raw = root[col];
			if (needsMigration(raw)) updates[col] = toIdMap(raw);
			else if (raw == null) {} else if (typeof raw === "object" && !Array.isArray(raw)) updates[col] = toIdMap(raw);
		}
		for (const col of COLLECTIONS) {
			const raw = root[col];
			if (needsMigration(raw)) {
				await rtdbFetch(`/${col}.json`, {
					method: "PUT",
					body: JSON.stringify(updates[col] || {})
				});
				console.log("[firebase] migrated", col, "to id-map");
			}
		}
	})().catch((err) => {
		migratePromise = null;
		throw err;
	});
	await migratePromise;
}
function mapAgent(r) {
	return {
		id: String(r.id),
		name: String(r.name || ""),
		email: String(r.email || ""),
		role: String(r.role || "Agent"),
		status: r.status || "Active"
	};
}
function mapCustomer(r) {
	return {
		id: String(r.id),
		name: String(r.name || ""),
		phone: String(r.phone || ""),
		email: String(r.email || ""),
		company: String(r.company || ""),
		clientId: r.clientId ? String(r.clientId) : null,
		notes: String(r.notes || "")
	};
}
function mapClient(r) {
	return {
		id: String(r.id),
		name: String(r.name || ""),
		industry: String(r.industry || ""),
		phone: String(r.phone || ""),
		email: String(r.email || ""),
		website: String(r.website || ""),
		status: r.status || "Active",
		address: String(r.address || ""),
		notes: String(r.notes || "")
	};
}
function mapCall(r) {
	return {
		id: String(r.id),
		datetime: String(r.datetime || ""),
		agentId: String(r.agentId || ""),
		customerId: String(r.customerId || ""),
		clientId: r.clientId ? String(r.clientId) : null,
		type: r.type || "Inbound",
		duration: Number(r.duration) || 0,
		outcome: r.outcome || "Resolved",
		rating: r.rating == null || r.rating === "" ? null : Number(r.rating),
		notes: String(r.notes || "")
	};
}
function mapMessage(r) {
	return {
		id: String(r.id),
		datetime: String(r.datetime || ""),
		agentId: String(r.agentId || ""),
		customerId: String(r.customerId || ""),
		clientId: r.clientId ? String(r.clientId) : null,
		channel: r.channel || "SMS",
		direction: r.direction || "Inbound",
		subject: String(r.subject || ""),
		body: String(r.body || ""),
		status: r.status || "Open",
		notes: String(r.notes || "")
	};
}
function valuesSorted(map, by) {
	const list = Object.values(map);
	if (by === "name") return list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
	return list.sort((a, b) => new Date(String(b.datetime || 0)).getTime() - new Date(String(a.datetime || 0)).getTime());
}
async function firebaseLoadAll() {
	await ensureFirebaseMaps();
	const root = await rtdbFetch("/.json") || {};
	return {
		agents: valuesSorted(toIdMap(root.agents), "name").map(mapAgent),
		customers: valuesSorted(toIdMap(root.customers), "name").map(mapCustomer),
		clients: valuesSorted(toIdMap(root.clients), "name").map(mapClient),
		calls: valuesSorted(toIdMap(root.calls), "datetime").map(mapCall),
		messages: valuesSorted(toIdMap(root.messages), "datetime").map(mapMessage)
	};
}
async function putItem(collection, id, row) {
	await ensureFirebaseMaps();
	await rtdbFetch(`/${collection}/${encodeURIComponent(id)}.json`, {
		method: "PUT",
		body: JSON.stringify({
			...row,
			id,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		})
	});
}
async function deleteItem(collection, id) {
	await ensureFirebaseMaps();
	await rtdbFetch(`/${collection}/${encodeURIComponent(id)}.json`, { method: "DELETE" });
}
async function firebaseUpsertAgent(input) {
	const name = input.name.trim();
	if (!name) throw new Error("Name is required");
	const id = input.id || uid();
	const row = {
		id,
		name,
		email: (input.email || "").trim(),
		role: input.role || "Agent",
		status: input.status || "Active"
	};
	await putItem("agents", id, row);
	return mapAgent(row);
}
async function firebaseDeleteAgent(id) {
	await deleteItem("agents", id);
}
async function firebaseUpsertCustomer(input) {
	const name = input.name.trim();
	const phone = input.phone.trim();
	if (!name || !phone) throw new Error("Name and phone are required");
	const id = input.id || uid();
	const row = {
		id,
		name,
		phone,
		email: (input.email || "").trim(),
		company: (input.company || "").trim(),
		clientId: input.clientId || null,
		notes: ""
	};
	await putItem("customers", id, row);
	return mapCustomer(row);
}
async function firebaseDeleteCustomer(id) {
	await deleteItem("customers", id);
}
async function firebaseUpsertClient(input) {
	const name = input.name.trim();
	if (!name) throw new Error("Company name is required");
	const id = input.id || uid();
	const row = {
		id,
		name,
		industry: (input.industry || "").trim(),
		phone: (input.phone || "").trim(),
		email: (input.email || "").trim(),
		website: (input.website || "").trim(),
		status: input.status || "Active",
		address: (input.address || "").trim(),
		notes: (input.notes || "").trim()
	};
	await putItem("clients", id, row);
	return mapClient(row);
}
async function firebaseDeleteClient(id) {
	await deleteItem("clients", id);
}
async function firebaseUpsertCall(input) {
	if (!input.datetime || !input.agentId || !input.customerId) throw new Error("Datetime, agent, and customer are required");
	const id = input.id || uid();
	const rating = input.rating == null || input.rating === "" ? null : Number(input.rating);
	const row = {
		id,
		datetime: input.datetime,
		agentId: input.agentId,
		customerId: input.customerId,
		clientId: input.clientId || null,
		type: input.type || "Inbound",
		duration: Number(input.duration) || 0,
		outcome: input.outcome || "Resolved",
		rating,
		notes: (input.notes || "").trim()
	};
	await putItem("calls", id, row);
	return mapCall(row);
}
async function firebaseDeleteCall(id) {
	await deleteItem("calls", id);
}
async function firebaseUpsertMessage(input) {
	if (!input.datetime || !input.agentId || !input.customerId) throw new Error("Datetime, agent, and customer are required");
	const body = (input.body || "").trim();
	if (!body) throw new Error("Message body is required");
	const id = input.id || uid();
	const row = {
		id,
		datetime: input.datetime,
		agentId: input.agentId,
		customerId: input.customerId,
		clientId: input.clientId || null,
		channel: input.channel || "SMS",
		direction: input.direction || "Inbound",
		subject: (input.subject || "").trim(),
		body,
		status: input.status || "Open",
		notes: (input.notes || "").trim()
	};
	await putItem("messages", id, row);
	return mapMessage(row);
}
async function firebaseDeleteMessage(id) {
	await deleteItem("messages", id);
}
var getAllData_createServerFn_handler = createServerRpc({
	id: "7a0b35f97bc22a1926b37460e302eefd4d59c949892cf5d551f57fe0e0cc6c99",
	name: "getAllData",
	filename: "src/lib/zynlo/server.ts"
}, (opts) => getAllData.__executeServer(opts));
var getAllData = createServerFn({ method: "GET" }).handler(getAllData_createServerFn_handler, async () => firebaseLoadAll());
var getStorageMode_createServerFn_handler = createServerRpc({
	id: "0ac55d47f0342569c31a58a5ac369acfe1da2b2c9ec26c3d010af713150b8734",
	name: "getStorageMode",
	filename: "src/lib/zynlo/server.ts"
}, (opts) => getStorageMode.__executeServer(opts));
var getStorageMode = createServerFn({ method: "GET" }).handler(getStorageMode_createServerFn_handler, async () => ({
	source: "firebase",
	cloud: true,
	label: "Firebase Realtime Database (shared)"
}));
var saveAgent_createServerFn_handler = createServerRpc({
	id: "1c0926fbb6ea350a61ed7814a761531fbc3df3ec1464cf6574c5fbef7d60e991",
	name: "saveAgent",
	filename: "src/lib/zynlo/server.ts"
}, (opts) => saveAgent.__executeServer(opts));
var saveAgent = createServerFn({ method: "POST" }).validator((d) => d).handler(saveAgent_createServerFn_handler, async ({ data }) => firebaseUpsertAgent(data));
var deleteAgent_createServerFn_handler = createServerRpc({
	id: "1aab58855d90df3fb70d76f00b68eb5d12ad4ba43e457e26d64aa3921795a501",
	name: "deleteAgent",
	filename: "src/lib/zynlo/server.ts"
}, (opts) => deleteAgent.__executeServer(opts));
var deleteAgent = createServerFn({ method: "POST" }).validator((d) => d).handler(deleteAgent_createServerFn_handler, async ({ data }) => {
	await firebaseDeleteAgent(data.id);
	return { ok: true };
});
var saveCustomer_createServerFn_handler = createServerRpc({
	id: "50e6be06f0b2831bcd80980c9ca4cb9c248b9b459c77b822b27b452026a40c4b",
	name: "saveCustomer",
	filename: "src/lib/zynlo/server.ts"
}, (opts) => saveCustomer.__executeServer(opts));
var saveCustomer = createServerFn({ method: "POST" }).validator((d) => d).handler(saveCustomer_createServerFn_handler, async ({ data }) => firebaseUpsertCustomer(data));
var deleteCustomer_createServerFn_handler = createServerRpc({
	id: "8ed78f52680f12f3815a7e3555b4911e9db9b731e0b449666b8cecd3ab2368a0",
	name: "deleteCustomer",
	filename: "src/lib/zynlo/server.ts"
}, (opts) => deleteCustomer.__executeServer(opts));
var deleteCustomer = createServerFn({ method: "POST" }).validator((d) => d).handler(deleteCustomer_createServerFn_handler, async ({ data }) => {
	await firebaseDeleteCustomer(data.id);
	return { ok: true };
});
var saveClient_createServerFn_handler = createServerRpc({
	id: "72da098738cac099623266b617a02dab7e4fe5b081d3544dc07996d0dbef5e44",
	name: "saveClient",
	filename: "src/lib/zynlo/server.ts"
}, (opts) => saveClient.__executeServer(opts));
var saveClient = createServerFn({ method: "POST" }).validator((d) => d).handler(saveClient_createServerFn_handler, async ({ data }) => firebaseUpsertClient(data));
var deleteClient_createServerFn_handler = createServerRpc({
	id: "deee10331dd88a5ff97e91cc139afb0c93aae2ab7f03e8a0f8b5eb0ed4de6adc",
	name: "deleteClient",
	filename: "src/lib/zynlo/server.ts"
}, (opts) => deleteClient.__executeServer(opts));
var deleteClient = createServerFn({ method: "POST" }).validator((d) => d).handler(deleteClient_createServerFn_handler, async ({ data }) => {
	await firebaseDeleteClient(data.id);
	return { ok: true };
});
var saveCall_createServerFn_handler = createServerRpc({
	id: "546a5d52727c545a8476cbc19bbd89c2044eaf2a6024fd449aa84b10c3a2f773",
	name: "saveCall",
	filename: "src/lib/zynlo/server.ts"
}, (opts) => saveCall.__executeServer(opts));
var saveCall = createServerFn({ method: "POST" }).validator((d) => d).handler(saveCall_createServerFn_handler, async ({ data }) => firebaseUpsertCall(data));
var deleteCall_createServerFn_handler = createServerRpc({
	id: "ed7ecdc4db7b1e406d8334cbea057c8b365399b81b235c810f5d6ee07f50b6fc",
	name: "deleteCall",
	filename: "src/lib/zynlo/server.ts"
}, (opts) => deleteCall.__executeServer(opts));
var deleteCall = createServerFn({ method: "POST" }).validator((d) => d).handler(deleteCall_createServerFn_handler, async ({ data }) => {
	await firebaseDeleteCall(data.id);
	return { ok: true };
});
var saveMessage_createServerFn_handler = createServerRpc({
	id: "1d7a446dada714074d111ee28ddf4825523e5f9533573346914a0ac6858528fe",
	name: "saveMessage",
	filename: "src/lib/zynlo/server.ts"
}, (opts) => saveMessage.__executeServer(opts));
var saveMessage = createServerFn({ method: "POST" }).validator((d) => d).handler(saveMessage_createServerFn_handler, async ({ data }) => firebaseUpsertMessage(data));
var deleteMessage_createServerFn_handler = createServerRpc({
	id: "ee0dc78d8172a3fbe5314144768d924fd23b4f0149a04acb25741d08add2763b",
	name: "deleteMessage",
	filename: "src/lib/zynlo/server.ts"
}, (opts) => deleteMessage.__executeServer(opts));
var deleteMessage = createServerFn({ method: "POST" }).validator((d) => d).handler(deleteMessage_createServerFn_handler, async ({ data }) => {
	await firebaseDeleteMessage(data.id);
	return { ok: true };
});
//#endregion
export { deleteAgent_createServerFn_handler, deleteCall_createServerFn_handler, deleteClient_createServerFn_handler, deleteCustomer_createServerFn_handler, deleteMessage_createServerFn_handler, getAllData_createServerFn_handler, getStorageMode_createServerFn_handler, saveAgent_createServerFn_handler, saveCall_createServerFn_handler, saveClient_createServerFn_handler, saveCustomer_createServerFn_handler, saveMessage_createServerFn_handler };
