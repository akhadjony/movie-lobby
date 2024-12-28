import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Model } from 'mongoose';
import { Movie, MovieDocument } from './movieSchema';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private readonly movieModel: Model<MovieDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll(): Promise<Movie[]> {
    return this.movieModel.find().exec();
  }

  async search(query: string): Promise<Movie[]> {
    return await this.movieModel
      .find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { genre: { $regex: query, $options: 'i' } },
        ],
      })
      .exec();
  }

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const createdMovie = new this.movieModel(createMovieDto);
    await this.cacheManager.del('movies');

    return createdMovie.save();
  }

  async update(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.movieModel
      .findByIdAndUpdate(id, updateMovieDto, { new: true })
      .exec();

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    await this.cacheManager.del('movies');

    return movie;
  }

  async remove(id: string): Promise<Movie> {
    const movie = await this.movieModel.findByIdAndDelete(id).exec();

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    await this.cacheManager.del('movies');

    return movie;
  }
}
