import { IsNotEmpty } from "class-validator";

export class PostTravelDto{
    @IsNotEmpty()
    name: string;

    init_date: Date;
    
    end_date: Date;
    
}