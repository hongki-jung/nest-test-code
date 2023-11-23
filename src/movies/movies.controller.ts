import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateMovieDto } from './dto/create-movie.dto';

import { MoviesService } from './movies.service';
import { Movie } from './domain/movie';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  getAll(): Movie[] {
    return this.moviesService.getAll();
  }

  @Get('search')
  search(@Query('year') searchingYear: string) {
    return `we are going to search for a movie after ${searchingYear}`;
  }

  @Get('/:id')
  getOne(@Param('id') movieId: number): Movie {
    return this.moviesService.getOne(movieId);
  }
  @Post()
  create(@Body() movieData: CreateMovieDto) {
    return this.moviesService.create(movieData);
  }
  @Delete('/:id')
  delete(@Param('id') movieId: number) {
    return this.moviesService.deleteOne(movieId);
  }

  @Patch('/:id')
  patch(@Param('id') movieId: number, @Body() dto: UpdateMovieDto) {
    return this.moviesService.update(movieId, dto);
  }
}
