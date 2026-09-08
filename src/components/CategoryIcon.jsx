import { ICON_MAP, DEFAULT_ICON } from '../lib/constants';

/** Renders a Lucide icon by its stored name, falling back to Tag. */
export default function CategoryIcon({ name, className = 'h-4 w-4' }) {
  const Icon = ICON_MAP[name] || ICON_MAP[DEFAULT_ICON];
  return <Icon className={className} />;
}
