# S-parameter Converter

## Cel

Kalkulator przelicza podstawowe parametry jednoportowe i transmisyjne na podstawie `S11` oraz `S21`. Minimalny zakres obejmuje reprezentację `S11` jako współczynnika odbicia `Gamma`, return loss, VSWR, moc odbitą, mismatch loss oraz konwersję `S21` między skalą liniową i dB.

## Wejścia

- format `S11`:
  - magnitude and angle,
  - dB and angle,
- `S11` magnitude albo `S11` dB,
- `S11` angle w stopniach,
- format `S21`:
  - magnitude,
  - dB,
- `S21` magnitude albo `S21` dB,
- `Z0` w ohmach.

## Wyniki

- `Gamma` jako liczba zespolona,
- return loss w dB,
- VSWR,
- reflected power percentage,
- mismatch loss w dB,
- `S21` linear,
- `S21` dB,
- insertion loss albo gain.

## Założenia

- `S11` jest traktowane jako współczynnik odbicia na porcie odniesionym do `Z0`.
- Minimalny model jest przypadkiem pasywnym i wymaga `|S11| < 1`.
- Kąty mogą mieć dowolną wartość liczbową; nie są ograniczane do zakresu `-180..180`.
- `S21` jest traktowane jako amplitudowy współczynnik transmisji.
- Impedancja odniesienia `Z0` musi być dodatnia, choć w minimalnym zakresie nie jest używana do konwersji impedancji.

## Walidacja

- `Z0 > 0`,
- `|S11| < 1` dla przypadku pasywnego,
- `S11` magnitude musi być `>= 0`,
- `S21` magnitude musi być `>= 0`,
- wartości w dB i kąty muszą być skończone.

Typowe błędy formularza zwracane są w strukturze `CalculatorCalculation`, bez rzucania wyjątków.

## Pliki

- logika: `lib/calculators/sParameters.ts`,
- testy: `tests/sParameters.test.ts`,
- UI: `app/calculators/s-parameters/page.tsx`,
- komponent UI: `app/calculators/s-parameters/SParametersCalculator.tsx`.

## Wzory

```text
|S11| = 10 ^ (S11_dB / 20)
Gamma = |S11| angle(S11)
return loss = -20 log10(|Gamma|)
VSWR = (1 + |Gamma|) / (1 - |Gamma|)
reflected power % = |Gamma|^2 * 100
mismatch loss = -10 log10(1 - |Gamma|^2)
S21_dB = 20 log10(|S21|)
|S21| = 10 ^ (S21_dB / 20)
```

## Ryzyka matematyczne

- `S11` i `S21` w dB dotyczą modułu amplitudowego, więc używają `20 log10`.
- Return loss dla `|Gamma| = 0` jest nieskończony.
- VSWR dąży do nieskończoności, gdy `|Gamma|` zbliża się do `1`.
- Mismatch loss opisuje wyłącznie stratę wynikającą z niedopasowania, nie pełną stratę toru.

