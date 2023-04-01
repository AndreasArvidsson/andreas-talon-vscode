import * as vscode from "vscode";
import { NumberSelection, PlainPosition, PlainSelection } from "./test.types";

export function selectionsToPlainSelections(
    selections: readonly vscode.Selection[]
): PlainSelection[] {
    return selections.map(selectionToPlainSelection);
}

export function numbersToPlainSelections(numbers: NumberSelection[]): PlainSelection[] {
    return selectionsToPlainSelections(numbersToSelections(numbers));
}

export function numbersToSelections(numbers: NumberSelection[]): vscode.Selection[] {
    return numbers.map(numbersToSelection);
}

function selectionToPlainSelection(selection: vscode.Selection): PlainSelection {
    return {
        start: toPlainPosition(selection.start),
        end: toPlainPosition(selection.end),
        isReversed: selection.active.isBefore(selection.anchor)
    };
}

function toPlainPosition(position: vscode.Position): PlainPosition {
    return {
        line: position.line,
        character: position.character
    };
}

function numbersToSelection(numbers: NumberSelection): vscode.Selection {
    if (numbers.length === 2) {
        const [line, character] = numbers;
        return new vscode.Selection(line, character, line, character);
    }
    if (numbers.length === 4) {
        const [anchorLine, anchorCharacter, activeLine, activeCharacter] = numbers;
        return new vscode.Selection(anchorLine, anchorCharacter, activeLine, activeCharacter);
    }
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw Error(`Expected two or four numbers: ${numbers}`);
}
