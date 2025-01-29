import { IsNotEmpty } from "class-validator";

export class GetUserDto{
    @IsNotEmpty()
    uuid: string;

    @IsNotEmpty()
    username: string;

    name: string;
    
    lastname: string;
    
    image: {
        image_name: string;
        image_url: string;
    }
    
    biography: string;
    
    phone: string;
    
    address: string;
    
    role: string;
}