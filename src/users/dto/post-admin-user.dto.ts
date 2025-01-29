import { IsNotEmpty, IsEmail } from 'class-validator';

export class PostAdminUserDto {
    @IsNotEmpty()
    username: string;
    
    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;
    
    role: string;
}