import { IsNotEmpty } from "class-validator"

export class AddAttachmentDto{
    name: string;

    @IsNotEmpty()
    url: string;

    @IsNotEmpty()
    type: string;
}