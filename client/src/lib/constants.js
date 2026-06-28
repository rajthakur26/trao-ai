import {
  UtensilsCrossed,
  Landmark,
  Mountain,
  ShoppingBag,
  Trees,
  Moon,
  Sparkles,
  Camera,
  Waves,
  Music,
} from 'lucide-react';

export const INTEREST_OPTIONS = [
  'Food',
  'Culture',
  'Adventure',
  'Shopping',
  'Nature',
  'Nightlife',
  'Photography',
  'Beaches',
  'Music',
];

export const BUDGET_OPTIONS = [
  { value: 'Low', label: 'Low', hint: 'Hostels · street food · public transit' },
  { value: 'Medium', label: 'Medium', hint: '3-star hotels · mid-range dining' },
  { value: 'High', label: 'High', hint: '4-5 star hotels · premium experiences' },
];

const CATEGORY_ICONS = {
  Food: UtensilsCrossed,
  Culture: Landmark,
  Adventure: Mountain,
  Shopping: ShoppingBag,
  Nature: Trees,
  Nightlife: Moon,
  Photography: Camera,
  Beaches: Waves,
  Music,
  General: Sparkles,
};

export function categoryIcon(category) {
  return CATEGORY_ICONS[category] || Sparkles;
}

// Use the Indian locale for INR so amounts group as lakhs (e.g. ₹1,20,000).
const LOCALE_BY_CURRENCY = { INR: 'en-IN' };

export function formatCurrency(amount, currency = 'INR') {
  const code = currency || 'INR';
  try {
    return new Intl.NumberFormat(LOCALE_BY_CURRENCY[code] || 'en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch {
    return `${Math.round(amount || 0)} ${code}`;
  }
}
