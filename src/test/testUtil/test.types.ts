export interface TestFixture {
    title: string;
    command: Command | string;
    pre: {
        language?: string;
        content?: string;
        selections?: NumberSelection[] | NumberSelection;
    };
    post: {
        language?: string;
        content?: string;
        selections?: NumberSelection[] | NumberSelection;
        returnValue?: unknown;
    };
}

export interface FullTestFixture {
    title: string;
    command: Command;
    pre: {
        language: string;
        content: string;
        selections: NumberSelection[];
    };
    post: {
        language: string;
        content: string;
        selections: NumberSelection[];
        returnValue: unknown;
    };
}

export interface Command {
    id: string;
    args: any[];
}

export type NumberSelection =
    | [number, number]
    | [number, number, number, number];

export interface PlainPosition {
    line: number;
    character: number;
}

export interface PlainSelection {
    start: PlainPosition;
    end: PlainPosition;
    isReversed: boolean;
}
