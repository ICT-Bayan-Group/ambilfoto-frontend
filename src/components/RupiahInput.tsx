import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface RupiahInputProps {
  id?: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  step?: number;
  hint?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Input harga otomatis format Rupiah saat diketik.
 * Contoh: user ketik "50000" → tampil "Rp 50.000"
 * onChange selalu mengembalikan angka murni (number).
 */
const RupiahInput = ({
  id,
  label,
  value,
  onChange,
  placeholder = "0",
  min = 0,
  step = 1000,
  hint,
  className,
  disabled = false,
}: RupiahInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format tampilan saat tidak fokus: "Rp 50.000"
  const displayValue = isFocused
    ? value === 0 ? "" : String(value)
    : value === 0 ? "" : `Rp ${value.toLocaleString("id-ID")}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hapus semua karakter non-digit
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const numeric = parseInt(raw, 10) || 0;
    onChange(numeric);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Pindahkan kursor ke akhir setelah fokus
    setTimeout(() => {
      if (inputRef.current) {
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Snap ke kelipatan step terdekat saat blur (misal kelipatan 1000)
    if (step > 1 && value > 0) {
      const snapped = Math.round(value / step) * step;
      onChange(snapped);
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        {/* Prefix "Rp" saat fokus */}
        {isFocused && value > 0 && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none select-none">
            Rp
          </span>
        )}
        <Input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? placeholder : `Rp ${parseInt(placeholder || "0").toLocaleString("id-ID")}`}
          disabled={disabled}
          className={cn(
            "transition-all",
            isFocused && value > 0 && "pl-9"
          )}
        />
      </div>

      {/* Hint */}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {/* Preview format saat fokus dan ada nilai */}
      {isFocused && value > 0 && (
        <p className="text-xs text-blue-600 font-medium">
          = Rp {value.toLocaleString("id-ID")}
        </p>
      )}

      {/* Label gratis */}
      {!isFocused && value === 0 && (
        <p className="text-xs text-green-600 font-medium">✓ Gratis (download bebas)</p>
      )}
    </div>
  );
};

export default RupiahInput;