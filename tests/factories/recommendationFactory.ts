import { prisma } from '../../src/database';
import faker from '@faker-js/faker';

export async function truncateTable() {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}

type bodyRequestType =
  | 'fullRequest'
  | 'withoutName'
  | 'withoutLink'
  | 'wrongDataType';

export function bodyRequestFactory(requestType: bodyRequestType) {
  let name, youtubeLink;

  switch (requestType) {
    case 'fullRequest':
      name = 'Falamansa - Xote dos Milagres';
      youtubeLink = 'https://www.youtube.com/watch?v=chwyjJbcs1Y';
      break;

    case 'withoutName':
      name = '';
      youtubeLink = 'https://www.youtube.com/watch?v=chwyjJbcs1Y';
      break;

    case 'withoutLink':
      name = 'Falamansa - Xote dos Milagres';
      youtubeLink = '';
      break;

    case 'wrongDataType':
      name = true;
      youtubeLink = 2;
      break;

    default:
      break;
  }

  return { name, youtubeLink };
}

export async function recommendationFactory() {
  const result = await prisma.recommendation.create({
    data: {
      name: 'Falamansa - Xote dos Milagres',
      youtubeLink: 'https://www.youtube.com/watch?v=chwyjJbcs1Y',
    },
  });

  return result;
}

export async function manyRecommendationsFactory(n: number) {
  const data = [];

  for (let i = 0; i < n; i++) {
    data.push({
      name: faker.name.findName(),
      youtubeLink: faker.internet.url(),
      score: faker.datatype.number({ min: -5 }),
    });
  }

  await prisma.recommendation.createMany({
    data,
    skipDuplicates: true,
  });
}

export async function unitTestRecommendationFactory() {
  const result = await prisma.recommendation.create({
    data: {
      name: 'Falamansa - Xote dos Milagres',
      youtubeLink: 'https://www.youtube.com/watch?v=chwyjJbcs1Y',
      score: -5,
    },
  });

  return result;
}
