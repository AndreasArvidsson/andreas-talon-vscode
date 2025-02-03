export class Debouncer {
    private timeout: NodeJS.Timeout | undefined = undefined;

    constructor(
        private delayMs: number,
        private callback: () => void
    ) {
        this.run = this.run.bind(this);
    }

    run() {
        clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            this.callback();
            this.timeout = undefined;
        }, this.delayMs);
    }

    dispose() {
        if (this.timeout != null) {
            clearTimeout(this.timeout);
        }
    }
}
