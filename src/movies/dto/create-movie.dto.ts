import { IsString, IsNumber, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty()
  @IsString()
  readonly title: string;

  @ApiProperty()
  @IsString()
  readonly genre: string;

  @ApiProperty()
  @IsNumber()
  readonly rating: number;

  @ApiProperty()
  @IsUrl()
  readonly streamingLink: string;
}
