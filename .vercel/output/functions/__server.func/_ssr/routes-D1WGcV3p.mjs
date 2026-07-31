import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as createServerFn, r as getServerFnById, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D1WGcV3p.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getAllData = createServerFn({ method: "GET" }).handler(createSsrRpc("7a0b35f97bc22a1926b37460e302eefd4d59c949892cf5d551f57fe0e0cc6c99"));
var saveAgent = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("1c0926fbb6ea350a61ed7814a761531fbc3df3ec1464cf6574c5fbef7d60e991"));
var deleteAgent = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("1aab58855d90df3fb70d76f00b68eb5d12ad4ba43e457e26d64aa3921795a501"));
var saveCustomer = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("50e6be06f0b2831bcd80980c9ca4cb9c248b9b459c77b822b27b452026a40c4b"));
var deleteCustomer = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("8ed78f52680f12f3815a7e3555b4911e9db9b731e0b449666b8cecd3ab2368a0"));
var saveClient = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("72da098738cac099623266b617a02dab7e4fe5b081d3544dc07996d0dbef5e44"));
var deleteClient = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("deee10331dd88a5ff97e91cc139afb0c93aae2ab7f03e8a0f8b5eb0ed4de6adc"));
var saveCall = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("546a5d52727c545a8476cbc19bbd89c2044eaf2a6024fd449aa84b10c3a2f773"));
var deleteCall = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("ed7ecdc4db7b1e406d8334cbea057c8b365399b81b235c810f5d6ee07f50b6fc"));
var $$splitComponentImporter = () => import("./routes-CtOJuaz8.mjs");
var Route = createFileRoute("/")({
	loader: () => getAllData(),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { deleteCustomer as a, saveCall as c, deleteClient as i, saveClient as l, deleteAgent as n, getAllData as o, deleteCall as r, saveAgent as s, Route as t, saveCustomer as u };
