# RF Power and dB Converter

## Cel

Kalkulator przelicza poziomy mocy RF między dBm, dBW, W, mW oraz odpowiadającymi im wartościami napięcia i prądu dla zadanej impedancji odniesienia `Z0`.

## Wejścia

- `inputType`: typ wartości wejściowej:
  - `dBm`,
  - `dBW`,
  - `W`,
  - `mW`,
  - `Vrms`,
  - `Vpp`,
- `value`: wartość wejściowa,
- `z0Ohm`: impedancja odniesienia w ohmach, domyślnie `50 Ohm`.

## Wyniki

- moc w `dBm`,
- moc w `dBW`,
- moc w `W`,
- moc w `mW`,
- napięcie `Vrms`,
- napięcie `Vpp`,
- prąd `Irms`.

## Założenia

- Dla przeliczeń napięciowych obciążenie jest czysto rezystancyjne i równe `Z0`.
- Sygnał jest sinusoidalny.
- `Vrms` jest napięciem skutecznym.
- `Vpp = 2 * sqrt(2) * Vrms`.
- `Irms = Vrms / Z0`.
- `dBm` odnosi się do `1 mW`, a `dBW` do `1 W`.

## Walidacja

- Moc wyrażona w `W` po konwersji musi być `>= 0`.
- Dla wejść `W`, `mW`, `Vrms`, `Vpp` wartość wejściowa musi być `>= 0`.
- `Z0 > 0`.
- Wszystkie wartości liczbowe muszą być skończone.
- Dla wejść `dBm` i `dBW` dopuszczalne są wartości ujemne, ponieważ oznaczają moc mniejszą od poziomu odniesienia.

Typowe błędy formularza zwracane są w strukturze `CalculatorCalculation`, bez rzucania wyjątków.

## Pliki

- logika: `lib/calculators/rfPower.ts`,
- testy: `tests/rfPower.test.ts`,
- UI: `app/calculators/rf-power/page.tsx`,
- komponent UI: `app/calculators/rf-power/RfPowerCalculator.tsx`.

## Wzory

```text
P_W = 10 ^ ((dBm - 30) / 10)
P_W = 10 ^ (dBW / 10)
dBm = 10 log10(P_W / 1 mW)
dBW = 10 log10(P_W / 1 W)
Vrms = sqrt(P_W * Z0)
Vpp = 2 sqrt(2) * Vrms
Irms = Vrms / Z0
```

## Ryzyka matematyczne

- `10 log10` dotyczy mocy; dla napięcia najpierw liczymy moc przez `Z0`.
- Dla `P = 0 W` poziomy `dBm` i `dBW` są równe `-Infinity`.
- Wyniki napięciowe są poprawne tylko dla obciążenia rezystancyjnego.
- `Vpp` wymaga założenia sinusoidy; dla innych przebiegów relacja RMS do peak-to-peak jest inna.

