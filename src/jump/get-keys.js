let keys;

module.exports = () => {
    if (!keys) {
        keys = createKeys();
    }
    return keys;
};

const createKeys = () => {
    const keys = [];
    for (let i = 0; i < 26; ++i) {
        keys.push(String.fromCharCode(i + 65));
    }
    for (let i = 0; i < 26; ++i) {
        for (let j = 0; j < 26; ++j) {
            keys.push(String.fromCharCode(i + 65) + String.fromCharCode(j + 65));
        }
    }
    return keys;
};