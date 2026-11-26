import { useEffect, useId, useRef, useState } from "react";
import { DEFAULT_RATES, TIER_LABEL, TIER_ORDER, readRate, type TierRates } from "./model/rates";

export function RateSettings({
  rates,
  onChange,
}: {
  rates: TierRates;
  onChange: (rates: TierRates) => void;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="gear"
        aria-label="Tier rates"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <GearIcon />
      </button>
      <dialog
        ref={dialogRef}
        className="rate-dialog"
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(false);
        }}
      >
        <p className="eyebrow">Classic rates</p>
        <h2 id={titleId}>Tier 1, Tier 2, and Tier 3.</h2>
        <p>
          Set the classic rate for each tier, in kroner per hour. The pods and
          the comparison use these rates. A quote is separate.
        </p>
        <div className="fields">
          {TIER_ORDER.map((level) => (
            <label key={level}>
              {TIER_LABEL[level]}, kr / h
              <input
                type="number"
                min={0}
                step={1}
                value={rates[level]}
                onChange={(event) =>
                  onChange({ ...rates, [level]: readRate(Number(event.target.value)) })
                }
              />
            </label>
          ))}
        </div>
        <p className="sheet-actions">
          <button type="button" className="pill" onClick={() => onChange({ ...DEFAULT_RATES })}>
            Opening rates
          </button>
          <button type="button" className="pill" onClick={() => setOpen(false)}>
            Done
          </button>
        </p>
      </dialog>
    </>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
