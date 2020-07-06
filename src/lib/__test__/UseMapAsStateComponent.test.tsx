import React from 'react';
import { render, cleanup, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import UseMapAsStateComponent from './UseMapAsStateComponent';

describe('useMapAsState', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    it('Should render', () => {
        render(<UseMapAsStateComponent />);

        expect(true).toBeTruthy();
    });

    it('Should initially render with 50 rows', () => {
        const { queryAllByTestId } = render(<UseMapAsStateComponent />);

        const tableRows = queryAllByTestId(/TableRow-/);

        expect(tableRows).toHaveLength(50);
    });

    it('Should not find an ID of 17', () => {
        const { queryByTestId } = render(<UseMapAsStateComponent />);

        expect(queryByTestId('IDCheck')).toBeNull();
    });

    it('Should add 50 more rows when AddABunch button is clicked', () => {
        const { queryAllByTestId, getByTestId } = render(
            <UseMapAsStateComponent />
        );

        const tableRows = queryAllByTestId(/TableRow-/);

        expect(tableRows).toHaveLength(50);

        fireEvent.click(getByTestId('AddABunchOfRowsButton'));

        const tableRowsAfter = queryAllByTestId(/TableRow-/);

        expect(tableRowsAfter).toHaveLength(100);
    });

    it('Should have a RowCount that matches actual row count', () => {
        const { queryAllByTestId, getByTestId } = render(
            <UseMapAsStateComponent />
        );

        const rowCount = getByTestId('RowCount').innerHTML;
        const tableRows = queryAllByTestId(/TableRow-/);

        const tableRowCount = tableRows.length;
        expect(rowCount).toEqual(`Table currently has ${tableRowCount} rows`);
    });

    it('Should have zero rows after SelectAll and DeleteSelected are clicked', () => {
        const { queryAllByTestId, getByTestId } = render(
            <UseMapAsStateComponent />
        );

        fireEvent.click(getByTestId('SelectAllCheckbox'));
        fireEvent.click(getByTestId('DeleteSelectedRowsButton'));

        const tableRows = queryAllByTestId(/TableRow-/);

        expect(tableRows).toHaveLength(0);
    });

    it('Should have zero rows after DeleteAllRows clicked', () => {
        const { queryAllByTestId, getByTestId } = render(
            <UseMapAsStateComponent />
        );

        fireEvent.click(getByTestId('DeleteAllRowsButton'));

        const tableRows = queryAllByTestId(/TableRow-/);

        expect(tableRows).toHaveLength(0);
    });

    it('Should enter edit mode when Edit is clicked in a TableRow', () => {
        const { queryAllByTestId, getByTestId } = render(
            <UseMapAsStateComponent />
        );

        const tableRowId = queryAllByTestId(/TableRow-/)[0].id;
        fireEvent.click(getByTestId(`TableRowEditButton-${tableRowId}`));

        const tableRowStringEdit = getByTestId(
            `TableRowStringInput-${tableRowId}`
        );
        expect(tableRowStringEdit).toBeInTheDocument();
    });

    it('Should enter edit mode when Edit is clicked in a TableRow and then save a new string', async () => {
        const { queryAllByTestId, getByTestId } = render(
            <UseMapAsStateComponent />
        );

        const tableRowId = queryAllByTestId(/TableRow-/)[0].id;
        fireEvent.click(getByTestId(`TableRowEditButton-${tableRowId}`));

        const tableRowStringEdit = getByTestId(
            `TableRowStringInput-${tableRowId}`
        );

        await userEvent.type(tableRowStringEdit, 'Burritos...so good.');

        fireEvent.click(getByTestId(`TableRowSaveButton-${tableRowId}`));
        await waitFor(() => {
            expect(
                getByTestId(`TableRowString-${tableRowId}`)
            ).toHaveTextContent('Burritos...so good.');
        });
    });

    it('Should delete a row when Edit is clicked in a TableRow and then delete button is clicked', async () => {
        const { queryAllByTestId, getByTestId, queryByTestId } = render(
            <UseMapAsStateComponent />
        );

        const tableRowId = queryAllByTestId(/TableRow-/)[0].id;
        fireEvent.click(getByTestId(`TableRowEditButton-${tableRowId}`));

        const tableRowStringEdit = getByTestId(
            `TableRowStringInput-${tableRowId}`
        );

        await userEvent.type(tableRowStringEdit, 'Burritos...so good.');

        fireEvent.click(getByTestId(`TableRowDeleteButton-${tableRowId}`));

        await waitFor(() => {
            expect(queryByTestId(`TableRow-${tableRowId}`)).toContainHTML(
                'Deleting...'
            );
        });
    });

    it('Should populate toString()', () => {
        const { getByTestId } = render(<UseMapAsStateComponent />);

        expect(getByTestId('toStringCheck').innerHTML.length).toBeGreaterThan(
            0
        );
    });

    it('Should set and return the updated map, without re-rendering (nextMap test)', async () => {
        const onStringChange = jest.fn();
        const { getByTestId, queryAllByTestId } = render(
            <UseMapAsStateComponent onStringChange={onStringChange} />
        );

        const tableRowId = queryAllByTestId(/TableRow-/)[0].id;
        fireEvent.click(getByTestId(`TableRowEditButton-${tableRowId}`));

        const tableRowStringEdit = getByTestId(
            `TableRowStringInput-${tableRowId}`
        );

        await userEvent.type(tableRowStringEdit, 'B');

        const initialString = 'TestString';
        expect(onStringChange).toHaveBeenLastCalledWith(`${initialString}B`);
    });
});
