const numberFormat = new Intl.NumberFormat("id-ID");

type RupiahInputProps = {
  id: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  ref?: React.Ref<HTMLInputElement>;
  maxDigits?: number;
  invalid?: boolean;
  describedBy?: string;
};

export function RupiahInput({
  id,
  value,
  onChange,
  onBlur,
  ref,
  maxDigits = 9,
  invalid,
  describedBy,
}: RupiahInputProps) {
  return (
    <div className="flex h-11 items-stretch overflow-hidden rounded-md border border-input bg-card shadow-xs focus-within:border-sage-600 focus-within:ring-3 focus-within:ring-sage-100">
      <span className="flex items-center border-r border-input bg-neutral-100 px-3 text-base text-neutral-700">Rp</span>
      <input
        id={id}
        ref={ref}
        inputMode="numeric"
        value={Number.isFinite(value) ? numberFormat.format(value) : ""}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, maxDigits);
          onChange(digits === "" ? Number.NaN : Number(digits));
        }}
        onBlur={onBlur}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className="min-w-0 flex-1 bg-transparent px-3.5 text-base outline-none"
      />
    </div>
  );
}
