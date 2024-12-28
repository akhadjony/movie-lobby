# Movies API

This is a Movies API built using NestJS, Mongoose, and MongoDB. The application includes features for CRUD operations, caching, and Swagger-based API documentation.

## Table of Contents

- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Running with Docker](#running-with-docker)
- [API Documentation](#api-documentation)
- [Caching](#caching)

---

## Features

- Create, read, update, and delete movies.
- Search for movies by title or genre.
- Swagger-based API documentation.
- Caching implemented for GET requests using `@nestjs/cache-manager`.
- Authentication for POST, PUT, and DELETE endpoints.

---

## Setup Instructions

### Prerequisites

- Node.js (v20+)
- Docker & Docker Compose
- MongoDB (Dockerized setup included)

---

## Running with Docker

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/movie-lobby.git
cd movies-api
```

### 2. Build and Run the Docker Containers

A `docker-compose.yml` is already configured to run the API and MongoDB.

```bash
docker-compose up --build
```

This will:
- Build the Movies API container.
- Start a MongoDB container.

The API will be available at: [http://localhost:3000](http://localhost:3000)  
Swagger documentation will be accessible at: [http://localhost:3000/api](http://localhost:3000/api)

---

## API Documentation

The API supports the following routes:

### Base URL

```
http://localhost:3000/movies
```

### Endpoints

#### `GET /movies`

- Fetch all movies.
- **Cache applied.**
- **No authentication required.**

#### `GET /movies/search?q={query}`

- Search for movies by title or genre.
- **Cache applied.**
- **No authentication required.**

#### `POST /movies`

- Create a new movie.
- Requires authentication.
- Request Body:

```json
{
  "title": "string",
  "genre": "string",
  "rating": "number",
  "streamingLink": "string"
}
```

#### `PUT /movies/:id`

- Update an existing movie.
- Requires authentication.
- Request Body:

```json
{
  "title": "string",
  "genre": "string",
  "rating": "number",
  "streamingLink": "string"
}
```

#### `DELETE /movies/:id`

- Delete a movie by ID.
- Requires authentication.

### Swagger UI

The Swagger UI is available at:

```
http://localhost:3000/api
```

You can explore all endpoints, view request/response schemas, and test them interactively.

---

## Caching

Caching is implemented using `@nestjs/cache-manager`:

1. **GET /movies**:
    - Cached results for subsequent requests.
    - Cache invalidated on `POST`, `PUT`, and `DELETE`.

2. **GET /movies/search**:
    - Cached results for search queries.
    - Cache invalidated on `POST`, `PUT`, and `DELETE`.

---

## Future Enhancements

- Add pagination for `GET /movies` and `GET /movies/search`.
- Implement user roles and permissions for enhanced security.
- Add rate-limiting to the API for better performance under heavy load.
- Introduce additional fields to the Movie schema (e.g., director, ratings).
- Improve caching strategy with time-based expiration.

---
