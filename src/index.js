import {
  audienceBasePricing,
  audienceExtraPricng,
  audienceStaticExtraPricing,
  baseAudienceCount,
  genreTypes,
  CREDITS_AUDIENCE_COUNT,
  COMEDY_CREDITS_CF,
} from './constants';

import invoices from './invoices.json';
import playsInfo from './plays.json';

const countCredits = (audience, comedyCount) => {
  const credits = Math.max(audience - CREDITS_AUDIENCE_COUNT, 0);
  if (comedyCount % 10 === 0 && comedyCount !== 0) {
    return credits + Math.floor(audience / COMEDY_CREDITS_CF);
  }

  return credits;
};

const countPerformancesAmount = (performances, plays) => {
  let comedyCount = 0;
  const countPerfomanceAmount = ({ playId, audience }) => {
    const { type, name } = plays[playId];

    switch (type) {
      case genreTypes.comedy:
        comedyCount += 1;
        if (audience > baseAudienceCount.comedy) {
          const extraAudience = audience - baseAudienceCount.comedy;
          const amount =
            audienceBasePricing.comedy +
            audienceStaticExtraPricing.comedy +
            extraAudience * audienceExtraPricng.comedy;

          return {
            name,
            amount,
            audience,
            credits: countCredits(audience, comedyCount),
          };
        }

        return {
          name,
          amount: audienceBasePricing.comedy,
          audience,
          credits: countCredits(audience, comedyCount),
        };
      case genreTypes.tragedy:
        if (audience > baseAudienceCount.tragedy) {
          const extraAudience = audience - baseAudienceCount.tragedy;
          const amount =
            audienceBasePricing.tragedy +
            audienceStaticExtraPricing.tragedy +
            extraAudience * audienceExtraPricng.tragedy;

          return {
            name,
            amount,
            audience,
            credits: countCredits(audience, comedyCount),
          };
        }

        return {
          name,
          amount: audienceBasePricing.tragedy,
          audience,
          credits: countCredits(audience, comedyCount),
        };
      default:
        throw new Error(`неизвестный тип: ${type}`);
    }
  };
  return performances.map(countPerfomanceAmount);
};

const getPerformancesOutput = (performancesInfo, format) => {
  return performancesInfo.reduce((output, { name, amount, audience }) => {
    return `${output}${name}: ${format(amount)} ${audience} мест\n`;
  }, ``);
};

const countTotalAmount = (performancesInfo) => {
  return performancesInfo.reduce(
    (totalAmount, { amount }) => totalAmount + amount,
    0
  );
};

const countTotalCreditsAmount = (performancesInfo) => {
  return performancesInfo.reduce(
    (totalCredits, { credits }) => totalCredits + credits,
    0
  );
};

const format = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount);
};

const statement = (invoice, plays) => {
  const { customer, performances } = invoice;

  const performancesInfo = countPerformancesAmount(performances, plays);
  const totalAmount = countTotalAmount(performancesInfo);
  const totalCredits = countTotalCreditsAmount(performancesInfo);

  const title = `Счет для ${customer}\n`;
  const performancesOutput = getPerformancesOutput(performancesInfo, format);
  const totalAmountOutput = `Итого с вас ${format(totalAmount)}\n`;
  const totalCreditsOutput = `Вы заработали ${totalCredits} бонусов\n`;

  return `${title}${performancesOutput}${totalAmountOutput}${totalCreditsOutput}`;
};

statement(invoices[0], playsInfo);
