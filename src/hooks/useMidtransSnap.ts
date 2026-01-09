import { useEffect, useCallback, useState } from 'react';

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: SnapOptions) => void;
      hide: () => void;
    };
  }
}

interface SnapOptions {
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
}

export interface SnapResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
  pdf_url?: string;
  finish_redirect_url?: string;
}

const MIDTRANS_SNAP_URL = import.meta.env.VITE_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js';
const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '';

export const useMidtransSnap = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if script already loaded
    if (window.snap) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src*="midtrans"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      return;
    }

    // Load Midtrans Snap script
    const script = document.createElement('script');
    script.src = MIDTRANS_SNAP_URL;
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    script.async = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load Midtrans Snap');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup is optional as we want to keep the script loaded
    };
  }, []);

  const pay = useCallback((token: string, options?: SnapOptions): Promise<SnapResult> => {
    return new Promise((resolve, reject) => {
      if (!window.snap) {
        reject(new Error('Midtrans Snap not loaded'));
        return;
      }

      setIsLoading(true);

      window.snap.pay(token, {
        onSuccess: (result) => {
          setIsLoading(false);
          options?.onSuccess?.(result);
          resolve(result);
        },
        onPending: (result) => {
          setIsLoading(false);
          options?.onPending?.(result);
          resolve(result);
        },
        onError: (result) => {
          setIsLoading(false);
          options?.onError?.(result);
          reject(result);
        },
        onClose: () => {
          setIsLoading(false);
          options?.onClose?.();
        },
      });
    });
  }, []);

  const hide = useCallback(() => {
    if (window.snap) {
      window.snap.hide();
    }
  }, []);

  return {
    isLoaded,
    isLoading,
    pay,
    hide,
  };
};
