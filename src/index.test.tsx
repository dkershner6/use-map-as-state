/* eslint-disable sonarjs/no-duplicate-string */

import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import React, { ReactElement, useState } from "react";
import { useMapAsState } from ".";

enum TableRowStatus {
    READY = "READY",
    EDITING = "EDITING",
    SAVING = "SAVING",
    DELETING = "DELETING",
}

interface ITableRow {
    id: number;
    aString: string;
    status: TableRowStatus;
    checked: boolean;
}

class TableRow implements ITableRow {
    id: number;
    aString = `TestString`;
    status = TableRowStatus.READY;
    checked = false;

    constructor(id: number) {
        this.id = id;
    }
}

interface IStringCell {
    tableRow: ITableRow;
    onChange: (id: number, newString: string) => void;
}

const StringCell = ({ tableRow, onChange }: IStringCell): ReactElement => {
    if (tableRow.status === TableRowStatus.EDITING) {
        return (
            <td style={{ textAlign: "center" }}>
                <input
                    type="text"
                    value={tableRow.aString}
                    onChange={(event) =>
                        onChange(tableRow.id, event.target.value)
                    }
                    data-testid={`TableRowStringInput-${tableRow.id}`}
                />
            </td>
        );
    }

    return (
        <td
            style={{ textAlign: "center" }}
            data-testid={`TableRowString-${tableRow.id}`}
        >
            {tableRow.aString}
        </td>
    );
};

const wait = (timeInSeconds: number): Promise<unknown> =>
    new Promise((resolve) => setTimeout(resolve, timeInSeconds * 1000));

const getABunchOfRows = (numberOfItems: number): Map<number, ITableRow> => {
    const initialMap = new Map<number, ITableRow>();

    for (let index = 0; index < numberOfItems; index++) {
        const id = Math.random() * 1234 * Math.random() * 222222222;
        initialMap.set(id, new TableRow(id));
    }

    return initialMap;
};

interface IUseMapAsStateComponent {
    onStringChange?: (aString: string | undefined) => void;
}

const UseMapAsStateComponent = ({
    onStringChange,
}: IUseMapAsStateComponent): ReactElement => {
    const mapAsState = useMapAsState(() => getABunchOfRows(50));
    const [selectAll, setSelectAll] = useState(false);

    const toggleSelectAll = (): void => {
        setSelectAll((prevSelectAll) => !prevSelectAll);
    };

    const handleAddABunchOfRows = (): void => {
        const bunchOfRows = [...getABunchOfRows(50).values()];
        bunchOfRows.forEach((row) => mapAsState.set(row.id, row));
    };

    const handleDeleteABunchOfRows = (): void => {
        const idsToDelete = [...mapAsState.values()]
            .filter((row) => row.checked)
            .map((row) => row.id);
        idsToDelete.forEach((id) => mapAsState.delete(id));

        if (selectAll) toggleSelectAll();
    };

    const handleSelectAll = (): void => {
        const mapAsStateRows = [...mapAsState.values()];
        mapAsStateRows.forEach((row) =>
            mapAsState.set(row.id, { ...row, checked: !selectAll }),
        );

        toggleSelectAll();
    };

    const handleCheckRow = (id: number): void => {
        const tableRow = mapAsState.get(id);

        if (!tableRow) return;
        mapAsState.set(id, { ...tableRow, checked: !tableRow.checked });
    };

    const handleEditRow = (id: number): void => {
        const tableRow = mapAsState.get(id);

        if (!tableRow) return;
        mapAsState.set(id, { ...tableRow, status: TableRowStatus.EDITING });
    };

    const handleStringChange = (id: number, newString: string): void => {
        const tableRow = mapAsState.get(id);
        if (!tableRow) return;
        const localMap = mapAsState.set(id, {
            ...tableRow,
            aString: newString,
        });

        if (onStringChange) onStringChange(localMap?.get?.(id)?.aString);
    };

    const handleSaveRow = async (tableRow: ITableRow): Promise<void> => {
        mapAsState.set(tableRow.id, {
            ...tableRow,
            status: TableRowStatus.SAVING,
        });
        await wait(0.5);
        mapAsState.set(tableRow.id, {
            ...tableRow,
            status: TableRowStatus.READY,
        });
    };

    const handleDeleteRow = async (tableRow: ITableRow): Promise<void> => {
        mapAsState.set(tableRow.id, {
            ...tableRow,
            status: TableRowStatus.DELETING,
        });
        await wait(0.5);
        mapAsState.delete(tableRow.id);
    };

    const renderEditCell = (tableRow: ITableRow): ReactElement => {
        switch (tableRow.status) {
            case TableRowStatus.EDITING:
                return (
                    <td>
                        <button
                            onClick={() => handleSaveRow(tableRow)}
                            data-testid={`TableRowSaveButton-${tableRow.id}`}
                        >
                            Save
                        </button>
                        <button
                            onClick={() => handleDeleteRow(tableRow)}
                            data-testid={`TableRowDeleteButton-${tableRow.id}`}
                        >
                            Delete
                        </button>
                    </td>
                );

            case TableRowStatus.SAVING:
                return (
                    <td>
                        <button disabled>Saving...</button>
                    </td>
                );

            case TableRowStatus.DELETING:
                return (
                    <td>
                        <button disabled>Deleting...</button>
                    </td>
                );

            case TableRowStatus.READY:
            default:
                return (
                    <td>
                        <button
                            onClick={() => handleEditRow(tableRow.id)}
                            data-testid={`TableRowEditButton-${tableRow.id}`}
                        >
                            Edit
                        </button>
                    </td>
                );
        }
    };

    const renderTableRow = (tableRow: ITableRow): ReactElement => {
        return (
            <tr
                key={tableRow.id}
                id={tableRow.id.toString()}
                data-testid={`TableRow-${tableRow.id}`}
            >
                <td>
                    <input
                        type="checkbox"
                        checked={tableRow.checked}
                        onChange={() => handleCheckRow(tableRow.id)}
                        data-testid={`TableRowCheckbox-${tableRow.id}`}
                    />
                </td>
                <td>{tableRow.id}</td>
                <StringCell tableRow={tableRow} onChange={handleStringChange} />
                {renderEditCell(tableRow)}
            </tr>
        );
    };

    return (
        <>
            <div className="container" style={{ display: "flex" }}>
                <button
                    onClick={() => handleAddABunchOfRows()}
                    data-testid="AddABunchOfRowsButton"
                >
                    Add a Bunch of Rows
                </button>
                <button
                    onClick={() => handleDeleteABunchOfRows()}
                    data-testid="DeleteSelectedRowsButton"
                >
                    Delete Selected Rows
                </button>
                <button
                    onClick={() => mapAsState.clear()}
                    data-testid="DeleteAllRowsButton"
                >
                    Delete All Rows
                </button>
            </div>
            <div data-testid="RowCount">
                Table currently has {mapAsState.size} rows
            </div>
            {mapAsState.has(17) && (
                <div data-testid="IDCheck">
                    Table currently has a ID of 17 in it
                </div>
            )}
            <div style={{ marginTop: "15px" }}>
                <table style={{ width: "100%" }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: "left" }}>
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={() => handleSelectAll()}
                                    data-testid="SelectAllCheckbox"
                                />
                            </th>
                            <th style={{ textAlign: "left" }}>ID</th>
                            <th>A String</th>
                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...mapAsState.keys()].map((id) => {
                            const tableRow = mapAsState.get(id);
                            return tableRow ? renderTableRow(tableRow) : null;
                        })}
                    </tbody>
                </table>
            </div>
            <div data-testid="toStringCheck">{mapAsState.toString()}</div>
        </>
    );
};

describe("useMapAsState", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should render", () => {
        render(<UseMapAsStateComponent />);

        expect(true).toBeTruthy();
    });

    it("Should initially render with 50 rows", () => {
        render(<UseMapAsStateComponent />);

        const tableRows = screen.queryAllByTestId(/TableRow-/);

        expect(tableRows).toHaveLength(50);
    });

    it("Should not find an ID of 17", () => {
        render(<UseMapAsStateComponent />);

        expect(screen.queryByTestId("IDCheck")).not.toBeInTheDocument();
    });

    it("Should add 50 more rows when AddABunch button is clicked", () => {
        render(<UseMapAsStateComponent />);

        const tableRows = screen.queryAllByTestId(/TableRow-/);

        expect(tableRows).toHaveLength(50);

        fireEvent.click(screen.getByTestId("AddABunchOfRowsButton"));

        const tableRowsAfter = screen.queryAllByTestId(/TableRow-/);

        expect(tableRowsAfter).toHaveLength(100);
    });

    it("Should have a RowCount that matches actual row count", () => {
        render(<UseMapAsStateComponent />);

        const rowCount = screen.getByTestId("RowCount").innerHTML;
        const tableRows = screen.queryAllByTestId(/TableRow-/);

        const tableRowCount = tableRows.length;
        expect(rowCount).toEqual(`Table currently has ${tableRowCount} rows`);
    });

    it("Should have zero rows after SelectAll and DeleteSelected are clicked", () => {
        render(<UseMapAsStateComponent />);

        fireEvent.click(screen.getByTestId("SelectAllCheckbox"));
        fireEvent.click(screen.getByTestId("DeleteSelectedRowsButton"));

        const tableRows = screen.queryAllByTestId(/TableRow-/);

        expect(tableRows).toHaveLength(0);
    });

    it("Should have zero rows after DeleteAllRows clicked", () => {
        render(<UseMapAsStateComponent />);

        fireEvent.click(screen.getByTestId("DeleteAllRowsButton"));

        const tableRows = screen.queryAllByTestId(/TableRow-/);

        expect(tableRows).toHaveLength(0);
    });

    it("Should enter edit mode when Edit is clicked in a TableRow", () => {
        render(<UseMapAsStateComponent />);

        const tableRowId = screen.queryAllByTestId(/TableRow-/)[0].id;
        fireEvent.click(screen.getByTestId(`TableRowEditButton-${tableRowId}`));

        const tableRowStringEdit = screen.getByTestId(
            `TableRowStringInput-${tableRowId}`,
        );
        expect(tableRowStringEdit).toBeInTheDocument();
    });

    it("Should enter edit mode when Edit is clicked in a TableRow and then save a new string", async () => {
        render(<UseMapAsStateComponent />);

        const tableRowId = screen.queryAllByTestId(/TableRow-/)[0].id;
        fireEvent.click(screen.getByTestId(`TableRowEditButton-${tableRowId}`));

        const tableRowStringEdit = screen.getByTestId(
            `TableRowStringInput-${tableRowId}`,
        );

        await userEvent.type(tableRowStringEdit, "Burritos...so good.");

        fireEvent.click(screen.getByTestId(`TableRowSaveButton-${tableRowId}`));
        await waitFor(() => {
            expect(
                screen.getByTestId(`TableRowString-${tableRowId}`),
            ).toHaveTextContent("Burritos...so good.");
        });
    });

    it("Should delete a row when Edit is clicked in a TableRow and then delete button is clicked", async () => {
        render(<UseMapAsStateComponent />);

        const tableRowId = screen.queryAllByTestId(/TableRow-/)[0].id;
        fireEvent.click(screen.getByTestId(`TableRowEditButton-${tableRowId}`));

        const tableRowStringEdit = screen.getByTestId(
            `TableRowStringInput-${tableRowId}`,
        );

        await userEvent.type(tableRowStringEdit, "Burritos...so good.");

        fireEvent.click(
            screen.getByTestId(`TableRowDeleteButton-${tableRowId}`),
        );

        await waitFor(() => {
            expect(
                screen.queryByTestId(`TableRow-${tableRowId}`),
            ).toContainHTML("Deleting...");
        });

        await waitFor(
            () => {
                expect(
                    screen.queryByTestId(`TableRow-${tableRowId}`),
                ).not.toBeInTheDocument();
            },
            {
                timeout: 5000,
            },
        );
    });

    it("Should populate toString()", () => {
        render(<UseMapAsStateComponent />);

        expect(
            screen.getByTestId("toStringCheck").innerHTML.length,
        ).toBeGreaterThan(0);
    });

    it("Should set and return the updated map, without re-rendering (nextMap test)", async () => {
        const onStringChange = jest.fn();
        render(<UseMapAsStateComponent onStringChange={onStringChange} />);

        const tableRowId = screen.queryAllByTestId(/TableRow-/)[0].id;
        fireEvent.click(screen.getByTestId(`TableRowEditButton-${tableRowId}`));

        const tableRowStringEdit = screen.getByTestId(
            `TableRowStringInput-${tableRowId}`,
        );

        await userEvent.type(tableRowStringEdit, "B");

        const initialString = "TestString";
        expect(onStringChange).toHaveBeenLastCalledWith(`${initialString}B`);
    });
});
