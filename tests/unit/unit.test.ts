import { jest } from '@jest/globals';
import { recommendationService } from '../../src/services/recommendationsService.js';
import { recommendationRepository } from '../../src/repositories/recommendationRepository.js';
import { unitTestRecommendationFactory } from '../factories/recommendationFactory.js';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
}

describe('recommendationService/insert - unit test', () => {
  beforeEach(clearMocks);

  it('should not allow a recommendation with a repeated name', () => {
    const recommendation = unitTestRecommendationFactory();

    jest
      .spyOn(recommendationRepository, 'findByName')
      .mockRejectedValue(recommendation);

    const insert = async () =>
      await recommendationService.insert({
        name: (await recommendation).name,
        youtubeLink: (await recommendation).youtubeLink,
      });

    const create = jest.spyOn(recommendationRepository, 'create');

    expect(insert()).rejects.toEqual({
      message: 'Recommendations names must be unique',
      type: 'conflict',
    });
    expect(create).not.toBeCalled();
  });
});
