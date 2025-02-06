export interface ChecklistItem {
    id?: number;
    formId: number;
    standard: string;
    description: string;
    condition: string;
    fe: string;
    nper: string;
    photo?: string;
    audio?: string;
    comment?: string;
}
export declare const ChecklistItemModel: {
    create(item: Omit<ChecklistItem, "id">): Promise<number>;
    getByFormId(formId: number): Promise<ChecklistItem[]>;
    deleteByFormId(formId: number): Promise<void>;
    getById(id: number): Promise<ChecklistItem | null>;
    update(id: number, item: Partial<ChecklistItem>): Promise<boolean>;
    validate(item: Partial<ChecklistItem>): string[];
};
export default ChecklistItemModel;
