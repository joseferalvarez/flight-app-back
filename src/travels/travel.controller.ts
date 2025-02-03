import { Controller, Get, UseGuards, Post, Req, Body, Param, Put } from '@nestjs/common';
import { TravelService } from './travel.service';
import { AuthGuard } from 'src/auth.guard';
import { PostTravelDto } from './dto/post-travel.dto';
import { Request } from 'express';
import { AddPartnerDto } from './dto/add-partner.dto';
import { AddAttachmentDto } from './dto/add-attachment.dto';

@Controller('travels')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  //Get the travels of a user
  @UseGuards(AuthGuard)
  @Get()
  getTravels(@Req() request: Request){
    return this.travelService.getTravels(request);
  }

  //Post a new travel
  @UseGuards(AuthGuard)
  @Post()
  postTravel(@Body() travel: PostTravelDto, @Req() request: Request){
    return this.travelService.postTravel(travel, request);
  }

  //Add a partner to a travel
  @UseGuards(AuthGuard)
  @Put("/add-partner/:uuid")
  addPartner(@Body() partner: AddPartnerDto, @Param() uuid: string, @Req() request: Request){
    return this.travelService.addPartner(partner, uuid, request);
  }

  //TODO: Add an attachment to a travel
  @UseGuards(AuthGuard)
  @Put("/add-attachment/:uuid")
  addAttachment(@Body() attachment: AddAttachmentDto, @Param() uuid: string, @Req() request: Request){
    return this.travelService.addAttachment(attachment, uuid, request);
  }
}
