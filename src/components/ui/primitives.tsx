import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertTriangle, CheckCircle2, Info, Sprout, X, XCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { OrderStatus } from '@/src/types';

/* ── Button (shadcn-style CVA) ── */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#166534] focus-visible:outline-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-[#166534] text-white hover:bg-[#14532D] active:bg-[#0F4223]',
        secondary: 'bg-[#EEF4EB] text-[#166534] hover:bg-[#DFECDA]',
        outline: 'border border-[#D5DFD0] bg-white text-[#1F2937] hover:bg-[#F3F7F0]',
        ghost: 'text-[#374151] hover:bg-[#EEF4EB] hover:text-[#166534]',
        accent: 'bg-[#EAB308] text-[#1F2937] hover:bg-[#CA8A04] hover:text-white',
        danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
      },
      size: {
        sm: 'h-9 px-3.5 text-xs',
        md: 'h-10 px-5 text-sm',
        lg: 'h-11 px-6 text-sm font-semibold',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';

/* ── Input & Textarea ── */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full h-10 rounded-lg border border-[#D5DFD0] bg-white px-3.5 text-sm text-[#1F2937] placeholder:text-[#7A877D] transition-colors focus:border-[#166534] focus:outline-none disabled:bg-[#F3F6F1] disabled:cursor-not-allowed',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-lg border border-[#D5DFD0] bg-white px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#7A877D] transition-colors focus:border-[#166534] focus:outline-none',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const SelectField = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'w-full h-10 rounded-lg border border-[#D5DFD0] bg-white px-3 text-sm text-[#1F2937] transition-colors focus:border-[#166534] focus:outline-none cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </select>
));
SelectField.displayName = 'SelectField';

/* ── Card (Single-elevation crisp surface with hairline border) ── */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-xl border border-[#E2E8DF] bg-white', className)}>
      {children}
    </div>
  );
}

/* ── Prototype Transparency Disclaimer Notice (No thick left accent borders!) ── */
export function DisclaimerNotice({
  text,
  tone = 'neutral',
  className,
}: {
  text: string;
  tone?: 'neutral' | 'warning';
  className?: string;
}) {
  return (
    <div
      role="note"
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-4 py-3 text-xs leading-relaxed',
        tone === 'warning'
          ? 'border-[#F3DF99] bg-[#FEFCE8] text-[#713F12]'
          : 'border-[#DDE6D8] bg-[#F4F8F2] text-[#3F4F44]',
        className
      )}
    >
      {tone === 'warning' ? (
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[#CA8A04]" />
      ) : (
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-[#166534]" />
      )}
      <span>{text}</span>
    </div>
  );
}

/* ── Order Status Indicator (Clean semantic text + icon, zero pill clutter) ── */
export function OrderStatusLabel({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, { text: string; icon: React.ReactNode }> = {
    Pending: { text: 'text-[#A16207]', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    Accepted: { text: 'text-[#166534]', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    Preparing: { text: 'text-[#1D4ED8]', icon: <Info className="h-3.5 w-3.5" /> },
    'Ready for Pickup': { text: 'text-[#15803D]', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    'Out for Delivery': { text: 'text-[#0F766E]', icon: <Info className="h-3.5 w-3.5" /> },
    Delivered: { text: 'text-[#166534]', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    Cancelled: { text: 'text-[#DC2626]', icon: <XCircle className="h-3.5 w-3.5" /> },
  };
  const cfg = styles[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap', cfg.text)}>
      {cfg.icon}
      {status}
    </span>
  );
}

/* ── Resilient Image with Styled Fallback ── */
export function SafeImage({
  src,
  alt,
  className,
  fallbackLabel,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-gradient-to-br from-[#ECF4E8] to-[#DCE9D6] text-[#166534] p-4 text-center',
          className
        )}
      >
        <Sprout className="h-8 w-8 mb-2 opacity-75" />
        <span className="text-xs font-medium text-[#2F4636] line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

/* ── Empty State ── */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D1DCCB] bg-white px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF4EB] text-[#166534]">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[#1F2937]">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-[#526058]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ── Modal Dialog (Radix UI Dialog) ── */
export function ModalDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#111A14]/45 backdrop-blur-[2px]" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#E2E8DF] bg-white p-6 shadow-xl max-h-[88vh] overflow-y-auto',
            maxWidth
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-lg font-semibold text-[#1F2937]">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-[#526058]">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close dialog"
                className="rounded-lg p-1.5 text-[#526058] hover:bg-[#F1F5EE] hover:text-[#1F2937] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="mt-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ── Confirmation Dialog ── */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  return (
    <ModalDialog open={open} onOpenChange={onOpenChange} title={title} description={description} maxWidth="max-w-md">
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          variant={destructive ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </ModalDialog>
  );
}
