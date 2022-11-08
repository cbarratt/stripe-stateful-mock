"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkout = void 0;
const AccountData_1 = require("./AccountData");
const utils_1 = require("./utils");
const verify_1 = require("./verify");
const RestError_1 = require("./RestError");
const log = require("loglevel");
var checkout;
(function (checkout) {
    let sessions;
    (function (sessions) {
        const accountCheckoutSessions = new AccountData_1.AccountData();
        function create(accountId, params) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            log.debug("checkout.session.create", accountId, params);
            verify_1.verify.requiredParams(params, ["cancel_url"]);
            verify_1.verify.requiredParams(params, ["payment_method_types"]);
            verify_1.verify.requiredParams(params, ["success_url"]);
            const sessionId = `cs_${(0, utils_1.generateId)()}`;
            if (accountCheckoutSessions.contains(accountId, sessionId)) {
                throw new RestError_1.RestError(400, {
                    code: "resource_already_exists",
                    doc_url: "https://stripe.com/docs/error-codes/resource-already-exists",
                    message: `Checkout session already exists.`,
                    type: "invalid_request_error",
                });
            }
            const lineItems = params.line_items.map((item) => {
                var _a;
                return {
                    description: ((_a = item === null || item === void 0 ? void 0 : item.price_data.product_data) === null || _a === void 0 ? void 0 : _a.name) || 'loldesc',
                    price: {
                        unit_amount: item.price_data.unit_amount
                    },
                    quantity: item.quantity
                };
            });
            const subtotal = (_a = params.line_items) === null || _a === void 0 ? void 0 : _a.reduce((acc, item) => {
                var _a, _b;
                const amount = (_b = (_a = item.amount) !== null && _a !== void 0 ? _a : item.price_data.unit_amount) !== null && _b !== void 0 ? _b : Number.parseInt(item.price || "0");
                return (acc += amount);
            }, 0);
            const session = {
                id: sessionId,
                object: "checkout.session",
                amount_subtotal: subtotal,
                amount_total: subtotal,
                allow_promotion_codes: (_b = params.allow_promotion_codes) !== null && _b !== void 0 ? _b : true,
                billing_address_collection: (_c = params.billing_address_collection) !== null && _c !== void 0 ? _c : null,
                client_reference_id: (_d = params.client_reference_id) !== null && _d !== void 0 ? _d : null,
                cancel_url: params.cancel_url,
                customer_email: (_e = params.customer_email) !== null && _e !== void 0 ? _e : null,
                customer_details: {
                    id: `cu_${(0, utils_1.generateId)()}`,
                    object: "customer",
                    email: (_f = params.customer_email) !== null && _f !== void 0 ? _f : null,
                    name: "Some Customer",
                },
                currency: "gbp",
                mode: (_g = params.mode) !== null && _g !== void 0 ? _g : "payment",
                livemode: false,
                line_items: { data: lineItems } || {},
                locale: (_h = params.locale) !== null && _h !== void 0 ? _h : "auto",
                metadata: (0, utils_1.stringifyMetadata)(params.metadata),
                payment_status: "paid",
                payment_method_types: params.payment_method_types,
                payment_intent: null,
                setup_intent: null,
                shipping: null,
                shipping_address_collection: null,
                subscription: null,
                submit_type: (_j = params.submit_type) !== null && _j !== void 0 ? _j : "pay",
                success_url: params.success_url,
                total_details: null,
            };
            accountCheckoutSessions.put(accountId, session);
            return session;
        }
        sessions.create = create;
        function retrieve(accountId, checkoutSessionId, paramName) {
            log.debug("checkout.session.retrieve", accountId, checkoutSessionId);
            const session = accountCheckoutSessions.get(accountId, checkoutSessionId);
            if (!session) {
                throw new RestError_1.RestError(404, {
                    code: "resource_missing",
                    doc_url: "https://stripe.com/docs/error-codes/resource-missing",
                    message: `No such checkout session: ${checkoutSessionId}`,
                    param: paramName,
                    type: "invalid_request_error",
                });
            }
            return session;
        }
        sessions.retrieve = retrieve;
    })(sessions = checkout.sessions || (checkout.sessions = {}));
})(checkout = exports.checkout || (exports.checkout = {}));
//# sourceMappingURL=checkout.sessions.js.map