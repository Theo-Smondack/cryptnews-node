import { NewsExtractionStrategyFactory } from '../../../lib/classes';
import { CoinAcademy, CoinTribune, JournalDuCoin } from '../../../lib/classes/news-strategies';

describe('News extraction strategy factory test', () => {
  const factory = new NewsExtractionStrategyFactory();
  it('should return CoinAcademy strategy', () => {
    const strategy = factory.getStrategy('coinacademy');
    expect(strategy).toBeInstanceOf(CoinAcademy);
  })

  it('should return JournalDuCoin strategy', () => {
    const strategy = factory.getStrategy('journalducoin');
    expect(strategy).toBeInstanceOf(JournalDuCoin);
  })

  it('should return CoinTribune strategy', () => {
    const strategy = factory.getStrategy('cointribune');
    expect(strategy).toBeInstanceOf(CoinTribune);
  })

  it('should throw an error', () => {
    expect(() => factory.getStrategy('unknown')).toThrow('No strategy found for: unknown');
  })

})
