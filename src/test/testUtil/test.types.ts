export interface TestFixture {
    title: string;
    language?: string;
    command: {
        id: string;
        args?: any[];
    };
    pre: {
        content?: string;
        selections?: NumberSelections;
    };
    post: {
        content?: string;
        selections?: NumberSelections;
        returnValue?: unknown;
    };
}

export type NumberSelections = NumberSelection | NumberSelection[];

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
