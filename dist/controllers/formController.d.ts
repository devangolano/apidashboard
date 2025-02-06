import type { Request, Response } from "express";
export declare const FormController: {
    createForm: (req: Request, res: Response) => Promise<void>;
    getForm: (req: Request, res: Response) => Promise<void>;
    updateForm: (req: Request, res: Response) => Promise<void>;
    deleteForm: (req: Request, res: Response) => Promise<void>;
    listForms: (req: Request, res: Response) => Promise<void>;
    generatePDF: (req: Request, res: Response) => Promise<void>;
};
