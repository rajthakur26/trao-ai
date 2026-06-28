/**
 * Deterministic fallback "agent". Used when GROQ_API_KEY is not configured, or
 * when a live LLM call fails. It keeps the entire app functional (and the demo
 * reproducible) without any external dependency. The output deliberately mirrors
 * the real agent's JSON shape so downstream code is identical.
 */

const BUDGET_MULTIPLIER = { Low: 0.6, Medium: 1, High: 1.8 };

const ACTIVITY_BANK = {
  Food: ['Street food crawl', 'Local cooking class', 'Famous food market', 'Rooftop dinner'],
  Culture: ['Historic old town walk', 'National museum visit', 'Temple / cathedral tour', 'Local art gallery'],
  Adventure: ['Sunrise hike', 'Kayaking trip', 'Zip-line park', 'Day trek to viewpoint'],
  Shopping: ['Artisan craft district', 'Flagship shopping street', 'Vintage flea market', 'Local boutiques'],
  Nature: ['Botanical gardens', 'Lakeside picnic', 'Scenic park stroll', 'Wildlife sanctuary'],
  Nightlife: ['Live music venue', 'Craft cocktail bar', 'Night market', 'Riverside promenade'],
  General: ['City landmark visit', 'Guided walking tour', 'Scenic viewpoint', 'Relaxed cafe break'],
};

const TIMES = ['Morning', 'Late morning', 'Afternoon', 'Evening'];

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

export function mockPlan({ destination, days, budgetType, interests }) {
  const cats = interests?.length ? interests : ['General', 'Culture', 'Food'];
  const itinerary = [];

  for (let d = 1; d <= days; d += 1) {
    const activities = [];
    const count = 3 + (d % 2); // 3 or 4 per day
    for (let i = 0; i < count; i += 1) {
      const cat = pick(cats, d * 7 + i);
      const bank = ACTIVITY_BANK[cat] || ACTIVITY_BANK.General;
      const name = pick(bank, d * 13 + i * 5);
      activities.push({
        name: `${name} in ${destination}`,
        description: `A ${budgetType.toLowerCase()}-budget ${cat.toLowerCase()} experience handpicked for day ${d}.`,
        time: pick(TIMES, i),
        category: cat,
      });
    }
    itinerary.push({ day: d, title: `Day ${d} · ${destination}`, activities });
  }

  const m = BUDGET_MULTIPLIER[budgetType] || 1;
  const budget = {
    currency: 'USD',
    flights: Math.round(400 * m),
    accommodation: Math.round(60 * m * days),
    food: Math.round(35 * m * days),
    activities: Math.round(30 * m * days),
    transport: Math.round(15 * m * days),
    total: 0,
    notes: `Estimated for one traveller at a ${budgetType} budget level (offline estimate).`,
  };
  budget.total =
    budget.flights + budget.accommodation + budget.food + budget.activities + budget.transport;

  const hotels = [
    {
      name: `${destination} City Hostel`,
      tier: 'Budget Friendly',
      pricePerNight: Math.round(35 * m),
      rating: 4.1,
      description: 'Clean, central, great for budget travellers.',
    },
    {
      name: `Grand ${destination} Hotel`,
      tier: 'Mid Range',
      pricePerNight: Math.round(90 * m),
      rating: 4.4,
      description: 'Comfortable 3-4 star stay near the main sights.',
    },
    {
      name: `The ${destination} Palace`,
      tier: 'Luxury',
      pricePerNight: Math.round(240 * m),
      rating: 4.8,
      description: 'Premium 5-star experience with top-tier amenities.',
    },
  ];

  return { itinerary, budget, hotels };
}

export function mockDay({ destination, budgetType, dayNumber, interests, instruction }) {
  const cats = interests?.length ? interests : ['General', 'Culture', 'Adventure'];
  const activities = [];
  const count = 4;
  for (let i = 0; i < count; i += 1) {
    const cat = pick(cats, dayNumber * 11 + i * 3);
    const bank = ACTIVITY_BANK[cat] || ACTIVITY_BANK.General;
    activities.push({
      name: `${pick(bank, dayNumber * 17 + i * 9)} in ${destination}`,
      description: `Refreshed for day ${dayNumber}${instruction ? ` (${instruction})` : ''}.`,
      time: pick(TIMES, i),
      category: cat,
    });
  }
  return { day: { day: dayNumber, title: `Day ${dayNumber} · ${destination}`, activities } };
}

export function mockConcierge({ message }) {
  return {
    reply: `(Offline mode) I couldn't reach the live agent, so I noted your request: "${message}". Add a Groq API key to enable live edits.`,
    operations: [{ type: 'none' }],
  };
}
