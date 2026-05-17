import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateSiteVisitDto {
  @IsString() clientId: string;
  @IsString() siteId: string;
  @IsDateString() visitDate: string;
  @IsString() visitTime: string;
  @IsOptional() @IsString() notes?: string;
}
