export async function runPool<T, R>(
    items: T[],
    concurrency: number,
    worker: (item: T) => Promise<R>,
): Promise<R[]> {
    const results: R[] = Array.from({ length: items.length });
    let nextIndex = 0;

    async function runWorker(): Promise<void> {
        while (nextIndex < items.length) {
            const currentIndex = nextIndex;
            nextIndex++;
            // oxlint-disable-next-line no-await-in-loop
            results[currentIndex] = await worker(items[currentIndex]);
        }
    }

    // Start one worker per concurrency level
    const length = Math.min(concurrency, items.length);
    await Promise.all(Array.from({ length }, runWorker));

    return results;
}
