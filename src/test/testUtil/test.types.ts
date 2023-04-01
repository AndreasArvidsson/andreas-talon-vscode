interface TestFixtureBase {
    title: string;
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

interface TextFixtureCommand extends TestFixtureBase {
    command: Command | string;
    callback?: never;
}

interface TextFixtureCallback extends TestFixtureBase {
    command?: never;
    callback: () => Thenable<unknown>;
}

export type TestFixture = TextFixtureCommand | TextFixtureCallback;

export interface FullTestFixture {
    title: string;
    callback: () => Thenable<unknown>;
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

export type NumberSelection = [number, number] | [number, number, number, number];

export interface PlainPosition {
    line: number;
    character: number;
}

export interface PlainSelection {
    start: PlainPosition;
    end: PlainPosition;
    isReversed: boolean;
}
