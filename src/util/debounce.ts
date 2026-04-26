export class Debouncer {
    private timeoutHandle: NodeJS.Timeout | null = null;

    public constructor(
        private readonly callback: () => void,
        private readonly debounceDelayMs: number,
    ) {}

    public run(): void {
        if (this.timeoutHandle != null) {
            clearTimeout(this.timeoutHandle);
        }

        this.timeoutHandle = setTimeout(() => {
            this.callback();
            this.timeoutHandle = null;
        }, this.debounceDelayMs);
    }

    public dispose(): void {
        if (this.timeoutHandle != null) {
            clearTimeout(this.timeoutHandle);
        }
    }
}
