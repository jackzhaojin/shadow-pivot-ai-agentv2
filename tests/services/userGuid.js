"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateUserGuid = getOrCreateUserGuid;
function getOrCreateUserGuid(storage = window.localStorage) {
    let guid = storage.getItem('userGuid');
    if (!guid) {
        guid = crypto.randomUUID();
        storage.setItem('userGuid', guid);
    }
    return guid;
}
