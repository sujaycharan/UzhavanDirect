import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FulfilmentOption } from '@/src/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Simulated delivery fee calculation rule:
 * - Farmer Pickup: ₹0
 * - Local Delivery: Free above ₹1,000, ₹40 for orders <= ₹499, ₹60 for orders ₹500–₹999
 *   (wholesale bulk > 50 units adds ₹120 logistics handling if local delivery and < ₹2,500)
 */
export function calculateDeliveryCharge(
  subtotal: number,
  fulfilment: FulfilmentOption,
  isWholesaleOrder: boolean
): number {
  if (fulfilment === 'farmer_pickup') return 0;
  if (isWholesaleOrder) {
    return subtotal >= 2500 ? 0 : 120;
  }
  if (subtotal >= 1000) return 0;
  if (subtotal >= 500) return 40;
  return 60;
}

export function generateDemoOrderId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `UZH-2026-${num}`;
}

export function compressImageFile(file: File, maxWidth = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
