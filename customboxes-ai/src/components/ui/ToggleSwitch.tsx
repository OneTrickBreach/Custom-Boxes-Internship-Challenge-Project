'use client';

/**
 * A robust toggle switch rendered entirely with inline styles so it looks
 * correct regardless of Tailwind class resolution order / arbitrary-value
 * issues. 36×20 track with a 16×16 thumb that slides.
 */
export function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 36,
        height: 20,
        borderRadius: 9999,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked ? 'var(--ink-black)' : 'var(--border-strong)',
        transition: 'background-color 140ms ease',
        opacity: disabled ? 0.5 : 1,
        padding: 0,
        flex: '0 0 auto',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transform: `translateX(${checked ? 16 : 0}px)`,
          transition: 'transform 140ms ease',
        }}
      />
    </button>
  );
}
