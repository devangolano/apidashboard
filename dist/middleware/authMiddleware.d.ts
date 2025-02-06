import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const isAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export {};
