import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MovieDocument = Movie & Document;

@Schema()
export class Movie {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  genre: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  streamingLink: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
