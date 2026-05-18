import { IsString, IsOptional, IsDateString, IsEnum, IsInt, Min } from 'class-validator';

export enum ClientTypeEnum {
  NEW_CLIENT      = 'NEW_CLIENT',
  EXISTING_CLIENT = 'EXISTING_CLIENT',
  REFERRAL        = 'REFERRAL',
}

export class CreateSiteVisitDto {
  @IsString()                         clientId:  string;
  @IsString()                         siteId:    string;
  @IsDateString()                     visitDate: string;
  @IsString()                         visitTime: string;
  @IsOptional() @IsString()           notes?:             string;
  @IsOptional() @IsEnum(ClientTypeEnum) clientType?:      ClientTypeEnum;
  @IsOptional() @IsString()           assistanceContact?: string;
  @IsOptional() @IsInt() @Min(1)      partySize?:         number;
}
