import { IsNotEmpty } from "class-validator";

export class SignUserDto{
    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    email: string

    @IsNotEmpty()
    password: string
}