import { utf8ToBytes } from "ethereum-cryptography/utils.js";

function padArray(arr, len, fill) {
    return new Uint8Array(Array.from(arr).concat(Array(len).fill(fill)).slice(0, len));
}

function getPassBytesAndIVFromPassword(password) {
    let passBytes = utf8ToBytes(password);
    passBytes = padArray(passBytes, Math.ceil(passBytes.length / 16) * 16, 0);
    return {
        passBytes,
        iv: passBytes.slice(0, 16)
    }
}

export {
    padArray,
    getPassBytesAndIVFromPassword
}