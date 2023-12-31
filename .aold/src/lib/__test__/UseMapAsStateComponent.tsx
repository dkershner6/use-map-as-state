import React, { ReactElement, useState } from 'react';
import useMapAsState from '../useMapAsState';
import ITableRow, { TableRow, TableRowStatus } from './ITableRow';
import StringCell from './StringCell';

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
    onStringChange?: (aString: string) => void;
}

const UseMapAsStateComponent = ({
    onStringChange
}: IUseMapAsStateComponent): ReactElement => {
    const mapAsState = useMapAsState(() => getABunchOfRows(50));
    const [selectAll, setSelectAll] = useState(false);

    const toggleSelectAll = () => {
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
            mapAsState.set(row.id, { ...row, checked: !selectAll })
        );

        toggleSelectAll();
    };

    const handleCheckRow = (id): void => {
        const tableRow = mapAsState.get(id);

        mapAsState.set(id, { ...tableRow, checked: !tableRow.checked });
    };

    const handleEditRow = (id: number): void => {
        const tableRow = mapAsState.get(id);
        mapAsState.set(id, { ...tableRow, status: TableRowStatus.EDITING });
    };

    const handleStringChange = (id: number, newString: string): void => {
        const tableRow = mapAsState.get(id);
        const localMap = mapAsState.set(id, {
            ...tableRow,
            aString: newString
        });
        if (onStringChange) onStringChange(localMap.get(id).aString);
    };

    const handleSaveRow = async (tableRow: ITableRow): Promise<void> => {
        mapAsState.set(tableRow.id, {
            ...tableRow,
            status: TableRowStatus.SAVING
        });
        await wait(2);
        mapAsState.set(tableRow.id, {
            ...tableRow,
            status: TableRowStatus.READY
        });
    };

    const handleDeleteRow = async (tableRow: ITableRow): Promise<void> => {
        mapAsState.set(tableRow.id, {
            ...tableRow,
            status: TableRowStatus.DELETING
        });
        await wait(2);
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
            <div className="container" style={{ display: 'flex' }}>
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
            <div style={{ marginTop: '15px' }}>
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left' }}>
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={() => handleSelectAll()}
                                    data-testid="SelectAllCheckbox"
                                />
                            </th>
                            <th style={{ textAlign: 'left' }}>ID</th>
                            <th>A String</th>
                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...mapAsState.keys()].map((id) => {
                            const tableRow = mapAsState.get(id);
                            return renderTableRow(tableRow);
                        })}
                    </tbody>
                </table>
            </div>
            <div data-testid="toStringCheck">{mapAsState.toString()}</div>
        </>
    );
};

export default UseMapAsStateComponent;
