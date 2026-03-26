export function objectEntries<K extends string, V>(
    object: Record<K, V>,
): [K, V][] {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return Object.entries(object) as [K, V][];
}

export function objectKeys<K extends string, V>(object: Record<K, V>): K[] {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return Object.keys(object) as K[];
}
