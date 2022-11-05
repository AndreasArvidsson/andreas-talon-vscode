export interface TestFixture {
    title: string;
    language?: string;
    command: {
        id: string;
        args?: any[];
    };
    pre: {
        content: string;
        selections?: number[][];
    };
    post: {
        content?: string;
        selections?: number[][];
    };
}

export interface PlainPosition {
    line: number;
    character: number;
}

export interface PlainSelection {
    start: PlainPosition;
    end: PlainPosition;
    isReversed: boolean;
}
