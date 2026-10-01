import type {ButtonHTMLAttributes,ReactNode} from 'react';
import {cn} from '@/lib/utils';

type Props=ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'secondary'|'ghost';children:ReactNode};
export function Button({variant='primary',className,children,...props}:Props){
  return <button className={cn('inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-50',variant==='primary'&&'bg-aurum text-obsidian hover:bg-champagne hover:-translate-y-0.5',variant==='secondary'&&'border border-aurum/50 text-ivory hover:bg-aurum/10',variant==='ghost'&&'text-mist hover:text-ivory',className)} {...props}>{children}</button>;
}
