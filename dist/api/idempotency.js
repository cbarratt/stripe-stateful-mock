"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotencyRoute = void 0;
const utils_1 = require("./utils");
const RestError_1 = require("./RestError");
const AccountData_1 = require("./AccountData");
const routes_1 = require("../routes");
const deepEqual = require("deep-equal");
const log = require("loglevel");
const accountRequests = new AccountData_1.AccountData();
function idempotencyRoute(req, res, next) {
    const idempotencyKey = req.header("idempotency-key");
    if (!idempotencyKey) {
        return next();
    }
    const accountId = (0, routes_1.getRequestAccountId)(req);
    const storedRequestKey = `(${req.method})(${req.path})(${idempotencyKey})`;
    if (accountRequests.contains(accountId, storedRequestKey)) {
        const storedRequest = accountRequests.get(accountId, storedRequestKey);
        if (!deepEqual(storedRequest.requestBody, req.body)) {
            log.error("request body", req.body, "does not match stored body", storedRequest.requestBody);
            throw new RestError_1.RestError(400, {
                message: `Keys for idempotent requests can only be used with the same parameters they were first used with. Try using a key other than '${idempotencyKey}' if you meant to execute a different request.`,
                type: "idempotency_error"
            });
        }
        log.debug("replaying idempotent request", storedRequest);
        res.status(storedRequest.responseCode)
            .set("original-request", storedRequest.requestId)
            .set("request-id", "req_" + (0, utils_1.generateId)(14))
            .set("idempotent-replayed", "true")
            .send(storedRequest.responseBody);
        return;
    }
    else {
        const storedRequest = {
            id: storedRequestKey,
            created: (Date.now() / 1000) | 0,
            requestId: "req_" + (0, utils_1.generateId)(14),
            requestBody: req.body,
            responseCode: 0,
            responseBody: null
        };
        accountRequests.put(accountId, storedRequest);
        res.set("request-id", storedRequest.requestId);
        // Let's get real dirty.
        const originalStatus = res.status;
        res.status = code => {
            if (codeIsIdempotentCached(code) && accountRequests.contains(accountId, storedRequestKey)) {
                accountRequests.get(accountId, storedRequestKey).responseCode = code;
            }
            else {
                accountRequests.remove(accountId, storedRequestKey);
            }
            return originalStatus.call(res, code);
        };
        const originalSend = res.send;
        res.send = body => {
            if (accountRequests.contains(accountId, storedRequestKey)) {
                accountRequests.get(accountId, storedRequestKey).responseBody = body;
            }
            return originalSend.call(res, body);
        };
    }
    return next();
}
exports.idempotencyRoute = idempotencyRoute;
function codeIsIdempotentCached(code) {
    // see https://stripe.com/docs/error-handling#content-errors
    return code !== 401 && code !== 429;
}
//# sourceMappingURL=idempotency.js.map