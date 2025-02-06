import type { Form } from "../models/Form";
import { type FormData } from "../models/Form";
import { type ChecklistItem } from "../models/ChecklistItem";
import { type DocumentationItem } from "../models/DocumentationItem";
export declare class FormService {
    createForm(data: {
        formData: FormData;
        checklistItems: Omit<ChecklistItem, "id" | "formId">[];
        documentationItems: Omit<DocumentationItem, "id" | "formId">[];
    }): Promise<number>;
    getFormById(id: number): Promise<Form | null>;
    updateForm(id: number, data: {
        formData: Partial<FormData>;
        checklistItems: Omit<ChecklistItem, "id" | "formId">[];
        documentationItems: Omit<DocumentationItem, "id" | "formId">[];
    }): Promise<void>;
    deleteForm(id: number): Promise<void>;
    getAllForms(): Promise<FormData[]>;
    getForm(id: number): Promise<{
        form: FormData;
        checklistItems: ChecklistItem[];
        documentationItems: DocumentationItem[];
    }>;
    generateFormPDF(formId: number): Promise<Buffer>;
    savePDFLocally(formId: number): Promise<string>;
}
export declare const formService: FormService;
export default formService;
