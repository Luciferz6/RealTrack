interface ToggleProps {
  checked?: boolean;
}

export default function Toggle({ checked = false }: ToggleProps) {
  return <div className={`toggle ${checked ? 'active' : ''}`} />;
}

