import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie, MovieDocument } from './movieSchema';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

describe('MoviesService', () => {
  let service: MoviesService;
  let model: Model<MovieDocument>;
  let cacheManager: any;

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const mockMovie = {
      save: jest.fn(),
    };

    const MockModel: any = function () {
      return mockMovie;
    };

    MockModel.find = jest.fn(() => ({ exec: jest.fn() }));
    MockModel.findByIdAndUpdate = jest.fn(() => ({ exec: jest.fn() }));
    MockModel.findByIdAndDelete = jest.fn(() => ({ exec: jest.fn() }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getModelToken(Movie.name),
          useValue: MockModel,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    model = module.get<Model<MovieDocument>>(getModelToken(Movie.name));
  });

  describe('findAll', () => {
    it('should return all movies', async () => {
      const movies = [
        { _id: '1', title: 'Movie 1' },
        { _id: '2', title: 'Movie 2' },
      ];

      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(movies),
      } as any);

      const result = await service.findAll();

      expect(result).toEqual(movies);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search movies by title or genre', async () => {
      const query = 'action';
      const movies = [{ _id: '1', title: 'Action Movie', genre: 'Action' }];

      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(movies),
      } as any);

      const result = await service.search(query);

      expect(result).toEqual(movies);
      expect(model.find).toHaveBeenCalledWith({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { genre: { $regex: query, $options: 'i' } },
        ],
      });
    });
  });

  describe('create', () => {
    it('should create a new movie and clear cache', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        genre: 'Action',
        rating: 5,
        streamingLink: 'https://test.com',
      };

      const savedMovie = {
        _id: 'someId',
        __v: 1,
        ...createMovieDto,
      };

      const modelInstance = new model(createMovieDto);
      jest.spyOn(modelInstance, 'save').mockResolvedValue(savedMovie as any);

      const result = await service.create(createMovieDto);

      expect(cacheManager.del).toHaveBeenCalledWith('movies');
      expect(result).toEqual(savedMovie);
    });

    it('should handle save errors', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        genre: 'Action',
        rating: 5,
        streamingLink: 'https://test.com',
      };

      const modelInstance = new model(createMovieDto);
      jest
        .spyOn(modelInstance, 'save')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.create(createMovieDto)).rejects.toThrow(
        'Database error',
      );
      expect(cacheManager.del).toHaveBeenCalledWith('movies');
    });
  });

  describe('update', () => {
    it('should update a movie and clear cache', async () => {
      const movieId = 'someId';
      const updateMovieDto: UpdateMovieDto = {
        title: 'Updated Movie',
      };

      const updatedMovie = {
        _id: movieId,
        title: 'Updated Movie',
        genre: 'Action',
      };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedMovie),
      } as any);

      const result = await service.update(movieId, updateMovieDto);

      expect(result).toEqual(updatedMovie);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        movieId,
        updateMovieDto,
        { new: true },
      );
      expect(cacheManager.del).toHaveBeenCalledWith('movies');
    });

    it('should throw NotFoundException if movie not found during update', async () => {
      const movieId = 'nonexistentId';
      const updateMovieDto: UpdateMovieDto = {
        title: 'Updated Movie',
      };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.update(movieId, updateMovieDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a movie and clear cache', async () => {
      const movieId = 'someId';
      const deletedMovie = {
        _id: movieId,
        title: 'Deleted Movie',
      };

      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedMovie),
      } as any);

      const result = await service.remove(movieId);

      expect(result).toEqual(deletedMovie);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(movieId);
      expect(cacheManager.del).toHaveBeenCalledWith('movies');
    });

    it('should throw NotFoundException if movie not found during removal', async () => {
      const movieId = 'nonexistentId';

      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.remove(movieId)).rejects.toThrow(NotFoundException);
    });
  });
});
