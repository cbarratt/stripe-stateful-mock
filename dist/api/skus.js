"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skus = void 0;
const AccountData_1 = require("./AccountData");
const utils_1 = require("./utils");
const verify_1 = require("./verify");
const RestError_1 = require("./RestError");
const log = require("loglevel");
var skus;
(function (skus) {
    const accountSkus = new AccountData_1.AccountData();
    function create(accountId, params) {
        var _a, _b, _c, _d, _e;
        log.debug("products.create", accountId, params);
        verify_1.verify.requiredParams(params, ["currency"]);
        verify_1.verify.requiredParams(params, ["inventory"]);
        verify_1.verify.requiredParams(params, ["price"]);
        verify_1.verify.requiredParams(params, ["product"]);
        const skuId = params.id || `sku_${(0, utils_1.generateId)()}`;
        if (accountSkus.contains(accountId, skuId)) {
            throw new RestError_1.RestError(400, {
                code: "resource_already_exists",
                doc_url: "https://stripe.com/docs/error-codes/resource-already-exists",
                message: `Sku already exists.`,
                type: "invalid_request_error"
            });
        }
        const sku = {
            id: skuId,
            object: "sku",
            active: (_a = params.active) !== null && _a !== void 0 ? _a : true,
            attributes: params.attributes || {},
            created: (Date.now() / 1000) | 0,
            currency: params.currency,
            image: (_b = params.image) !== null && _b !== void 0 ? _b : null,
            inventory: Object.assign(Object.assign({}, params.inventory), { quantity: (_c = params.inventory.quantity) !== null && _c !== void 0 ? _c : null, value: (_d = params.inventory.value) !== null && _d !== void 0 ? _d : null }),
            livemode: false,
            metadata: (0, utils_1.stringifyMetadata)(params.metadata),
            package_dimensions: (_e = params.package_dimensions) !== null && _e !== void 0 ? _e : null,
            price: params.price,
            product: params.product,
            updated: (Date.now() / 1000) | 0,
        };
        accountSkus.put(accountId, sku);
        return sku;
    }
    skus.create = create;
    function retrieve(accountId, skuId, paramName) {
        log.debug("sku.retrieve", accountId, skuId);
        const sku = accountSkus.get(accountId, skuId);
        if (!sku) {
            throw new RestError_1.RestError(404, {
                code: "resource_missing",
                doc_url: "https://stripe.com/docs/error-codes/resource-missing",
                message: `No such sku: ${skuId}`,
                param: paramName,
                type: "invalid_request_error"
            });
        }
        return sku;
    }
    skus.retrieve = retrieve;
    function list(accountId, params) {
        log.debug("products.list", accountId, params);
        let data = accountSkus.getAll(accountId);
        if (params.active !== undefined) {
            data = data.filter(d => d.active === params.active);
        }
        if (params.ids) {
            data = data.filter(d => params.ids.indexOf(d.id) !== -1);
        }
        if (params.product !== undefined) {
            data = data.filter(d => d.product === params.product);
        }
        return (0, utils_1.applyListOptions)(data, params, (id, paramName) => retrieve(accountId, id, paramName));
    }
    skus.list = list;
})(skus = exports.skus || (exports.skus = {}));
//# sourceMappingURL=skus.js.map