export class Debouncer {
    private timeoutHandle: NodeJS.Timeout | null = null;

    constructor(
        private readonly callback: () => void,
        private readonly debounceDelayMs: number,
    ) {}

    run(): void {
        if (this.timeoutHandle != null) {
            clearTimeout(this.timeoutHandle);
        }

        this.timeoutHandle = setTimeout(() => {
            this.callback();
            this.timeoutHandle = null;
        }, this.debounceDelayMs);
    }

    dispose(): void {
        if (this.timeoutHandle != null) {
            clearTimeout(this.timeoutHandle);
        }
    }
}
