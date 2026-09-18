import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';

/**
 * Кнопки. Высота 48 px у основных действий — палец в рабочей перчатке
 * не попадает в 36-пиксельную мишень, а заказывают именно с объекта.
 */

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'onDark';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-[10px] ' +
  'transition-[transform,background-color,border-color,color] duration-150 ease-out-quart ' +
  'active:translate-y-px disabled:opacity-55 disabled:pointer-events-none select-none text-center';

const variants: Record<Variant, string> = {
  primary: 'bg-hv text-hv-ink hover:bg-hv-deep shadow-e1',
  dark: 'bg-graphite-950 text-white hover:bg-graphite-800',
  outline: 'border border-line-strong bg-surface text-ink hover:border-graphite-950',
  ghost: 'text-ink hover:bg-surface-sunk',
  onDark: 'border border-white/25 text-white hover:bg-white/10',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-11 px-4 text-[14px]',
  lg: 'h-12 px-6 text-[15px] md:h-[52px]',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = ''): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <a className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </a>
  );
}
