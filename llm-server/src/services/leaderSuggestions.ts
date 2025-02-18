import { DataService } from './data';
import { User, TradingStrategy } from '../types';
import { LeaderSuggestion, MatchingParameters } from '../types/matching';

interface PerformanceMetrics {
  winRates: number[];
  monthlyReturns: number[];
  tradeCounts: number[];
}

interface WeightConfig {
  riskWeight: number;
  styleWeight: number;
  marketWeight: number;
  frequencyWeight: number;
}

export class LeaderSuggestionsService {
  private readonly riskToleranceMap = {
    low: 0,
    medium: 0.5,
    high: 1,
  };

  private readonly investmentStyleMap = {
    conservative: 0,
    moderate: 0.5,
    aggressive: 1,
  };

  private readonly frequencyMap = {
    monthly: 0,
    weekly: 0.5,
    daily: 1,
  };

  constructor(private dataService: DataService) {}

  private getPercentileRank(value: number, array: number[]): number {
    if (array.length === 0) return 0.5;

    // Sort array in ascending order
    const sortedArray = [...array].sort((a, b) => a - b);

    // Count values less than the target value
    const count = sortedArray.filter(v => v < value).length;

    // Calculate percentile (0 to 1)
    return count / array.length;
  }

  private async getPerformanceMetrics(leaders: User[]): Promise<PerformanceMetrics> {
    try {
      // Get all strategies for each leader
      const allLeaderStrategies = await Promise.all(
        leaders.map(async leader => {
          // First try to get strategies by leaderId
          const leaderStrategies = await this.getStrategiesForAccount(leader.id);

          // If no strategies found by leaderId, try each account
          if (leaderStrategies.length === 0) {
            const accountStrategiesPromises = leader.accounts.map(accId =>
              this.getStrategiesForAccount(accId)
            );
            return (await Promise.all(accountStrategiesPromises)).flat();
          }

          return leaderStrategies;
        })
      );

      // Calculate aggregate performance metrics
      const metrics = leaders.map((leader, index) => {
        const strategies = allLeaderStrategies[index];

        // If leader has performance metrics, use them
        if (leader.performance) {
          return {
            winRate: leader.performance.winRate,
            monthlyReturn: leader.performance.monthlyReturn,
            tradeCount: leader.performance.totalTrades,
          };
        }

        // Otherwise calculate from strategies
        if (strategies.length > 0) {
          return {
            winRate:
              strategies.reduce((sum, s) => {
                if (!s.performance || typeof s.performance.winRate !== 'number') {
                  console.warn(`Invalid win rate data for strategy ${s.id}`);
                  return sum + 50; // default to 50% win rate
                }
                return sum + s.performance.winRate;
              }, 0) / strategies.length,
            monthlyReturn:
              strategies.reduce((sum, s) => {
                if (!s.performance || typeof s.performance.totalReturn !== 'number') {
                  console.warn(`Invalid return data for strategy ${s.id}`);
                  return sum + 0; // default to 0% return
                }
                return sum + s.performance.totalReturn;
              }, 0) / strategies.length,
            tradeCount: strategies.length * 20, // Estimate average trades per strategy
          };
        }

        // Default values if no data available
        return {
          winRate: 50, // default to 50% win rate
          monthlyReturn: 0,
          tradeCount: 0,
        };
      });

      return {
        winRates: metrics.map(m => m.winRate).filter(rate => rate >= 0),
        monthlyReturns: metrics.map(m => m.monthlyReturn).filter(return_ => return_ >= 0),
        tradeCounts: metrics.map(m => m.tradeCount).filter(trades => trades >= 0),
      };
    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      return {
        winRates: [],
        monthlyReturns: [],
        tradeCounts: [],
      };
    }
  }

  private getWeights(copier: MatchingParameters): WeightConfig {
    const weights = {
      riskWeight: 0.25,
      styleWeight: 0.25,
      marketWeight: 0.25,
      frequencyWeight: 0.25,
    };

    // Increase risk weight if copier has strict risk tolerance
    if (copier.maxDrawdown < 15) {
      weights.riskWeight += 0.1;
      weights.styleWeight -= 0.1;
    }

    // Increase market weight if copier has specific market preferences
    if (copier.preferredMarkets.length > 0) {
      weights.marketWeight += 0.1;
      weights.frequencyWeight -= 0.1;
    }

    return weights;
  }

  private async calculateRiskScore(
    copier: MatchingParameters,
    leader: User,
    metrics: PerformanceMetrics
  ): Promise<number> {
    try {
      const copierRisk = this.riskToleranceMap[copier.riskTolerance];

      // Get strategies by leaderId first
      const leaderStrategies = await this.getStrategiesForAccount(leader.id);

      // If no strategies found by leaderId, try each account
      let strategies = leaderStrategies;
      if (strategies.length === 0) {
        const accountStrategiesPromises = leader.accounts.map(accId =>
          this.getStrategiesForAccount(accId)
        );
        strategies = (await Promise.all(accountStrategiesPromises)).flat();
      }

      if (strategies.length === 0 && leader.performance) {
        // Calculate risk score based on performance metrics
        const winRatePercentile = this.getPercentileRank(
          leader.performance.winRate,
          metrics.winRates
        );
        const tradeCountPercentile = this.getPercentileRank(
          leader.performance.totalTrades,
          metrics.tradeCounts
        );

        // Higher percentiles indicate lower risk
        const performanceRisk = 1 - (0.7 * winRatePercentile + 0.3 * tradeCountPercentile);
        return 1 - Math.abs(copierRisk - performanceRisk);
      }

      // Calculate risk from strategies
      const strategyRiskScore =
        strategies.reduce((sum, strategy) => {
          if (!strategy.riskLevel) {
            console.warn(`Missing risk level for strategy ${strategy.id}`);
            return sum + 0.5; // default to medium risk
          }
          const baseRisk =
            this.riskToleranceMap[strategy.riskLevel as keyof typeof this.riskToleranceMap] || 0.5;
          return sum + baseRisk;
        }, 0) / (strategies.length || 1);

      if (leader.performance) {
        const winRatePercentile = this.getPercentileRank(
          leader.performance.winRate,
          metrics.winRates
        );
        const performanceRisk = 1 - winRatePercentile; // Higher win rate = lower risk

        // Weight strategy risk with performance risk
        const strategyWeight = 0.6;
        const performanceWeight = 0.4;

        const finalRisk = strategyWeight * strategyRiskScore + performanceWeight * performanceRisk;
        return 1 - Math.abs(copierRisk - finalRisk);
      }

      return 1 - Math.abs(copierRisk - strategyRiskScore);
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return 0.5; // default to medium risk on error
    }
  }

  private async calculateStyleScore(
    copier: MatchingParameters,
    leader: User,
    metrics: PerformanceMetrics
  ): Promise<number> {
    try {
      const copierStyle = this.investmentStyleMap[copier.investmentStyle];

      // Get strategies by leaderId first
      const leaderStrategies = await this.getStrategiesForAccount(leader.id);

      // If no strategies found by leaderId, try each account
      let strategies = leaderStrategies;
      if (strategies.length === 0) {
        const accountStrategiesPromises = leader.accounts.map(accId =>
          this.getStrategiesForAccount(accId)
        );
        strategies = (await Promise.all(accountStrategiesPromises)).flat();
      }

      if (strategies.length === 0 && leader.performance) {
        // Infer style from performance metrics
        const monthlyReturnPercentile = this.getPercentileRank(
          leader.performance.monthlyReturn,
          metrics.monthlyReturns
        );
        const winRatePercentile = this.getPercentileRank(
          leader.performance.winRate,
          metrics.winRates
        );

        // Higher returns with lower win rates suggest more aggressive style
        const performanceStyle = 0.7 * monthlyReturnPercentile + 0.3 * (1 - winRatePercentile);
        return 1 - Math.abs(copierStyle - performanceStyle);
      }

      // Calculate style from strategies
      const strategyStyleScore =
        strategies.reduce((sum, strategy) => {
          if (!strategy.tradeType) {
            console.warn(`Missing trade type for strategy ${strategy.id}`);
            return sum + 0.5; // default to moderate
          }

          let score = 0.5; // Default moderate

          // Analyze strategy type
          if (strategy.tradeType === 'scalping' || strategy.tradeType === 'day_trading') {
            score = 0.8; // More aggressive
          } else if (strategy.tradeType === 'position_trading') {
            score = 0.3; // More conservative
          }

          return sum + score;
        }, 0) / (strategies.length || 1);

      if (leader.performance) {
        const monthlyReturnPercentile = this.getPercentileRank(
          leader.performance.monthlyReturn,
          metrics.monthlyReturns
        );
        const performanceStyle = monthlyReturnPercentile; // Higher returns = more aggressive

        // Weight strategy style with performance style
        const strategyWeight = 0.6;
        const performanceWeight = 0.4;

        const finalStyle =
          strategyWeight * strategyStyleScore + performanceWeight * performanceStyle;
        return 1 - Math.abs(copierStyle - finalStyle);
      }

      return 1 - Math.abs(copierStyle - strategyStyleScore);
    } catch (error) {
      console.error('Error calculating style score:', error);
      return 0.5; // default to moderate style on error
    }
  }

  private async calculateMarketScore(
    copier: MatchingParameters,
    leader: User,
    metrics: PerformanceMetrics
  ): Promise<number> {
    try {
      const copierMarkets = new Set(copier.preferredMarkets);
      const leaderMarkets = new Set(await this.getLeaderMarkets(leader));

      // If copier has no preferences, evaluate leader's success
      if (copierMarkets.size === 0 && leader.performance) {
        const winRatePercentile = this.getPercentileRank(
          leader.performance.winRate,
          metrics.winRates
        );
        const monthlyReturnPercentile = this.getPercentileRank(
          leader.performance.monthlyReturn,
          metrics.monthlyReturns
        );

        // Weight win rate and returns for market expertise
        return 0.6 * winRatePercentile + 0.4 * monthlyReturnPercentile;
      }

      // If leader has no markets yet
      if (leaderMarkets.size === 0) {
        return 0.3; // Below average confidence
      }

      const intersection = new Set([...copierMarkets].filter(market => leaderMarkets.has(market)));

      const baseScore =
        intersection.size / (copierMarkets.size + leaderMarkets.size - intersection.size);

      // Boost score if leader has good performance in matching markets
      if (leader.performance && intersection.size > 0) {
        const winRatePercentile = this.getPercentileRank(
          leader.performance.winRate,
          metrics.winRates
        );
        const performanceBoost = Math.max(0, winRatePercentile - 0.5) * 0.2;
        return Math.min(1, baseScore + performanceBoost);
      }

      return baseScore;
    } catch (error) {
      console.error('Error calculating market score:', error);
      return 0.5; // default to neutral market match on error
    }
  }

  private async calculateFrequencyScore(
    copier: MatchingParameters,
    leader: User,
    metrics: PerformanceMetrics
  ): Promise<number> {
    try {
      const copierFreq = this.frequencyMap[copier.tradingFrequency];

      // Get strategies by leaderId first
      const leaderStrategies = await this.getStrategiesForAccount(leader.id);

      // If no strategies found by leaderId, try each account
      let strategies = leaderStrategies;
      if (strategies.length === 0) {
        const accountStrategiesPromises = leader.accounts.map(accId =>
          this.getStrategiesForAccount(accId)
        );
        strategies = (await Promise.all(accountStrategiesPromises)).flat();
      }

      if (strategies.length === 0 && leader.performance) {
        // Infer frequency from trade count percentile
        const tradeCountPercentile = this.getPercentileRank(
          leader.performance.totalTrades,
          metrics.tradeCounts
        );
        return 1 - Math.abs(copierFreq - tradeCountPercentile);
      }

      // Calculate frequency from strategies
      const strategyFrequencyScore =
        strategies.reduce((sum, strategy) => {
          if (!strategy.tradeType) {
            console.warn(`Missing trade type for strategy ${strategy.id}`);
            return sum + 0.5; // default to weekly
          }

          let score = 0.5; // Default to weekly

          switch (strategy.tradeType) {
            case 'scalping':
            case 'day_trading':
              score = 1; // Daily
              break;
            case 'swing_trading':
              score = 0.5; // Weekly
              break;
            case 'position_trading':
              score = 0; // Monthly
              break;
          }

          return sum + score;
        }, 0) / (strategies.length || 1);

      if (leader.performance) {
        const tradeCountPercentile = this.getPercentileRank(
          leader.performance.totalTrades,
          metrics.tradeCounts
        );

        // Weight strategy frequency with actual trading frequency
        const strategyWeight = 0.6;
        const actualWeight = 0.4;

        const finalFrequency =
          strategyWeight * strategyFrequencyScore + actualWeight * tradeCountPercentile;
        return 1 - Math.abs(copierFreq - finalFrequency);
      }

      return 1 - Math.abs(copierFreq - strategyFrequencyScore);
    } catch (error) {
      console.error('Error calculating frequency score:', error);
      return 0.5; // default to weekly frequency on error
    }
  }

  private async getStrategiesForAccount(accountId: string): Promise<TradingStrategy[]> {
    return this.dataService.getUserStrategies(accountId);
  }

  private async getLeaderMarkets(leader: User): Promise<string[]> {
    try {
      // Get strategies by leaderId first
      const leaderStrategies = await this.getStrategiesForAccount(leader.id);

      // If no strategies found by leaderId, try each account
      let strategies = leaderStrategies;
      if (strategies.length === 0) {
        const accountStrategiesPromises = leader.accounts.map(accId =>
          this.getStrategiesForAccount(accId)
        );
        strategies = (await Promise.all(accountStrategiesPromises)).flat();
      }

      // Extract unique markets from strategy names
      return [
        ...new Set(
          strategies
            .filter(s => s.name && typeof s.name === 'string')
            .map(s => {
              const market = s.name.split(' ')[0];
              if (!market) {
                console.warn(`Invalid market name format for strategy ${s.id}`);
                return 'unknown';
              }
              return market.toUpperCase(); // Normalize market names
            })
            .filter(market => market !== 'unknown')
        ),
      ];
    } catch (error) {
      console.error('Error getting leader markets:', error);
      return [];
    }
  }

  private async getLeaderStats(leader: User, strategies: TradingStrategy[]) {
    // Get unique copiers across all strategies
    const uniqueCopiers = new Set<string>();
    strategies.forEach(strategy => {
      strategy.copiers.forEach(copierId => uniqueCopiers.add(copierId));
    });

    // Calculate total profit (for now random like in top-leaders)
    const totalProfit = Math.floor(Math.random() * 900000) + 100000;

    return {
      copiers: uniqueCopiers.size,
      totalProfit,
    };
  }

  private async mapLeaderToSuggestion(
    leader: User,
    compatibilityScore: number,
    matchDetails: {
      riskScore: number;
      styleScore: number;
      marketScore: number;
      frequencyScore: number;
    }
  ): Promise<LeaderSuggestion> {
    try {
      // Get strategies by leaderId first
      const leaderStrategies = await this.getStrategiesForAccount(leader.id);

      // If no strategies found by leaderId, try each account
      let strategies = leaderStrategies;
      if (strategies.length === 0) {
        const accountStrategiesPromises = leader.accounts.map(accId =>
          this.getStrategiesForAccount(accId)
        );
        strategies = (await Promise.all(accountStrategiesPromises)).flat();
      }

      // Get leader stats
      const stats = await this.getLeaderStats(leader, strategies);

      return {
        leaderId: leader.id,
        username: leader.username || 'Unknown User',
        displayName: leader.displayName || 'Unknown User',
        profilePicture: leader.profilePicture || '',
        copiers: stats.copiers,
        totalProfit: stats.totalProfit,
        compatibilityScore,
        matchDetails,
        performance: leader.performance || {
          winRate: 0,
          totalPnL: stats.totalProfit,
          monthlyReturn: 0,
          totalTrades: 0,
        },
        strategies: strategies
          .filter(strategy => {
            if (!strategy.id || !strategy.name || !strategy.riskLevel || !strategy.performance) {
              console.warn(`Invalid strategy data for strategy ${strategy.id || 'unknown'}`);
              return false;
            }
            return true;
          })
          .map(strategy => ({
            id: strategy.id,
            name: strategy.name,
            description: strategy.description || '',
            riskLevel: strategy.riskLevel,
            performance: {
              totalReturn: strategy.performance.totalReturn || 0,
              winRate: strategy.performance.winRate || 0,
              averageProfit: strategy.performance.averageProfit || 0,
            },
          })),
      };
    } catch (error) {
      console.error('Error mapping leader to suggestion:', error);
      return {
        leaderId: leader.id,
        username: 'Error',
        displayName: 'Error Loading Leader',
        profilePicture: '',
        copiers: 0,
        totalProfit: 0,
        compatibilityScore: 0,
        matchDetails,
        performance: {
          winRate: 0,
          totalPnL: 0,
          monthlyReturn: 0,
          totalTrades: 0,
        },
        strategies: [],
      };
    }
  }

  public async findMatchingLeaders(copierId: string): Promise<LeaderSuggestion[]> {
    // Get copier preferences
    const copier = await this.dataService.getUser(copierId);
    if (!copier || !copier.tradingPreferences) {
      throw new Error('Copier not found or preferences not set');
    }

    const matchingParams: MatchingParameters = {
      riskTolerance: copier.tradingPreferences.riskTolerance,
      investmentStyle: copier.tradingPreferences.investmentStyle,
      tradingFrequency: copier.tradingPreferences.tradingFrequency,
      preferredMarkets: copier.tradingPreferences.preferredMarkets,
      maxDrawdown: copier.tradingPreferences.maxDrawdown,
      targetReturn: copier.tradingPreferences.targetReturn,
    };

    // Get all leaders and performance metrics
    const leaders = await this.dataService.getLeaders();
    const metrics = await this.getPerformanceMetrics(leaders);

    // Get weights based on copier preferences
    const weights = this.getWeights(matchingParams);

    // Calculate scores for each leader
    const suggestions = await Promise.all(
      leaders.map(async leader => {
        const scores = {
          riskScore: await this.calculateRiskScore(matchingParams, leader, metrics),
          styleScore: await this.calculateStyleScore(matchingParams, leader, metrics),
          marketScore: await this.calculateMarketScore(matchingParams, leader, metrics),
          frequencyScore: await this.calculateFrequencyScore(matchingParams, leader, metrics),
        };

        const compatibilityScore =
          weights.riskWeight * scores.riskScore +
          weights.styleWeight * scores.styleScore +
          weights.marketWeight * scores.marketScore +
          weights.frequencyWeight * scores.frequencyScore;

        return this.mapLeaderToSuggestion(leader, compatibilityScore, scores);
      })
    );

    // Sort by compatibility score and return top 5 matches
    return (await Promise.all(suggestions))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 5);
  }
}
