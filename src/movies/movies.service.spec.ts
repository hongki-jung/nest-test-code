import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { NotFoundException } from '@nestjs/common';

describe('MoviesService', () => {
  let service: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoviesService],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // getAll 테스트
  describe('getAll', () => {
    it('should return an array', () => {
      const result = service.getAll();
      expect(result).toBeInstanceOf(Array);
    });
  });

  it('should one movie', () => {
    service.create({
      title: '늑대의유혹',
      genres: 'test',
      year: 2022,
    });
    const movie = service.getOne(1);
    expect(movie.id).toEqual(1); // id check
    expect(movie.title).toEqual('늑대의유혹'); // title check
    expect(movie.year).toEqual(2022); // year check
    expect(movie.genres).toEqual('test'); // genres check
  });

  it('should return a not found error', () => {
    try {
      service.getOne(23); //존재하지 않는 무비
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });
});
