import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString, Min } from 'class-validator';

export class CreateBookingDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsString() roomId: string;
  @IsDateString() startTime: string;
  @IsDateString() endTime: string;
  @IsNumber() @Min(1) attendeeCount: number;
  @IsString() meetingType: string;
  @IsOptional() @IsBoolean() requiresRefreshment?: boolean;
  @IsOptional() @IsString() notes?: string;
}
