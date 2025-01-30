import { IsNotEmpty } from "class-validator";
import { Image } from "src/schemas/image.schema";

export class GetUserDto{
    @IsNotEmpty()
    uuid: string;

    @IsNotEmpty()
    username: string;

    name: string;
    
    lastname: string;
    
    image: Image;
    
    biography: string;
    
    phone: string;
    
    address: string;
    
    role: string;
}