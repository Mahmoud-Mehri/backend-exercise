class ErrorWithCode extends Error {
    constructor(message, code) {
        super(message);

        this.message = message;
        this.code = code;
    }
}

const resultObject = (succeed, resData, resStatus = 200) => {
    return {
        success: succeed,
        status: resStatus,
        data: resData
    }
}

const responseObject = (result) => {
    return {
        success: result.success,
        ...(result.success ? { data: result.data } : { message: result.data })
    }
}

const isValidDate = (date) => {
    var separators = ['\\.', '\\-', '\\/'];
    var bits = date.split(new RegExp(separators.join('|'), 'g'));
    var d = new Date(bits[2], bits[1] - 1, bits[0]);
    return d.getFullYear() == bits[2] && d.getMonth() + 1 == bits[1];
}

const isNumeric = (value) => {
    return /^\d+$/.test(value);
}

module.exports = {
    resultObject,
    responseObject,
    isValidDate,
    isNumeric,
    ErrorWithCode
}