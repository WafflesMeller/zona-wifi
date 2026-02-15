import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function QrAccordion({ alt = "QR" }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      {/* BOTÓN TOGGLE */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          w-full
          flex items-center justify-center gap-2
          text-primary font-semibold text-sm
          py-2
          hover:opacity-80
          transition-all bg-white/5 rounded-full
          border border-white/10 mb-2 py-3
        "
      >
        {open ? "Ocultar QR" : "Mostrar QR"}

        <ChevronDown
          className={`
            w-5 h-5
            transition-transform duration-300
            ${open ? "rotate-180" : "rotate-0"}
          `}
        />
      </button>

      {/* ACORDEÓN */}
      <div
        className={`
          overflow-hidden
          transition-all duration-600 ease-[cubic-bezier(0.20,1,0.3,1)]
          ${open ? "max-h-125 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="">
          <img
            src="/QR-YENDER.jpeg"
            alt={alt}
            className="
              w-full mx-auto
              rounded-2xl
              border border-white/10
              shadow-xl
              animate-in fade-in zoom-in-95 duration-600
            "
          />
        </div>
      </div>
    </div>
  );
}
