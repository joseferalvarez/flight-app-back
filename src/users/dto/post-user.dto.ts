import { IsNotEmpty } from 'class-validator';

export class PostUserDto {
    @IsNotEmpty()
    username: string;
    
    @IsNotEmpty()
    password: string;
    
    name: string;
    
    lastname: string;
    
    image: string;
    
    biography: string;
    
    phone: string;
    
    address: string;
    
    type: string;
}