# Antenna Gain and Effective Aperture

## Cel

Kalkulator przelicza zysk anteny i efektywną aperturę dla zadanej częstotliwości. Obsługuje dwa kierunki pracy: od zysku w dBi do `Ae` oraz od `Ae` do zysku.

## Wejścia

- `frequency` w GHz,
- tryb wejścia: `gain in dBi` albo `effective aperture`,
- `gain dBi` dla trybu zysku,
- `effective aperture Ae` w m^2 dla trybu apertury,
- opcjonalna `efficiency` jako liczba od 0 do 1.

## Wyniki

- długość fali,
- zysk w skali liniowej,
- zysk w dBi,
- efektywna apertura `Ae`,
- estymata kierunkowości.

## Model

```text
lambda = c / f
G = 10^(G_dBi / 10)
Ae = G * lambda^2 / (4 * pi)
G = 4 * pi * Ae / lambda^2
D ~= G / eta
```

Jeśli sprawność nie jest podana, do estymaty kierunkowości przyjmowane jest `eta = 1`.

## Walidacja

- `frequency > 0`,
- dla trybu zysku `gain dBi` musi być liczbą skończoną,
- dla trybu apertury `Ae > 0`,
- jeśli `efficiency` jest podana, musi spełniać `0 < efficiency <= 1`,
- tryb wejścia musi być jednym z obsługiwanych wariantów.

## Założenia i ograniczenia

- Kalkulator używa relacji aperturowej dla zysku antenowego.
- Nie rozdziela zysku realizowanego, strat niedopasowania i kierunkowości poza opcjonalnym współczynnikiem sprawności.
- Wyniki są przeliczeniem inżynierskim, nie pełnym modelem konkretnej anteny.

## Pliki

- Logika: `lib/calculators/antennaAperture.ts`
- Strona: `app/calculators/antenna-aperture/page.tsx`
- UI: `app/calculators/antenna-aperture/AntennaApertureCalculator.tsx`
- Testy: `tests/antennaAperture.test.ts`
- Ikona: `public/icons/calculators/antenna-aperture.svg`
