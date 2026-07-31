import { c as HeadContent, d as Outlet, h as require_jsx_runtime, m as createRootRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$1 } from "./routes-CQ_Ekgih.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BXH1-OSC.js
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-D_8xbXu1.css";
var Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
			},
			{ title: "Zynlo" },
			{
				name: "description",
				content: "Zynlo call center operations."
			},
			{
				name: "theme-color",
				content: "#a743ff"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon-32.png"
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			}
		]
	}),
	component: RootComponent
});
function RootComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootDocument, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
function RootDocument({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
var rootRouteChildren = { IndexRoute: Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route
}) };
var routeTree = Route._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
	return createRouter({
		routeTree,
		defaultPreload: "intent",
		scrollRestoration: true
	});
}
//#endregion
export { getRouter };
