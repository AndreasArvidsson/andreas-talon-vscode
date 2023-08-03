const refLC = "a".charCodeAt(0);
const refUC = "A".charCodeAt(0);

export function indexToHint(index: number): string {
    const letters: string[] = [];

    const div = Math.trunc(index / 26);

    if (div > 0) {
        letters.push(String.fromCharCode(refUC + div - 1));
    }

    const mod = index % 26;

    if (mod > -1) {
        letters.push(String.fromCharCode(refUC + mod));
    }

    return letters.join("");
}

export function hintToIndex(hint: string): number {
    const letters = hint.toLowerCase().split("").reverse();
    let result = 0;

    letters.forEach((letter, index) => {
        const value = letter.charCodeAt(0) - refLC;
        if (index > 0) {
            result += (value + 1) * Math.pow(26, index);
        } else {
            result += value;
        }
    });

    return result;
}
