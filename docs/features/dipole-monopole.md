# Dipole and Monopole Antenna

## Cel

Kalkulator wyznacza podstawowe długości elementów dla anteny półfalowej dipolowej i ćwierćfalowej monopolowej na podstawie częstotliwości oraz współczynnika skrócenia.

## Wejścia

- `frequency` w MHz,
- `velocity factor` jako liczba od 0 do 1,
- `antenna type`: `half-wave dipole` albo `quarter-wave monopole`.

## Wyniki

- długość fali w wolnej przestrzeni,
- długość fali skorygowana przez velocity factor,
- całkowita długość dipola półfalowego,
- długość jednego ramienia dipola,
- długość monopola ćwierćfalowego,
- rekomendowana długość dla wybranego typu anteny.

## Model

```text
lambda0 = c / f
lambda_corrected = lambda0 * VF
dipole_total = lambda_corrected / 2
dipole_arm = lambda_corrected / 4
monopole = lambda_corrected / 4
```

## Walidacja

- `frequency > 0`,
- `0 < velocity factor <= 1`,
- typ anteny musi być jednym z obsługiwanych wariantów.

## Założenia i ograniczenia

- Model jest prostym oszacowaniem długości fizycznej przewodnika.
- Nie uwzględnia średnicy przewodnika, efektów końcowych, wysokości nad ziemią, przeciwwag, baluna, wpływu otoczenia ani strojenia impedancji.
- Wyniki są punktem startowym do strojenia anteny pomiarem.

## Pliki

- Logika: `lib/calculators/dipoleMonopole.ts`
- Strona: `app/calculators/dipole-monopole/page.tsx`
- UI: `app/calculators/dipole-monopole/DipoleMonopoleCalculator.tsx`
- Testy: `tests/dipoleMonopole.test.ts`
- Ikona: `public/icons/calculators/dipole-monopole.svg`
