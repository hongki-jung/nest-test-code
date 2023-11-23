import { Injectable, NotFoundException } from '@nestjs/common';
import { Movie } from './domain/movie';

@Injectable()
export class MoviesService {
  private movies: Movie[] = [];

  getAll(): Movie[] {
    return this.movies;
  }

  create(movieData) {
    this.movies.push({
      id: this.movies.length + 1,
      ...movieData,
    });
  }

  getOne(id: number): Movie {
    const movie = this.movies.find((movie) => movie.id === +id);
    if (!movie) {
      throw new NotFoundException(`movie with id ${id} not found`);
    }
    return movie;
  }

  deleteOne(id: number) {
    this.movies = this.movies.filter((movie) => movie.id !== +id);
    return;
  }

  update(id: number, updateData) {
    const movie = this.getOne(id);
    this.deleteOne(id);
    this.movies.push({ ...movie, ...updateData });
  }
}
