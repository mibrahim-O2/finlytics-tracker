import { ICON_MAP, ICON_NAMES } from '../lib/constants';

/** Grid of selectable category icons. */
export default function IconPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {ICON_NAMES.map((name) => {
        const Icon = ICON_MAP[name];
        const active = value === name;
        return (
          <button
            key={name}
            type="button"
            aria-label={name}
            aria-pressed={active}
            onClick={() => onChange(name)}
            className={`flex aspect-square items-center justify-center rounded-lg border transition-colors ${
              active
                ? 'border-accent-green bg-accent-green/15 text-accent-green'
                : 'border-accent-teal/20 text-text-primary/60 hover:text-text-primary'
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
