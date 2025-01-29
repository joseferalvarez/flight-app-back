import { IsNotEmpty } from "class-validator";

export class GetUserDto{
    @IsNotEmpty()
    uuid: string;

    @IsNotEmpty()
    username: string;

    name: string;
    
    lastname: string;
    
    image: string;
    
    biography: string;
    
    phone: string;
    
    address: string;
    
    role: string;
}