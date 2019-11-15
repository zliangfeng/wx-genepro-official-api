export default function createThrowable(code, msg) {
    const error = new Error(msg);
    error.code = code || "ER_INVALID_ARG";
    return error;
}
