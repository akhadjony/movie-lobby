import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { MoviesModule } from './movies/movies.module';
import { AuthModule } from './auth/auth.module';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongo/movie_lobby'),
    CacheModule.register({
      useFactory: async () => ({
        store: await redisStore({
          socket: { host: 'redis', port: 6379 },
        }),
        ttl: 10,
      }),
      isGlobal: true,
    }),
    MoviesModule,
    AuthModule,
  ],
})
export class AppModule {}
