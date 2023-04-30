import {
    CancellationToken,
    Disposable,
    Hover,
    languages,
    MarkdownString,
    Position,
    TextDocument
} from "vscode";

function provideHoverTalon(
    document: TextDocument,
    position: Position,
    _token: CancellationToken
): Hover {
    const ms = new MarkdownString("value2");
    return new Hover("stuff");
}

export function registerLanguageHovers(): Disposable {
    return Disposable.from(
        languages.registerHoverProvider({ language: "talon" }, { provideHover: provideHoverTalon })
        // languages.registerHoverProvider(
        //     { language: "python" },
        //     { provideHover: provideHoverPython }
        // )
    );
}
