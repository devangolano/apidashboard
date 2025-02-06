import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
export interface User extends RowDataPacket {
    id: number;
    nome: string;
    email: string;
    senha: string;
    cpf: string;
    celular: string;
    foto?: string;
    role: "user" | "admin";
    notes?: string;
}
export declare class UserModel {
    create(userData: Omit<User, "id">): Promise<ResultSetHeader>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    findAll(): Promise<User[]>;
    update(id: number, userData: Partial<Omit<User, "id">>): Promise<ResultSetHeader>;
    delete(id: number): Promise<ResultSetHeader>;
    comparePassword(password: string, hashedPassword: string): Promise<boolean>;
}
export declare const userModel: UserModel;
export default userModel;
