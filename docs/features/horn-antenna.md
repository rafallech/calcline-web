# Horn Antenna

## Cel

Podstawowy kalkulator hornu antenowego szacuje zysk z wymiarów apertury, częstotliwości i sprawności apertury. Wersja początkowa nie jest połączona z kalkulatorem falowodu i nie dobiera wymiarów gardzieli ani profilu hornu.

## Wejścia

- `frequency` w GHz.
- `aperture width` w mm.
- `aperture height` w mm.
- `aperture efficiency` jako liczba od 0 do 1.

## Wyniki

- długość fali `lambda`,
- pole apertury,
- kierunkowość w skali liniowej,
- zysk w skali liniowej,
- zysk w dBi,
- przybliżona szerokość wiązki w płaszczyźnie E,
- przybliżona szerokość wiązki w płaszczyźnie H.

## Model

Model używa zależności aperturowej:

```text
lambda = c / f
A = W * H
D = 4 * pi * A / lambda^2
G = eta * D
G_dBi = 10 * log10(G)
```

Przybliżenia szerokości wiązki:

```text
HPBW_E ~= 56 * lambda / H
HPBW_H ~= 67 * lambda / W
```

## Walidacja

- `frequency > 0`,
- `aperture width > 0`,
- `aperture height > 0`,
- `0 < aperture efficiency <= 1`.

## Założenia i ograniczenia

- Model zakłada prostokątną aperturę i idealizuje rozkład pola przez pojedynczy współczynnik sprawności.
- Wyniki są przybliżeniem projektowym, nie pełną analizą EM.
- Kalkulator nie uwzględnia profilu hornu, długości hornu, falowodu zasilającego, strat przewodnika, niedopasowania ani polaryzacji.
- Integracja z kalkulatorem falowodu jest poza zakresem tej wersji.

## Pliki

- Logika: `lib/calculators/hornAntenna.ts`
- Strona: `app/calculators/horn-antenna/page.tsx`
- UI: `app/calculators/horn-antenna/HornAntennaCalculator.tsx`
- Testy: `tests/hornAntenna.test.ts`
- Ikona: `public/icons/calculators/horn-antenna.svg`
