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

export function CoplanarWaveguideDiagram() {
  return (
    <DiagramFrame title="CPW cross-section sketch">
      <svg
        viewBox="0 0 720 280"
        role="img"
        aria-labelledby="coplanar-waveguide-title"
        className="h-auto w-full"
      >
        <title id="coplanar-waveguide-title">
          Coplanar waveguide cross section
        </title>
        <rect
          x="120"
          y="95"
          width="480"
          height="105"
          fill="#dbeafe"
          stroke="#334155"
          strokeWidth="3"
        />
        <rect x="120" y="64" width="190" height="28" rx="4" fill="#64748b" />
        <rect
          x="340"
          y="64"
          width="40"
          height="28"
          rx="4"
          fill="#f59e0b"
          stroke="#92400e"
          strokeWidth="3"
        />
        <rect x="410" y="64" width="190" height="28" rx="4" fill="#64748b" />
        <rect x="100" y="210" width="520" height="20" rx="4" fill="#e2e8f0" />
        <line x1="340" y1="42" x2="380" y2="42" stroke="#0891b2" strokeWidth="3" />
        <line x1="340" y1="32" x2="340" y2="52" stroke="#0891b2" strokeWidth="3" />
        <line x1="380" y1="32" x2="380" y2="52" stroke="#0891b2" strokeWidth="3" />
        <text
          x="360"
          y="30"
          textAnchor="middle"
          className="fill-slate-700 text-[20px] font-semibold"
        >
          W
        </text>
        <line x1="310" y1="52" x2="340" y2="52" stroke="#0891b2" strokeWidth="3" />
        <line x1="310" y1="44" x2="310" y2="60" stroke="#0891b2" strokeWidth="3" />
        <line x1="340" y1="44" x2="340" y2="60" stroke="#0891b2" strokeWidth="3" />
        <line x1="380" y1="52" x2="410" y2="52" stroke="#0891b2" strokeWidth="3" />
        <line x1="380" y1="44" x2="380" y2="60" stroke="#0891b2" strokeWidth="3" />
        <line x1="410" y1="44" x2="410" y2="60" stroke="#0891b2" strokeWidth="3" />
        <text
          x="325"
          y="34"
          textAnchor="middle"
          className="fill-slate-700 text-[18px] font-semibold"
        >
          S
        </text>
        <text
          x="395"
          y="34"
          textAnchor="middle"
          className="fill-slate-700 text-[18px] font-semibold"
        >
          S
        </text>
        <line x1="635" y1="95" x2="635" y2="200" stroke="#0891b2" strokeWidth="3" />
        <line x1="625" y1="95" x2="645" y2="95" stroke="#0891b2" strokeWidth="3" />
        <line x1="625" y1="200" x2="645" y2="200" stroke="#0891b2" strokeWidth="3" />
        <text x="658" y="153" className="fill-slate-700 text-[20px] font-semibold">
          h
        </text>
        <text x="360" y="154" textAnchor="middle" className="fill-slate-700 text-[20px]">
          substrate eps_r
        </text>
        <text x="210" y="58" textAnchor="middle" className="fill-slate-700 text-[18px]">
          ground
        </text>
        <text x="510" y="58" textAnchor="middle" className="fill-slate-700 text-[18px]">
          ground
        </text>
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

export function HornAntennaDiagram() {
  return (
    <DiagramFrame title="Horn antenna sketch">
      <svg
        viewBox="0 0 720 320"
        role="img"
        aria-labelledby="horn-antenna-title"
        className="h-auto w-full"
      >
        <title id="horn-antenna-title">
          Rectangular horn antenna aperture dimensions
        </title>
        <path
          d="M135 130 L440 55 L440 265 L135 190 Z"
          fill="#dbeafe"
          stroke="#334155"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M105 128 L135 130 L135 190 L105 192 Z"
          fill="#64748b"
          stroke="#334155"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <rect
          x="440"
          y="55"
          width="150"
          height="210"
          rx="8"
          fill="#f8fafc"
          stroke="#0891b2"
          strokeWidth="5"
        />
        <path
          d="M470 80 C540 95 560 225 470 240"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line x1="440" y1="35" x2="590" y2="35" stroke="#0891b2" strokeWidth="3" />
        <line x1="440" y1="25" x2="440" y2="45" stroke="#0891b2" strokeWidth="3" />
        <line x1="590" y1="25" x2="590" y2="45" stroke="#0891b2" strokeWidth="3" />
        <text
          x="515"
          y="24"
          textAnchor="middle"
          className="fill-slate-700 text-[22px] font-semibold"
        >
          W
        </text>
        <line x1="620" y1="55" x2="620" y2="265" stroke="#0891b2" strokeWidth="3" />
        <line x1="610" y1="55" x2="630" y2="55" stroke="#0891b2" strokeWidth="3" />
        <line x1="610" y1="265" x2="630" y2="265" stroke="#0891b2" strokeWidth="3" />
        <text x="638" y="168" className="fill-slate-700 text-[22px] font-semibold">
          H
        </text>
        <text x="105" y="112" className="fill-slate-700 text-[20px]">
          feed
        </text>
        <text
          x="515"
          y="298"
          textAnchor="middle"
          className="fill-slate-700 text-[20px]"
        >
          aperture area A = W H
        </text>
      </svg>
    </DiagramFrame>
  );
}

export function DipoleMonopoleDiagram() {
  return (
    <DiagramFrame title="Dipole and monopole sketch">
      <svg
        viewBox="0 0 720 320"
        role="img"
        aria-labelledby="dipole-monopole-title"
        className="h-auto w-full"
      >
        <title id="dipole-monopole-title">
          Half-wave dipole and quarter-wave monopole dimensions
        </title>
        <line
          x1="130"
          y1="110"
          x2="315"
          y2="110"
          stroke="#0891b2"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <line
          x1="405"
          y1="110"
          x2="590"
          y2="110"
          stroke="#0891b2"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="360" cy="110" r="12" fill="#f59e0b" stroke="#92400e" strokeWidth="3" />
        <line x1="315" y1="110" x2="348" y2="110" stroke="#0f172a" strokeWidth="5" />
        <line x1="372" y1="110" x2="405" y2="110" stroke="#0f172a" strokeWidth="5" />
        <text
          x="360"
          y="66"
          textAnchor="middle"
          className="fill-slate-700 text-[22px] font-semibold"
        >
          half-wave dipole
        </text>
        <line x1="130" y1="145" x2="590" y2="145" stroke="#0891b2" strokeWidth="3" />
        <line x1="130" y1="135" x2="130" y2="155" stroke="#0891b2" strokeWidth="3" />
        <line x1="590" y1="135" x2="590" y2="155" stroke="#0891b2" strokeWidth="3" />
        <text
          x="360"
          y="176"
          textAnchor="middle"
          className="fill-slate-700 text-[20px]"
        >
          total length = lambda corrected / 2
        </text>
        <line
          x1="360"
          y1="225"
          x2="360"
          y2="115"
          stroke="#0891b2"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="360" cy="225" r="10" fill="#f59e0b" stroke="#92400e" strokeWidth="3" />
        <line x1="250" y1="242" x2="470" y2="242" stroke="#64748b" strokeWidth="6" />
        <line x1="390" y1="225" x2="390" y2="115" stroke="#0891b2" strokeWidth="3" />
        <line x1="380" y1="225" x2="400" y2="225" stroke="#0891b2" strokeWidth="3" />
        <line x1="380" y1="115" x2="400" y2="115" stroke="#0891b2" strokeWidth="3" />
        <text x="410" y="178" className="fill-slate-700 text-[20px]">
          monopole = lambda corrected / 4
        </text>
        <text
          x="360"
          y="280"
          textAnchor="middle"
          className="fill-slate-700 text-[20px]"
        >
          ground plane or radials
        </text>
      </svg>
    </DiagramFrame>
  );
}

type AttenuatorDiagramProps = {
  topology: "pi" | "t";
};

export function AttenuatorDiagram({ topology }: AttenuatorDiagramProps) {
  return (
    <DiagramFrame title={topology === "pi" ? "Pi attenuator sketch" : "T attenuator sketch"}>
      <svg
        viewBox="0 0 720 280"
        role="img"
        aria-labelledby="attenuator-title"
        className="h-auto w-full"
      >
        <title id="attenuator-title">
          {topology === "pi" ? "Pi attenuator circuit" : "T attenuator circuit"}
        </title>
        <line x1="80" y1="120" x2="640" y2="120" stroke="#0f172a" strokeWidth="5" />
        <text x="88" y="92" className="fill-slate-700 text-[21px]">in</text>
        <text x="606" y="92" className="fill-slate-700 text-[21px]">out</text>
        {topology === "pi" ? (
          <>
            <Resistor x={308} y={120} label="Rseries" orientation="horizontal" />
            <line x1="190" y1="120" x2="190" y2="222" stroke="#0f172a" strokeWidth="5" />
            <Resistor x={190} y={164} label="Rshunt in" orientation="vertical" />
            <line x1="530" y1="120" x2="530" y2="222" stroke="#0f172a" strokeWidth="5" />
            <Resistor x={530} y={164} label="Rshunt out" orientation="vertical" />
          </>
        ) : (
          <>
            <Resistor x={225} y={120} label="Rseries in" orientation="horizontal" />
            <Resistor x={455} y={120} label="Rseries out" orientation="horizontal" />
            <line x1="360" y1="120" x2="360" y2="222" stroke="#0f172a" strokeWidth="5" />
            <Resistor x={360} y={164} label="Rshunt" orientation="vertical" />
          </>
        )}
        <line x1="150" y1="236" x2="570" y2="236" stroke="#64748b" strokeWidth="5" />
        <text x="360" y="263" textAnchor="middle" className="fill-slate-700 text-[21px]">ground</text>
      </svg>
    </DiagramFrame>
  );
}

export function WilkinsonDividerDiagram() {
  return (
    <DiagramFrame title="Wilkinson divider sketch">
      <svg
        viewBox="0 0 720 320"
        role="img"
        aria-labelledby="wilkinson-divider-title"
        className="h-auto w-full"
      >
        <title id="wilkinson-divider-title">
          Two-way Wilkinson power divider circuit
        </title>
        <line
          x1="90"
          y1="160"
          x2="230"
          y2="160"
          stroke="#0f172a"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M230 160 C300 160 330 75 430 75 L610 75"
          fill="none"
          stroke="#0891b2"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M230 160 C300 160 330 245 430 245 L610 245"
          fill="none"
          stroke="#0891b2"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="90" cy="160" r="10" fill="#0f172a" />
        <circle cx="610" cy="75" r="10" fill="#0f172a" />
        <circle cx="610" cy="245" r="10" fill="#0f172a" />
        <line
          x1="505"
          y1="75"
          x2="505"
          y2="112"
          stroke="#0f172a"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <Resistor x={505} y={160} label="Riso = 2 Z0" orientation="vertical" />
        <line
          x1="505"
          y1="208"
          x2="505"
          y2="245"
          stroke="#0f172a"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <text x="68" y="132" className="fill-slate-700 text-[21px]">
          port 1
        </text>
        <text x="575" y="48" className="fill-slate-700 text-[21px]">
          port 2
        </text>
        <text x="575" y="288" className="fill-slate-700 text-[21px]">
          port 3
        </text>
        <text
          x="380"
          y="42"
          textAnchor="middle"
          className="fill-slate-700 text-[21px] font-semibold"
        >
          Zline = sqrt(2) Z0
        </text>
        <text
          x="350"
          y="112"
          textAnchor="middle"
          className="fill-slate-700 text-[20px]"
        >
          lambda/4
        </text>
        <text
          x="350"
          y="226"
          textAnchor="middle"
          className="fill-slate-700 text-[20px]"
        >
          lambda/4
        </text>
        <text
          x="160"
          y="192"
          textAnchor="middle"
          className="fill-slate-700 text-[20px]"
        >
          Z0
        </text>
      </svg>
    </DiagramFrame>
  );
}

export function DirectionalCouplerDiagram() {
  return (
    <DiagramFrame title="Branch-line hybrid sketch">
      <svg
        viewBox="0 0 720 360"
        role="img"
        aria-labelledby="directional-coupler-title"
        className="h-auto w-full"
      >
        <title id="directional-coupler-title">
          Branch-line 90 degree hybrid coupler
        </title>
        <path
          d="M170 105 H550 V255 H170 Z"
          fill="none"
          stroke="#0891b2"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <line x1="70" y1="105" x2="170" y2="105" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <line x1="550" y1="105" x2="650" y2="105" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <line x1="70" y1="255" x2="170" y2="255" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <line x1="550" y1="255" x2="650" y2="255" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <circle cx="170" cy="105" r="9" fill="#f59e0b" />
        <circle cx="550" cy="105" r="9" fill="#f59e0b" />
        <circle cx="170" cy="255" r="9" fill="#f59e0b" />
        <circle cx="550" cy="255" r="9" fill="#f59e0b" />
        <text x="95" y="82" className="fill-slate-700 text-[20px]">
          port 1
        </text>
        <text x="575" y="82" className="fill-slate-700 text-[20px]">
          port 2
        </text>
        <text x="95" y="294" className="fill-slate-700 text-[20px]">
          port 4
        </text>
        <text x="575" y="294" className="fill-slate-700 text-[20px]">
          port 3
        </text>
        <text
          x="360"
          y="82"
          textAnchor="middle"
          className="fill-slate-700 text-[20px] font-semibold"
        >
          Z0 / sqrt(2), lambda/4
        </text>
        <text
          x="360"
          y="292"
          textAnchor="middle"
          className="fill-slate-700 text-[20px] font-semibold"
        >
          Z0 / sqrt(2), lambda/4
        </text>
        <text
          x="135"
          y="185"
          textAnchor="middle"
          className="fill-slate-700 text-[20px] font-semibold"
        >
          Z0
        </text>
        <text
          x="585"
          y="185"
          textAnchor="middle"
          className="fill-slate-700 text-[20px] font-semibold"
        >
          Z0
        </text>
        <text
          x="360"
          y="184"
          textAnchor="middle"
          className="fill-slate-700 text-[22px]"
        >
          3 dB, 90 deg hybrid
        </text>
      </svg>
    </DiagramFrame>
  );
}

type PiTMatchingDiagramProps = {
  network: "pi" | "t";
};

export function PiTMatchingDiagram({ network }: PiTMatchingDiagramProps) {
  return (
    <DiagramFrame title={network === "pi" ? "Pi matching sketch" : "T matching sketch"}>
      <svg
        viewBox="0 0 720 280"
        role="img"
        aria-labelledby="pi-t-matching-title"
        className="h-auto w-full"
      >
        <title id="pi-t-matching-title">
          {network === "pi" ? "Pi matching network" : "T matching network"}
        </title>
        <line x1="80" y1="120" x2="640" y2="120" stroke="#0f172a" strokeWidth="5" />
        <text x="85" y="92" className="fill-slate-700 text-[21px]">
          Rs
        </text>
        <text x="606" y="92" className="fill-slate-700 text-[21px]">
          RL
        </text>
        {network === "pi" ? (
          <>
            <CapacitorSymbol x={190} y={156} label="Csource" orientation="vertical" />
            <InductorSymbol x={360} y={120} label="Lseries" orientation="horizontal" />
            <CapacitorSymbol x={530} y={156} label="Cload" orientation="vertical" />
            <line x1="190" y1="120" x2="190" y2="156" stroke="#0f172a" strokeWidth="5" />
            <line x1="190" y1="202" x2="190" y2="232" stroke="#0f172a" strokeWidth="5" />
            <line x1="530" y1="120" x2="530" y2="156" stroke="#0f172a" strokeWidth="5" />
            <line x1="530" y1="202" x2="530" y2="232" stroke="#0f172a" strokeWidth="5" />
          </>
        ) : (
          <>
            <InductorSymbol x={240} y={120} label="Lsource" orientation="horizontal" />
            <CapacitorSymbol x={360} y={156} label="Cshunt" orientation="vertical" />
            <InductorSymbol x={500} y={120} label="Lload" orientation="horizontal" />
            <line x1="360" y1="120" x2="360" y2="156" stroke="#0f172a" strokeWidth="5" />
            <line x1="360" y1="202" x2="360" y2="232" stroke="#0f172a" strokeWidth="5" />
          </>
        )}
        <line x1="140" y1="232" x2="580" y2="232" stroke="#64748b" strokeWidth="5" />
        <text x="360" y="262" textAnchor="middle" className="fill-slate-700 text-[21px]">
          ground
        </text>
      </svg>
    </DiagramFrame>
  );
}

type ResistorProps = {
  x: number;
  y: number;
  label: string;
  orientation: "horizontal" | "vertical";
};

function Resistor({ x, y, label, orientation }: ResistorProps) {
  if (orientation === "horizontal") {
    return (
      <>
        <path
          d={`M${x - 50} ${y} h14 l8 -14 l16 28 l16 -28 l16 28 l8 -14 h14`}
          fill="none"
          stroke="#0f172a"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <text x={x} y={y - 32} textAnchor="middle" className="fill-slate-700 text-[19px]">
          {label}
        </text>
      </>
    );
  }

  return (
    <>
      <path
        d={`M${x} ${y - 42} v12 l-14 8 l28 16 l-28 16 l28 16 l-14 8 v12`}
        fill="none"
        stroke="#0f172a"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <line x1={x} y1={y + 56} x2={x} y2="236" stroke="#0f172a" strokeWidth="5" />
      <text x={x + 28} y={y + 12} className="fill-slate-700 text-[19px]">
        {label}
      </text>
    </>
  );
}

type ReactiveSymbolProps = {
  x: number;
  y: number;
  label: string;
  orientation: "horizontal" | "vertical";
};

function InductorSymbol({ x, y, label, orientation }: ReactiveSymbolProps) {
  if (orientation === "horizontal") {
    return (
      <>
        <path
          d={`M${x - 70} ${y} h18 c0 -18 20 -18 20 0 c0 -18 20 -18 20 0 c0 -18 20 -18 20 0 h18`}
          fill="none"
          stroke="#0f172a"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <text x={x} y={y - 28} textAnchor="middle" className="fill-slate-700 text-[18px]">
          {label}
        </text>
      </>
    );
  }

  return (
    <>
      <path
        d={`M${x} ${y - 70} v18 c18 0 18 20 0 20 c18 0 18 20 0 20 c18 0 18 20 0 20 v18`}
        fill="none"
        stroke="#0f172a"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <text x={x + 28} y={y + 4} className="fill-slate-700 text-[18px]">
        {label}
      </text>
    </>
  );
}

function CapacitorSymbol({ x, y, label, orientation }: ReactiveSymbolProps) {
  if (orientation === "horizontal") {
    return (
      <>
        <line x1={x - 62} y1={y} x2={x - 12} y2={y} stroke="#0f172a" strokeWidth="5" />
        <line x1={x - 12} y1={y - 22} x2={x - 12} y2={y + 22} stroke="#0f172a" strokeWidth="5" />
        <line x1={x + 12} y1={y - 22} x2={x + 12} y2={y + 22} stroke="#0f172a" strokeWidth="5" />
        <line x1={x + 12} y1={y} x2={x + 62} y2={y} stroke="#0f172a" strokeWidth="5" />
        <text x={x} y={y - 34} textAnchor="middle" className="fill-slate-700 text-[18px]">
          {label}
        </text>
      </>
    );
  }

  return (
    <>
      <line x1={x} y1={y - 46} x2={x} y2={y - 10} stroke="#0f172a" strokeWidth="5" />
      <line x1={x - 22} y1={y - 10} x2={x + 22} y2={y - 10} stroke="#0f172a" strokeWidth="5" />
      <line x1={x - 22} y1={y + 12} x2={x + 22} y2={y + 12} stroke="#0f172a" strokeWidth="5" />
      <line x1={x} y1={y + 12} x2={x} y2={y + 46} stroke="#0f172a" strokeWidth="5" />
      <text x={x + 30} y={y + 6} className="fill-slate-700 text-[18px]">
        {label}
      </text>
    </>
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
