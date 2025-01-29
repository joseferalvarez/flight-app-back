import { IsNotEmpty, IsEmail } from 'class-validator';

export class PostUserDto {
    @IsNotEmpty()
    username: string;
    
    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    @IsEmail()
    email: string
    
    name: string;
    
    lastname: string;
    
    biography: string;
    
    phone: string;
    
    address: string;
    
    role: string;
}