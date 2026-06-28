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

export function formatCurrency(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch {
    return `$${Math.round(amount || 0)}`;
  }
}
