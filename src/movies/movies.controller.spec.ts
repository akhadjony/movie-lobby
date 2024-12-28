import { Test, TestingModule } from '@nestjs/testing';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';

const mockAuthService = {
  validateUser: jest.fn(),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('MoviesController', () => {
  let controller: MoviesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: {
            findAll: jest
              .fn()
              .mockResolvedValue([{ title: 'Movie 1' }, { title: 'Movie 2' }]),
            search: jest.fn().mockResolvedValue([{ title: 'Movie 1' }]),
            create: jest
              .fn()
              .mockResolvedValue({ id: 'abcdef', title: 'New Movie' }),
            update: jest
              .fn()
              .mockResolvedValue({ id: 'abcdef', title: 'Updated Movie' }),
            remove: jest
              .fn()
              .mockResolvedValue({ id: 'abcdef', title: 'Deleted Movie' }),
          },
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: mockCacheManager,
        },
        CacheInterceptor,
        AuthGuard,
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of movies', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([{ title: 'Movie 1' }, { title: 'Movie 2' }]);
    });
  });

  describe('search', () => {
    it('should return an array of movies matching the search query', async () => {
      const result = await controller.search('Movie 1');
      expect(result).toEqual([{ title: 'Movie 1' }]);
    });
  });

  describe('create', () => {
    it('should create a new movie', async () => {
      const movieDto: CreateMovieDto = {
        title: 'New Movie',
        genre: 'Action',
        rating: 5,
        streamingLink: 'https://example.com/new-movie',
      };
      const result = await controller.create(movieDto);
      expect(result).toEqual({ id: 'abcdef', title: 'New Movie' });
    });
  });

  describe('update', () => {
    it('should update an existing movie', async () => {
      const movieDto: UpdateMovieDto = {
        title: 'Updated Movie',
      };
      const result = await controller.update('abcdef', movieDto);
      expect(result).toEqual({ id: 'abcdef', title: 'Updated Movie' });
    });
  });

  describe('remove', () => {
    it('should delete a movie', async () => {
      const result = await controller.remove('abcdef');
      expect(result).toEqual({ id: 'abcdef', title: 'Deleted Movie' });
    });
  });
});
