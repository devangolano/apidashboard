import type { Request, Response } from "express";
declare class UserController {
    create(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
declare const _default: UserController;
export default _default;
