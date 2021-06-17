module.exports = (text) => {
    text = text.replace(/[^a-zA-Z0-9]+/g, " ");
    const parts = splitCamelCase(text);
    return parts.join(" ").split(" ").filter(Boolean);
};

// Split camel case. Including numbers
const splitCamelCase = (text) => {
    return text.split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|(?<=[a-zA-Z])(?=[0-9])|(?<=[0-9])(?=[a-zA-Z])/g);
};