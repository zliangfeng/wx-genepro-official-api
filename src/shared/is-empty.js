const stringEmptyReg = /^\s*$/;
const emptyObjects = ["", undefined, null];

export default function isEmpty(obj) {
    if (emptyObjects.includes(obj)) return true;

    let result = false;

    switch (typeof obj) {
        case "string":
            // statements_1
            result = stringEmptyReg.exec(obj) !== null;
            break;
        default:
            break;
    }

    return result;
}

export function isObjectEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function isFasly(obj) {
    return isEmpty(obj) || isObjectEmpty(obj);
}
