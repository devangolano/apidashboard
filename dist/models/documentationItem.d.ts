export interface DocumentationItemData {
    formId: number;
    standard: string;
    description: string;
    condition: string;
    comment?: string;
    photo?: string;
    audio?: string;
    pdf?: string;
}
export interface DocumentationItem extends DocumentationItemData {
    id: number;
}
export declare const DocumentationItemModel: {
    create(item: DocumentationItemData): Promise<number>;
    getByFormId(formId: number): Promise<DocumentationItem[]>;
    deleteByFormId(formId: number): Promise<boolean>;
    update(id: number, item: Partial<DocumentationItemData>): Promise<boolean>;
    getById(id: number): Promise<DocumentationItem | null>;
};
export default DocumentationItemModel;
