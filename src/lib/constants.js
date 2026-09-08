import {
  Tag,
  Plane,
  ShoppingBag,
  Users,
  HeartHandshake,
  UtensilsCrossed,
  PartyPopper,
  ReceiptText,
  Home,
  Car,
  Bus,
  Fuel,
  Gift,
  GraduationCap,
  Stethoscope,
  Dumbbell,
  Coffee,
  Shirt,
  Smartphone,
  Wifi,
  Zap,
  PiggyBank,
  Wallet,
  Briefcase,
  Landmark,
  BookOpen,
  Music,
  Film,
  Plug,
  Heart,
} from 'lucide-react';

/**
 * Curated icon set for categories. Keys are stored in categories.icon.
 * Kept as an explicit map (not `import *`) to keep the bundle lean.
 */
export const ICON_MAP = {
  Tag,
  Plane,
  ShoppingBag,
  Users,
  HeartHandshake,
  UtensilsCrossed,
  PartyPopper,
  ReceiptText,
  Home,
  Car,
  Bus,
  Fuel,
  Gift,
  GraduationCap,
  Stethoscope,
  Dumbbell,
  Coffee,
  Shirt,
  Smartphone,
  Wifi,
  Zap,
  PiggyBank,
  Wallet,
  Briefcase,
  Landmark,
  BookOpen,
  Music,
  Film,
  Plug,
  Heart,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

export const DEFAULT_ICON = 'Tag';

/**
 * Default categories created on first run (SPEC §3). Wording is deliberately
 * neutral and respectful.
 */
export const DEFAULT_CATEGORIES = [
  { name: 'Travel', icon: 'Plane' },
  { name: 'Shopping', icon: 'ShoppingBag' },
  { name: 'Family & Relatives', icon: 'Users' },
  { name: 'Friends & Social', icon: 'HeartHandshake' },
  { name: 'Hoteling', icon: 'UtensilsCrossed' },
  { name: 'Party & Outings', icon: 'PartyPopper' },
  { name: 'Bills & Utilities', icon: 'ReceiptText' },
  { name: 'Others', icon: 'Tag' },
];

export const UNCATEGORIZED = {
  id: null,
  name: 'Uncategorized',
  icon: 'Tag',
};
