"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountData = exports.accountStore = void 0;
exports.accountStore = [];
class AccountData {
    constructor() {
        this.data = {};
        exports.accountStore.push(this);
    }
    get(accountId, objectId) {
        return (this.data[accountId] && this.data[accountId][objectId]) || null;
    }
    getAll(accountId) {
        if (!this.data[accountId]) {
            return [];
        }
        return Object.keys(this.data[accountId])
            .map(key => this.data[accountId][key])
            .sort((a, b) => b.created - a.created);
    }
    contains(accountId, objectId) {
        return !!this.get(accountId, objectId);
    }
    put(accountId, obj) {
        if (!this.data[accountId]) {
            this.data[accountId] = {};
        }
        if (this.data[accountId][obj.id]) {
            throw new Error(`There is already an entry for [${accountId}][${obj.id}].  Refusing to overwrite it because the result will be confusing.`);
        }
        this.data[accountId][obj.id] = obj;
    }
    remove(accountId, objectId) {
        if (this.data[accountId]) {
            delete this.data[accountId][objectId];
        }
    }
    removeAll(accountId) {
        const records = this.data[accountId];
        for (const objectId in records) {
            delete this.data[accountId][objectId];
        }
    }
}
exports.AccountData = AccountData;
//# sourceMappingURL=AccountData.js.map