import { Controller, Get, UseGuards, Post, Req, Body, Param, Put } from '@nestjs/common';
import { TravelService } from './travel.service';
import { AuthGuard } from 'src/auth.guard';
import { PostTravelDto } from './dto/post-travel.dto';
import { Request } from 'express';
import { AddPartnerDto } from './dto/add-partner.dto';

@Controller('travels')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @UseGuards(AuthGuard)
  @Get()
  getTravels(@Req() request: Request){
    return this.travelService.getTravels(request);
  }

  @UseGuards(AuthGuard)
  @Post()
  postTravel(@Body() travel: PostTravelDto, @Req() request: Request){
    return this.travelService.postTravel(travel, request);
  }

  @UseGuards(AuthGuard)
  @Put("/add-partner/:uuid")
  addPartner(@Body() partner: AddPartnerDto, @Param() uuid: string, @Req() request: Request){
    return this.travelService.addPartner(partner, uuid, request);
  }
}
