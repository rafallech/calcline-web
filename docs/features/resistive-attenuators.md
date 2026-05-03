# Resistive Attenuators

## Cel

Kalkulator wyznacza idealne wartości rezystorów dla symetrycznych tłumików rezystancyjnych typu Pi oraz T dopasowanych do impedancji odniesienia `Z0`.

## Wejścia

- topologia:
  - `Pi attenuator`,
  - `T attenuator`,
- `Z0`: impedancja systemowa w ohmach,
- `attenuationDb`: tłumienie w dB.

## Wyniki

- wartości rezystorów dla wybranej topologii,
- voltage ratio,
- power ratio.

## Założenia

- Tłumik jest symetryczny i dopasowany do tego samego `Z0` na wejściu oraz wyjściu.
- Rezystory są idealne i niezależne od częstotliwości.
- `attenuationDb` jest dodatnim tłumieniem, czyli `Vin / Vout > 1`.
- `voltageRatio = 10^(attenuationDb / 20)`.
- `powerRatio = 10^(attenuationDb / 10)`.

## Walidacja

- `Z0 > 0`,
- `attenuation > 0`,
- wszystkie wartości wejściowe muszą być skończone,
- topologia musi należeć do obsługiwanych wartości.

Typowe błędy formularza zwracane są w strukturze `CalculatorCalculation`, bez rzucania wyjątków.

## Pliki

- logika: `lib/calculators/attenuators.ts`,
- testy: `tests/attenuators.test.ts`,
- UI: `app/calculators/attenuators/page.tsx`,
- komponent UI: `app/calculators/attenuators/AttenuatorsCalculator.tsx`.

## Wzory

Dla `K = 10^(A_dB / 20)`:

```text
T attenuator:
Rseries = Z0 * (K - 1) / (K + 1)
Rshunt = 2 * Z0 * K / (K^2 - 1)

Pi attenuator:
Rshunt = Z0 * (K + 1) / (K - 1)
Rseries = Z0 * (K^2 - 1) / (2 * K)
```

## Ryzyka matematyczne

- Dla bardzo małego tłumienia wartości rezystorów równoległych w topologii Pi i T dążą do bardzo dużych wartości.
- Model nie uwzględnia pasożytów elementów, mocy wydzielanej w rezystorach ani tolerancji.
- Wyniki dotyczą tylko symetrycznego dopasowania `Z0` do `Z0`.

