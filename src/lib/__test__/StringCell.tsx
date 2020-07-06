import React, { ReactElement } from 'react';
import ITableRow, { TableRowStatus } from './ITableRow';

export interface IStringCell {
    tableRow: ITableRow;
    onChange: (id: number, newString: string) => void;
}

const StringCell = ({ tableRow, onChange }: IStringCell): ReactElement => {
    if (tableRow.status === TableRowStatus.EDITING) {
        return (
            <td style={{ textAlign: 'center' }}>
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
            style={{ textAlign: 'center' }}
            data-testid={`TableRowString-${tableRow.id}`}
        >
            {tableRow.aString}
        </td>
    );
};

export default StringCell;
