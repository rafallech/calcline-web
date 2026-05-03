"use client";

import { useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { CopyResultsButton } from "@/components/CopyResultsButton";
import { FormulaBlock } from "@/components/FormulaBlock";
import { NumberInput } from "@/components/NumberInput";
import { ResetButton } from "@/components/ResetButton";
import { ResultTable } from "@/components/ResultTable";
import { UnitSelect } from "@/components/UnitSelect";
import { ValidationMessages } from "@/components/ValidationMessages";
import { usePersistentForm } from "@/components/usePersistentForm";
import { calculatorDefaults, defaultNumber } from "@/lib/calculatorDefaults";
import type { CalculatorInfo } from "@/lib/calculators";
import {
  calculateLinkBudget,
  type LinkBudgetCalculation,
  type LinkBudgetDistanceUnit,
  type LinkBudgetFrequencyUnit,
} from "@/lib/calculators/linkBudget";
import { formatNumber } from "@/lib/math/format";
import { formatResultsText } from "@/lib/resultText";

type LinkBudgetCalculatorProps = {
  calculator: CalculatorInfo;
};

type LinkBudgetFormState = {
  transmitPowerDbm: string;
  txAntennaGainDbi: string;
  rxAntennaGainDbi: string;
  frequency: string;
  frequencyUnit: LinkBudgetFrequencyUnit;
  distance: string;
  distanceUnit: LinkBudgetDistanceUnit;
  txCableLossDb: string;
  rxCableLossDb: string;
  additionalLossesDb: string;
  receiverSensitivityDbm: string;
};

const defaultFormState: LinkBudgetFormState = {
  transmitPowerDbm: defaultNumber(calculatorDefaults.linkBudget.transmitPowerDbm),
  txAntennaGainDbi: defaultNumber(
    calculatorDefaults.linkBudget.txAntennaGainDbi,
  ),
  rxAntennaGainDbi: defaultNumber(
    calculatorDefaults.linkBudget.rxAntennaGainDbi,
  ),
  frequency: defaultNumber(calculatorDefaults.linkBudget.frequency),
  frequencyUnit: calculatorDefaults.linkBudget.frequencyUnit,
  distance: defaultNumber(calculatorDefaults.linkBudget.distance),
  distanceUnit: calculatorDefaults.linkBudget.distanceUnit,
  txCableLossDb: defaultNumber(calculatorDefaults.linkBudget.txCableLossDb),
  rxCableLossDb: defaultNumber(calculatorDefaults.linkBudget.rxCableLossDb),
  additionalLossesDb: defaultNumber(
    calculatorDefaults.linkBudget.additionalLossesDb,
  ),
  receiverSensitivityDbm: defaultNumber(
    calculatorDefaults.linkBudget.receiverSensitivityDbm,
  ),
};

const frequencyUnitOptions: { value: LinkBudgetFrequencyUnit; label: string }[] =
  [
    { value: "MHz", label: "MHz" },
    { value: "GHz", label: "GHz" },
  ];

const distanceUnitOptions: { value: LinkBudgetDistanceUnit; label: string }[] = [
  { value: "m", label: "m" },
  { value: "km", label: "km" },
];

export function LinkBudgetCalculator({ calculator }: LinkBudgetCalculatorProps) {
  const [form, setForm, resetStoredForm] = usePersistentForm(
    "calcline-web:link-budget-form",
    defaultFormState,
  );

  const calculation = useMemo(
    () =>
      calculateLinkBudget({
        transmitPowerDbm: parseNumericField(form.transmitPowerDbm),
        txAntennaGainDbi: parseNumericField(form.txAntennaGainDbi),
        rxAntennaGainDbi: parseNumericField(form.rxAntennaGainDbi),
        frequency: parseNumericField(form.frequency),
        frequencyUnit: form.frequencyUnit,
        distance: parseNumericField(form.distance),
        distanceUnit: form.distanceUnit,
        txCableLossDb: parseNumericField(form.txCableLossDb),
        rxCableLossDb: parseNumericField(form.rxCableLossDb),
        additionalLossesDb: parseNumericField(form.additionalLossesDb),
        receiverSensitivityDbm: parseNumericField(form.receiverSensitivityDbm),
      }),
    [form],
  );
  const copyText = useMemo(
    () => buildCopyText(calculator.title, form, calculation),
    [calculator.title, form, calculation],
  );

  function updateField(field: keyof LinkBudgetFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    resetStoredForm();
  }

  return (
    <CalculatorLayout
      title={calculator.title}
      description={calculator.description}
      inputPanel={
        <LinkBudgetInputPanel
          form={form}
          calculation={calculation}
          onChange={updateField}
          onReset={resetForm}
        />
      }
      resultPanel={
        <LinkBudgetResultPanel calculation={calculation} copyText={copyText} />
      }
      formulaPanel={
        <FormulaBlock title="Free-space link budget">
          EIRP = Ptx + Gtx - Ltx; FSPL = 20 log10(4 pi d / lambda);
          Prx = EIRP - FSPL + Grx - Lrx - Ladd; margin = Prx - sensitivity.
        </FormulaBlock>
      }
    />
  );
}

type LinkBudgetInputPanelProps = {
  form: LinkBudgetFormState;
  calculation: LinkBudgetCalculation;
  onChange: (field: keyof LinkBudgetFormState, value: string) => void;
  onReset: () => void;
};

function LinkBudgetInputPanel({
  form,
  calculation,
  onChange,
  onReset,
}: LinkBudgetInputPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Inputs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter transmit power, antenna gains, losses, and the receiver
            sensitivity.
          </p>
        </div>
        <ResetButton onClick={onReset} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="link-budget-ptx"
          label="transmit power"
          value={form.transmitPowerDbm}
          onChange={(value) => onChange("transmitPowerDbm", value)}
          unit="dBm"
          step={0.1}
        />
        <NumberInput
          id="link-budget-gtx"
          label="TX antenna gain"
          value={form.txAntennaGainDbi}
          onChange={(value) => onChange("txAntennaGainDbi", value)}
          unit="dBi"
          step={0.1}
        />
        <NumberInput
          id="link-budget-grx"
          label="RX antenna gain"
          value={form.rxAntennaGainDbi}
          onChange={(value) => onChange("rxAntennaGainDbi", value)}
          unit="dBi"
          step={0.1}
        />
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            id="link-budget-frequency"
            label="frequency"
            value={form.frequency}
            onChange={(value) => onChange("frequency", value)}
            min={0}
            step={0.01}
          />
          <UnitSelect
            id="link-budget-frequency-unit"
            label="unit"
            value={form.frequencyUnit}
            options={frequencyUnitOptions}
            onChange={(value) => onChange("frequencyUnit", value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            id="link-budget-distance"
            label="distance"
            value={form.distance}
            onChange={(value) => onChange("distance", value)}
            min={0}
            step={0.01}
          />
          <UnitSelect
            id="link-budget-distance-unit"
            label="unit"
            value={form.distanceUnit}
            options={distanceUnitOptions}
            onChange={(value) => onChange("distanceUnit", value)}
          />
        </div>
        <NumberInput
          id="link-budget-ltx"
          label="TX cable loss"
          value={form.txCableLossDb}
          onChange={(value) => onChange("txCableLossDb", value)}
          unit="dB"
          step={0.1}
        />
        <NumberInput
          id="link-budget-lrx"
          label="RX cable loss"
          value={form.rxCableLossDb}
          onChange={(value) => onChange("rxCableLossDb", value)}
          unit="dB"
          step={0.1}
        />
        <NumberInput
          id="link-budget-ladd"
          label="additional losses"
          value={form.additionalLossesDb}
          onChange={(value) => onChange("additionalLossesDb", value)}
          unit="dB"
          step={0.1}
        />
        <NumberInput
          id="link-budget-sensitivity"
          label="receiver sensitivity"
          value={form.receiverSensitivityDbm}
          onChange={(value) => onChange("receiverSensitivityDbm", value)}
          unit="dBm"
          step={0.1}
        />
      </div>

      <ValidationMessages
        errors={calculation.errors}
        warnings={calculation.warnings}
      />
    </div>
  );
}

type LinkBudgetResultPanelProps = {
  calculation: LinkBudgetCalculation;
  copyText?: string;
};

function LinkBudgetResultPanel({
  calculation,
  copyText,
}: LinkBudgetResultPanelProps) {
  const rows = calculation.value
    ? [
        {
          label: "EIRP",
          value: formatNumber(calculation.value.eirpDbm, 3),
          unit: "dBm",
        },
        {
          label: "free-space path loss",
          value: formatNumber(calculation.value.fsplDb, 3),
          unit: "dB",
        },
        {
          label: "received power",
          value: formatNumber(calculation.value.receivedPowerDbm, 3),
          unit: "dBm",
        },
        {
          label: "link margin",
          value: formatNumber(calculation.value.linkMarginDb, 3),
          unit: "dB",
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Results</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Results use a free-space path loss model and do not include fading
            margin unless entered as additional loss.
          </p>
        </div>
        <CopyResultsButton text={copyText} />
      </div>
      <ResultTable
        rows={rows}
        emptyMessage="Enter valid link budget parameters to see results."
      />
    </div>
  );
}

function buildCopyText(
  title: string,
  form: LinkBudgetFormState,
  calculation: LinkBudgetCalculation,
): string | undefined {
  if (!calculation.value) {
    return undefined;
  }

  return formatResultsText({
    title,
    inputs: [
      { label: "transmit power", value: form.transmitPowerDbm, unit: "dBm" },
      { label: "TX antenna gain", value: form.txAntennaGainDbi, unit: "dBi" },
      { label: "RX antenna gain", value: form.rxAntennaGainDbi, unit: "dBi" },
      { label: "frequency", value: form.frequency, unit: form.frequencyUnit },
      { label: "distance", value: form.distance, unit: form.distanceUnit },
      { label: "TX cable loss", value: form.txCableLossDb, unit: "dB" },
      { label: "RX cable loss", value: form.rxCableLossDb, unit: "dB" },
      {
        label: "additional losses",
        value: form.additionalLossesDb,
        unit: "dB",
      },
      {
        label: "receiver sensitivity",
        value: form.receiverSensitivityDbm,
        unit: "dBm",
      },
    ],
    sections: [
      {
        title: "Results",
        items: [
          {
            label: "EIRP",
            value: formatNumber(calculation.value.eirpDbm, 3),
            unit: "dBm",
          },
          {
            label: "free-space path loss",
            value: formatNumber(calculation.value.fsplDb, 3),
            unit: "dB",
          },
          {
            label: "received power",
            value: formatNumber(calculation.value.receivedPowerDbm, 3),
            unit: "dBm",
          },
          {
            label: "link margin",
            value: formatNumber(calculation.value.linkMarginDb, 3),
            unit: "dB",
          },
        ],
      },
    ],
    warnings: calculation.warnings,
  });
}

function parseNumericField(value: string): number {
  if (value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}

