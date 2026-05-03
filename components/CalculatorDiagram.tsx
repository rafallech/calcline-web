import type { ReactNode } from "react";

type DiagramFrameProps = {
  title: string;
  children: ReactNode;
};

function DiagramFrame({ title, children }: DiagramFrameProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        {children}
      </div>
    </section>
  );
}

export function RectangularWaveguideDiagram() {
  return (
    <DiagramFrame title="Waveguide sketch">
      <svg
        viewBox="0 0 720 260"
        role="img"
        aria-labelledby="waveguide-title"
        className="h-auto w-full"
      >
        <title id="waveguide-title">Rectangular waveguide cross section</title>
        <rect x="180" y="60" width="360" height="140" fill="#e0f2fe" stroke="#0f172a" strokeWidth="4" />
        <rect x="225" y="92" width="270" height="76" fill="#f8fafc" stroke="#334155" strokeWidth="3" />
        <line x1="225" y1="205" x2="495" y2="205" stroke="#0891b2" strokeWidth="3" />
        <line x1="225" y1="195" x2="225" y2="215" stroke="#0891b2" strokeWidth="3" />
        <line x1="495" y1="195" x2="495" y2="215" stroke="#0891b2" strokeWidth="3" />
        <text x="360" y="238" textAnchor="middle" className="fill-slate-700 text-[24px] font-semibold">a</text>
        <line x1="525" y1="92" x2="525" y2="168" stroke="#0891b2" strokeWidth="3" />
        <line x1="515" y1="92" x2="535" y2="92" stroke="#0891b2" strokeWidth="3" />
        <line x1="515" y1="168" x2="535" y2="168" stroke="#0891b2" strokeWidth="3" />
        <text x="560" y="138" className="fill-slate-700 text-[24px] font-semibold">b</text>
        <text x="360" y="45" textAnchor="middle" className="fill-slate-700 text-[22px]">TE/TM modes</text>
      </svg>
    </DiagramFrame>
  );
}

export function MicrostripDiagram() {
  return (
    <DiagramFrame title="Microstrip sketch">
      <svg
        viewBox="0 0 720 280"
        role="img"
        aria-labelledby="microstrip-title"
        className="h-auto w-full"
      >
        <title id="microstrip-title">Microstrip line cross section</title>
        <rect x="130" y="80" width="460" height="95" fill="#dbeafe" stroke="#334155" strokeWidth="3" />
        <rect x="250" y="42" width="220" height="34" rx="4" fill="#f59e0b" stroke="#92400e" strokeWidth="3" />
        <rect x="110" y="180" width="500" height="24" rx="4" fill="#64748b" />
        <line x1="250" y1="34" x2="470" y2="34" stroke="#0891b2" strokeWidth="3" />
        <line x1="250" y1="24" x2="250" y2="44" stroke="#0891b2" strokeWidth="3" />
        <line x1="470" y1="24" x2="470" y2="44" stroke="#0891b2" strokeWidth="3" />
        <text x="360" y="24" textAnchor="middle" className="fill-slate-700 text-[22px] font-semibold">W</text>
        <line x1="630" y1="80" x2="630" y2="175" stroke="#0891b2" strokeWidth="3" />
        <line x1="620" y1="80" x2="640" y2="80" stroke="#0891b2" strokeWidth="3" />
        <line x1="620" y1="175" x2="640" y2="175" stroke="#0891b2" strokeWidth="3" />
        <text x="655" y="136" className="fill-slate-700 text-[22px] font-semibold">H</text>
        <text x="360" y="135" textAnchor="middle" className="fill-slate-700 text-[22px]">eps_r</text>
        <text x="360" y="235" textAnchor="middle" className="fill-slate-700 text-[22px]">ground plane</text>
      </svg>
    </DiagramFrame>
  );
}

export function PatchAntennaDiagram() {
  return (
    <DiagramFrame title="Patch antenna sketch">
      <svg
        viewBox="0 0 720 320"
        role="img"
        aria-labelledby="patch-antenna-title"
        className="h-auto w-full"
      >
        <title id="patch-antenna-title">
          Rectangular microstrip patch antenna dimensions
        </title>
        <rect
          x="180"
          y="55"
          width="300"
          height="150"
          rx="8"
          fill="#f59e0b"
          stroke="#92400e"
          strokeWidth="4"
        />
        <rect
          x="130"
          y="215"
          width="420"
          height="45"
          fill="#dbeafe"
          stroke="#334155"
          strokeWidth="3"
        />
        <rect x="110" y="270" width="460" height="24" rx="4" fill="#64748b" />
        <line
          x1="180"
          y1="38"
          x2="480"
          y2="38"
          stroke="#0891b2"
          strokeWidth="3"
        />
        <line
          x1="180"
          y1="28"
          x2="180"
          y2="48"
          stroke="#0891b2"
          strokeWidth="3"
        />
        <line
          x1="480"
          y1="28"
          x2="480"
          y2="48"
          stroke="#0891b2"
          strokeWidth="3"
        />
        <text
          x="330"
          y="28"
          textAnchor="middle"
          className="fill-slate-700 text-[22px] font-semibold"
        >
          W
        </text>
        <line
          x1="505"
          y1="55"
          x2="505"
          y2="205"
          stroke="#0891b2"
          strokeWidth="3"
        />
        <line
          x1="495"
          y1="55"
          x2="515"
          y2="55"
          stroke="#0891b2"
          strokeWidth="3"
        />
        <line
          x1="495"
          y1="205"
          x2="515"
          y2="205"
          stroke="#0891b2"
          strokeWidth="3"
        />
        <text x="528" y="137" className="fill-slate-700 text-[22px] font-semibold">
          L
        </text>
        <line
          x1="585"
          y1="215"
          x2="585"
          y2="260"
          stroke="#0891b2"
          strokeWidth="3"
        />
        <line
          x1="575"
          y1="215"
          x2="595"
          y2="215"
          stroke="#0891b2"
          strokeWidth="3"
        />
        <line
          x1="575"
          y1="260"
          x2="595"
          y2="260"
          stroke="#0891b2"
          strokeWidth="3"
        />
        <text x="608" y="244" className="fill-slate-700 text-[22px] font-semibold">
          h
        </text>
        <text x="340" y="243" textAnchor="middle" className="fill-slate-700 text-[20px]">
          substrate eps_r
        </text>
        <text x="340" y="308" textAnchor="middle" className="fill-slate-700 text-[20px]">
          ground plane
        </text>
      </svg>
    </DiagramFrame>
  );
}

type SingleStubDiagramProps = {
  configuration: "openSeries" | "shortSeries" | "openShunt" | "shortShunt";
};

export function SingleStubDiagram({ configuration }: SingleStubDiagramProps) {
  const isSeries = configuration === "openSeries" || configuration === "shortSeries";
  const isOpen = configuration === "openSeries" || configuration === "openShunt";

  return (
    <DiagramFrame title="Single stub sketch">
      <svg
        viewBox="0 0 720 300"
        role="img"
        aria-labelledby="single-stub-title"
        className="h-auto w-full"
      >
        <title id="single-stub-title">Single stub matching circuit</title>
        <line x1="70" y1="110" x2="650" y2="110" stroke="#0f172a" strokeWidth="5" />
        <text x="90" y="85" className="fill-slate-700 text-[21px]">Z0</text>
        <text x="590" y="85" className="fill-slate-700 text-[21px]">ZL</text>
        <line x1="250" y1="140" x2="390" y2="140" stroke="#0891b2" strokeWidth="3" />
        <line x1="250" y1="130" x2="250" y2="150" stroke="#0891b2" strokeWidth="3" />
        <line x1="390" y1="130" x2="390" y2="150" stroke="#0891b2" strokeWidth="3" />
        <text x="320" y="170" textAnchor="middle" className="fill-slate-700 text-[21px]">d</text>
        {isSeries ? (
          <>
            <rect x="345" y="83" width="46" height="54" fill="#f8fafc" stroke="#0f172a" strokeWidth="4" />
            <line x1="368" y1="137" x2="368" y2="245" stroke="#0f172a" strokeWidth="5" />
          </>
        ) : (
          <line x1="368" y1="110" x2="368" y2="245" stroke="#0f172a" strokeWidth="5" />
        )}
        <line x1="398" y1="185" x2="398" y2="245" stroke="#0891b2" strokeWidth="3" />
        <line x1="388" y1="185" x2="408" y2="185" stroke="#0891b2" strokeWidth="3" />
        <line x1="388" y1="245" x2="408" y2="245" stroke="#0891b2" strokeWidth="3" />
        <text x="425" y="222" className="fill-slate-700 text-[21px]">l</text>
        {isOpen ? (
          <line x1="338" y1="245" x2="398" y2="245" stroke="#0f172a" strokeWidth="5" />
        ) : (
          <>
            <line x1="330" y1="245" x2="406" y2="245" stroke="#0f172a" strokeWidth="5" />
            <line x1="340" y1="260" x2="396" y2="260" stroke="#0f172a" strokeWidth="4" />
            <line x1="350" y1="274" x2="386" y2="274" stroke="#0f172a" strokeWidth="3" />
          </>
        )}
        <text x="368" y="285" textAnchor="middle" className="fill-slate-700 text-[21px]">
          {isOpen ? "open stub" : "short stub"}
        </text>
      </svg>
    </DiagramFrame>
  );
}

export function LMatchDiagram() {
  return (
    <DiagramFrame title="L-section sketch">
      <svg
        viewBox="0 0 720 300"
        role="img"
        aria-labelledby="l-match-title"
        className="h-auto w-full"
      >
        <title id="l-match-title">L-section matching network</title>
        <line x1="80" y1="130" x2="630" y2="130" stroke="#0f172a" strokeWidth="5" />
        <text x="92" y="100" className="fill-slate-700 text-[21px]">Z0</text>
        <text x="585" y="100" className="fill-slate-700 text-[21px]">ZL</text>
        <path d="M250 130 h22 m12 0 h22 m12 0 h22 m12 0 h22" fill="none" stroke="#0f172a" strokeWidth="5" />
        <text x="312" y="95" textAnchor="middle" className="fill-slate-700 text-[21px]">series X</text>
        <line x1="455" y1="130" x2="455" y2="238" stroke="#0f172a" strokeWidth="5" />
        <path d="M425 238 h60" stroke="#0f172a" strokeWidth="5" />
        <path d="M435 252 h40" stroke="#0f172a" strokeWidth="4" />
        <path d="M445 265 h20" stroke="#0f172a" strokeWidth="3" />
        <text x="505" y="198" className="fill-slate-700 text-[21px]">parallel B</text>
        <text x="312" y="176" textAnchor="middle" className="fill-slate-700 text-[20px]">Ls or Cs</text>
        <text x="505" y="226" className="fill-slate-700 text-[20px]">Lp or Cp</text>
      </svg>
    </DiagramFrame>
  );
}
