export function WorkspaceSwitcher({ options, value, onChange }: {
  options: readonly { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  if (options.length === 0) return null;
  return <nav className="workspace-switcher" aria-label="Công cụ trong màn hình hiện tại">
    {options.map((option) => <button key={option.id} type="button"
      aria-pressed={value === option.id} onClick={() => onChange(option.id)}>
      {option.label}
    </button>)}
  </nav>;
}
