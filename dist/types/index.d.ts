export interface FormData {
    id?: number;
    empresa: string;
    area: string;
    data: string;
    hora: string;
    executadoPor: string;
    created_at?: string;
}
export interface FormListItem {
    id: number;
    empresa: string;
    data: string;
}
export interface ChecklistItem {
    id?: number;
    formId?: number;
    standard: string;
    description: string;
    condition: string;
    fe: string;
    nper: string;
    photo?: string;
    audio?: string;
    comment?: string;
}
export interface DocumentationItem {
    id?: number;
    formId?: number;
    standard: string;
    description: string;
    condition: string;
    photo?: string;
    audio?: string;
    pdf?: string;
    comment?: string;
}
