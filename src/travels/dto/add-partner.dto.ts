import { IsNotEmpty } from "class-validator";

export class AddPartnerDto{
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    permissions: string;
}