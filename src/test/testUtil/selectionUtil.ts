import * as vscode from "vscode";
import {
    NumberSelection,
    NumberSelections,
    PlainPosition,
    PlainSelection,
} from "./test.types";

export function selectionsToPlainSelections(
    selections: readonly vscode.Selection[]
): PlainSelection[] {
    return selections.map(selectionToPlainSelection);
}

function selectionToPlainSelection(
    selection: vscode.Selection
): PlainSelection {
    return {
        start: toPlainPosition(selection.start),
        end: toPlainPosition(selection.end),
        isReversed: selection.active.isBefore(selection.anchor),
    };
}

function toPlainPosition(position: vscode.Position): PlainPosition {
    return {
        line: position.line,
        character: position.character,
    };
}

export function numbersToPlainSelections(
    numbers: NumberSelections
): PlainSelection[] {
    return selectionsToPlainSelections(numbersToSelections(numbers));
}

export function numbersToSelections(
    numbers: NumberSelections
): vscode.Selection[] {
    return Array.isArray(numbers[0])
        ? numbers.map((n) => numbersToSelection(n as NumberSelection))
        : [numbersToSelection(numbers as NumberSelection)];
}

export function numbersToSelection(numbers: NumberSelection): vscode.Selection {
    if (numbers.length === 2) {
        const [line, character] = numbers;
        return new vscode.Selection(line, character, line, character);
    }
    if (numbers.length === 4) {
        const [anchorLine, anchorCharacter, activeLine, activeCharacter] =
            numbers;
        return new vscode.Selection(
            anchorLine,
            anchorCharacter,
            activeLine,
            activeCharacter
        );
    }
    throw Error(`Expected two or four numbers: ${numbers}`);
}
