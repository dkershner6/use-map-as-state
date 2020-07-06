export enum TableRowStatus {
    READY = 'READY',
    EDITING = 'EDITING',
    SAVING = 'SAVING',
    DELETING = 'DELETING'
}

export default interface ITableRow {
    id: number;
    aString: string;
    status: TableRowStatus;
    checked: boolean;
}

export class TableRow implements ITableRow {
    id: number;
    aString = `TestString`;
    status = TableRowStatus.READY;
    checked = false;

    constructor(id: number) {
        this.id = id;
    }
}
