# Microstrip Patch Antenna

## Cel

Kalkulator wyznacza wstępne wymiary prostokątnej anteny mikropaskowej pracującej w modzie podstawowym `TM10`. Wynik jest przybliżeniem projektowym i powinien być traktowany jako punkt startowy do strojenia oraz weryfikacji EM.

## Wejścia

- `fGHz`: częstotliwość rezonansowa w `GHz`,
- `epsR`: względna przenikalność podłoża,
- `hMm`: wysokość podłoża w `mm`.

## Wyniki

- szerokość patcha `W`,
- efektywna przenikalność `eps_eff`,
- wydłużenie długości `deltaL`,
- efektywna długość rezonansowa `Leff`,
- fizyczna długość patcha `L`.

## Założenia

- Prostokątny patch w modzie podstawowym `TM10`.
- Cienkie podłoże i model transmisyjno-liniowy.
- Brak modelu strat, impedancji wejściowej, punktu zasilania i promieniowania.
- Wyniki są przybliżeniem projektowym; rzeczywisty wymiar wymaga zwykle strojenia w symulatorze EM albo pomiarze.

## Walidacja

- `frequency > 0`,
- `eps_r > 1`,
- `h > 0`,
- wszystkie wartości wejściowe muszą być skończone.

Typowe błędy formularza zwracane są w strukturze `CalculatorCalculation`, bez rzucania wyjątków.

## Pliki

- logika: `lib/calculators/patchAntenna.ts`,
- testy: `tests/patchAntenna.test.ts`,
- UI: `app/calculators/patch-antenna/page.tsx`,
- komponent UI: `app/calculators/patch-antenna/PatchAntennaCalculator.tsx`.

## Wzory

```text
W = c / (2 f) * sqrt(2 / (eps_r + 1))
eps_eff = (eps_r + 1) / 2 + (eps_r - 1) / 2 * 1 / sqrt(1 + 12 h / W)
deltaL = 0.412 h * ((eps_eff + 0.3)(W / h + 0.264)) / ((eps_eff - 0.258)(W / h + 0.8))
Leff = c / (2 f sqrt(eps_eff))
L = Leff - 2 deltaL
```

## Ryzyka matematyczne

- Model jest przybliżony i traci dokładność dla grubych podłoży oraz materiałów silnie stratnych.
- Rzeczywista częstotliwość rezonansowa zależy od technologii wykonania, metalizacji, zasilania i otoczenia anteny.
- `eps_r` podłoży takich jak FR4 może istotnie zależeć od częstotliwości i producenta.
- Wynik nie zastępuje pełnej analizy EM.

