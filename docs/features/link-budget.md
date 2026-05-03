# Link Budget

## Cel

Kalkulator liczy podstawowy bilans łącza radiowego w wolnej przestrzeni. Wyniki obejmują EIRP, stratę wolnoprzestrzenną, moc odbieraną oraz margines względem czułości odbiornika.

## Wejścia

- moc nadajnika w `dBm`,
- zysk anteny nadawczej w `dBi`,
- zysk anteny odbiorczej w `dBi`,
- częstotliwość,
- jednostka częstotliwości: `MHz` albo `GHz`,
- odległość,
- jednostka odległości: `m` albo `km`,
- strata kabla TX w `dB`,
- strata kabla RX w `dB`,
- dodatkowe straty w `dB`,
- czułość odbiornika w `dBm`.

## Wyniki

- `EIRP` w `dBm`,
- `free-space path loss` w `dB`,
- moc odbierana w `dBm`,
- margines łącza w `dB`.

## Założenia

- Propagacja w wolnej przestrzeni.
- Anteny pracują w polu dalekim.
- Zyski anten są podawane w `dBi`.
- Straty kabla i dodatkowe straty są dodatnimi składnikami odejmowanymi od budżetu.
- Model minimalny nie uwzględnia fadingu, wielodrogowości, polaryzacji, strat atmosferycznych ani szumu odbiornika.

## Walidacja

- `frequency > 0`,
- `distance > 0`,
- wszystkie wartości liczbowe muszą być skończone,
- jednostki muszą należeć do obsługiwanych list.

Typowe błędy formularza zwracane są w strukturze `CalculatorCalculation`, bez rzucania wyjątków.

## Pliki

- logika: `lib/calculators/linkBudget.ts`,
- testy: `tests/linkBudget.test.ts`,
- UI: `app/calculators/link-budget/page.tsx`,
- komponent UI: `app/calculators/link-budget/LinkBudgetCalculator.tsx`.

## Wzory

```text
EIRP = Ptx_dBm + Gtx_dBi - LtxCable_dB
FSPL = 20 log10(4 pi d / lambda)
lambda = c / f
Prx = EIRP - FSPL + Grx_dBi - LrxCable_dB - Ladditional_dB
margin = Prx - sensitivity_dBm
```

## Ryzyka matematyczne

- Popularny wzór `FSPL = 32.44 + 20 log10(d_km) + 20 log10(f_MHz)` zależy od jednostek; implementacja używa konwersji do SI.
- Wynik nie modeluje tłumienia atmosferycznego ani strat wynikających z niedopasowania polaryzacji.
- Dla bardzo małych odległości wynik może nie mieć sensu fizycznego, jeśli anteny nie są w polu dalekim.

