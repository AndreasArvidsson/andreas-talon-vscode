module.exports = (text, pattern) => {
    const result = [];
    let i = text.indexOf(pattern);
    while (i > -1) {
        result.push(i);
        i = text.indexOf(pattern, i + pattern.length);
    }
    return result;
};