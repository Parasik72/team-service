import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../roles/roles.model";

export interface jwtPayloadDto extends JwtPayload {
    id: string;
    email: string;
    isGoogleAccount: boolean;
    role: string;
}