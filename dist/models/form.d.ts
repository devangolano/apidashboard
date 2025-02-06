export interface FormData {
    empresa: string;
    area: string;
    data: string;
    hora: string;
    executadoPor: string;
}
export interface Form extends FormData {
    id: number;
}
export declare const FormModel: {
    create(formData: FormData): Promise<number>;
    getById(id: number): Promise<Form | null>;
    update(id: number, formData: Partial<FormData>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
    getAll(): Promise<Form[]>;
};
export default FormModel;
