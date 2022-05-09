import app from '../../src/app.js';
import supertest from 'supertest';
import { prisma } from '../../src/database.js';
import { faker } from '@faker-js/faker';
import {
  bodyRequestFactory,
  disconnectPrisma,
  manyRecommendationsFactory,
  recommendationFactory,
  truncateTable,
} from '../factories/recommendationFactory.js';

describe('POST /recommendations - integration tests', () => {
  beforeEach(truncateTable);
  afterAll(disconnectPrisma);

  it('should return status 201 and persist given valid parameters', async () => {
    const body = bodyRequestFactory('fullRequest');

    const response = await supertest(app).post('/recommendations').send(body);

    const result = await prisma.recommendation.findUnique({
      where: {
        name: body.name,
      },
    });

    expect(response.status).toEqual(201);
    expect(result.youtubeLink).toBe(body.youtubeLink);
  });

  it('should return status 422 given a request without a name parameter', async () => {
    const response = await supertest(app)
      .post('/recommendations')
      .send(bodyRequestFactory('withoutName'));

    expect(response.status).toEqual(422);
  });

  it('should return status 422 given a request without a youtubeLink parameter', async () => {
    const response = await supertest(app)
      .post('/recommendations')
      .send(bodyRequestFactory('withoutLink'));

    expect(response.status).toEqual(422);
  });

  it('should return status 422 given a empty body request', async () => {
    const response = await supertest(app).post('/recommendations').send();

    expect(response.status).toEqual(422);
  });

  it('should return status 422 given a request with wrong data types in the parameters', async () => {
    const response = await supertest(app)
      .post('/recommendations')
      .send(bodyRequestFactory('wrongDataType'));

    expect(response.status).toEqual(422);
  });
});

describe('POST /recommendations/:id/upvote - integration tests', () => {
  beforeEach(truncateTable);
  afterAll(disconnectPrisma);

  it('should return status 200 and increment the score by 1', async () => {
    const recommendation = await recommendationFactory();

    const response = await supertest(app)
      .post(`/recommendations/${recommendation.id}/upvote`)
      .send();

    const result = await prisma.recommendation.findUnique({
      where: {
        id: recommendation.id,
      },
    });

    expect(response.status).toEqual(200);
    expect(result.score).toBe(1);
  });
});

describe('POST /recommendations/:id/downvote - integration tests', () => {
  beforeEach(truncateTable);
  afterAll(disconnectPrisma);

  it('should return status 200 and decrement the score by 1', async () => {
    const recommendation = await recommendationFactory();

    const response = await supertest(app)
      .post(`/recommendations/${recommendation.id}/downvote`)
      .send();

    const result = await prisma.recommendation.findUnique({
      where: {
        id: recommendation.id,
      },
    });

    expect(response.status).toEqual(200);
    expect(result.score).toBe(-1);
  });
});

describe('GET /recommendations - integration tests', () => {
  beforeEach(truncateTable);
  afterAll(disconnectPrisma);

  it('should return status 200 and list of recommendations', async () => {
    await manyRecommendationsFactory(15);

    const response = await supertest(app).get('/recommendations');

    expect(response.status).toEqual(200);
    expect(response.body).not.toBeNull();
    // expect(response.body.length).toBeLessThanOrEqual(10);
  });
});

describe('GET /recommendations/:id', () => {
  beforeEach(truncateTable);
  afterAll(disconnectPrisma);

  it('should return status 200 and the recommendation requested', async () => {
    const recommendation = await recommendationFactory();

    const response = await supertest(app).get(
      `/recommendations/${recommendation.id}`
    );

    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(recommendation.id);
    expect(response.body.name).toEqual(recommendation.name);
    expect(response.body.youtubeLink).toEqual(recommendation.youtubeLink);
  });
});

describe('GET /recommendations/random', () => {
  beforeEach(truncateTable);
  afterAll(disconnectPrisma);

  it('should return status 200 and a recommendation', async () => {
    await manyRecommendationsFactory(15);

    const response = await supertest(app).get('/recommendations/random');

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('name');
  });
});

describe('GET /recommendations/top/:amount', () => {
  beforeEach(truncateTable);
  afterAll(disconnectPrisma);

  it('should return status 200 and a raking list of recommendations', async () => {
    await manyRecommendationsFactory(15);

    const amount = faker.datatype.number({ min: 2, max: 15 });

    const response = await supertest(app).get(`/recommendations/top/${amount}`);

    expect(response.status).toEqual(200);
    expect(response.body).toHaveLength(amount);
    expect(response.body[0].score).toBeGreaterThanOrEqual(
      response.body[1].score
    );
  });
});
