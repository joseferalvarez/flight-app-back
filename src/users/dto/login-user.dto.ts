import { IsEmail, IsNotEmpty } from "class-validator";

export class LogInUserDto{
    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    password: string
}