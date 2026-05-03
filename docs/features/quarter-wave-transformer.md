# Quarter-wave Transformer

## Cel

Kalkulator projektuje idealny jednosekcyjny transformator ćwierćfalowy dla dopasowania dwóch dodatnich impedancji rzeczywistych. Wynik obejmuje impedancję sekcji transformującej oraz długości fali przy zadanej częstotliwości i efektywnej przenikalności.

## Wejścia

- `z0Ohm`: impedancja źródła albo linii głównej `Z0` w ohmach,
- `rLOhm`: rezystancja obciążenia `RL` w ohmach,
- `fGHz`: częstotliwość pracy w GHz,
- `epsEff`: efektywna przenikalność względna.

## Wyniki

- `ztOhm`: impedancja transformatora `Zt = sqrt(Z0 * RL)`,
- `electricalLengthDeg`: długość elektryczna, stałe `90 deg`,
- `physicalLengthM`: długość fizyczna sekcji `lambda_g / 4`,
- `lambda0M`: długość fali w wolnej przestrzeni,
- `lambdaGM`: długość fali prowadzona.

## Założenia

- Model podstawowy zakłada obciążenie rzeczywiste.
- `Z0` i `RL` są dodatnimi wartościami rzeczywistymi.
- Linia transformatora jest bezstratna.
- Propagacja jest TEM albo quasi-TEM.
- `eps_eff` jest stałe w częstotliwości.
- Transformator ma długość ćwierć fali tylko przy częstotliwości projektowej.

## Walidacja

- `Z0 > 0`,
- `RL > 0`,
- `frequency > 0`,
- `eps_eff >= 1`,
- wszystkie wartości wejściowe muszą być skończone.

Typowe błędy formularza zwracane są w strukturze `CalculatorCalculation`, bez rzucania wyjątków.

## Pliki

- logika: `lib/calculators/quarterWaveTransformer.ts`,
- testy: `tests/quarterWaveTransformer.test.ts`,
- UI: `app/calculators/quarter-wave-transformer/page.tsx`,
- komponent UI: `app/calculators/quarter-wave-transformer/QuarterWaveTransformerCalculator.tsx`.

## Wzory

```text
Zt = sqrt(Z0 * RL)
lambda0 = c / f
lambda_g = lambda0 / sqrt(eps_eff)
physical length = lambda_g / 4
electrical length = 90 deg
```

## Ryzyka matematyczne

- Wzór `Zt = sqrt(Z0 * RL)` dotyczy obciążeń rzeczywistych; nie rozwiązuje dopasowania dla impedancji zespolonej.
- Wynik fizycznej długości jest poprawny tylko dla częstotliwości projektowej.
- Rzeczywiste wykonanie linii wymaga osobnego przeliczenia `Zt` na geometrię technologii.
- Straty, dyspersja i nieciągłości nie są uwzględniane w modelu podstawowym.

