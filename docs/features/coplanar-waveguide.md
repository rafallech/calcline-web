# Coplanar Waveguide

## Cel

Kalkulator szacuje parametry coplanar waveguide: impedancje charakterystyczna, efektywna przenikalnosc i dlugosc fali prowadzonej.

## Tryby

- `CPW` - zaimplementowany model coplanar waveguide na podlozu o skonczonej wysokosci.
- `grounded CPW` - placeholder. Ten wariant wymaga osobnego wzoru z plaszczyzna masy pod spodem i nie jest jeszcze liczony.

## Wejscia

- `center conductor width W` - szerokosc przewodnika centralnego w mm.
- `gap S` - szczelina miedzy przewodnikiem centralnym i masami bocznymi w mm.
- `substrate height h` - wysokosc podloza w mm.
- `eps_r` - wzgledna przenikalnosc podloza.
- `frequency` - czestotliwosc pracy w GHz.

## Wyniki

- `characteristic impedance Z0` - impedancja charakterystyczna CPW.
- `effective permittivity eps_eff` - efektywna przenikalnosc.
- `guided wavelength` - dlugosc fali prowadzonej.

## Zalozenia

- Model CPW uzywa quasi-TEM przyblizenia z ilorazami zupelnych calek eliptycznych.
- Parametr `k = W / (W + 2S)`.
- Dla skonczonego podloza liczony jest `k1 = sinh(pi W / 4h) / sinh(pi (W + 2S) / 4h)`.
- `eps_eff = 1 + (eps_r - 1) / 2 * K(k1)/K(k1') * K(k')/K(k)`.
- `Z0 = 30*pi/sqrt(eps_eff) * K(k')/K(k)`.
- Straty, grubosc metalu, dyspersja i wariant grounded CPW nie sa uwzglednione w trybie CPW.

## Walidacja

- `W > 0`
- `S > 0`
- `h > 0`
- `eps_r >= 1`
- `frequency > 0`

## Trasa URL

`/calculators/coplanar-waveguide`

## Plik logiki

`lib/calculators/coplanarWaveguide.ts`

## Plik testow

`tests/coplanarWaveguide.test.ts`

## Ryzyka matematyczne

- Wyniki sa przyblizeniem quasi-TEM; dla wysokich czestotliwosci, grubych metali i realnych stosow materialowych potrzebna jest weryfikacja EM.
- Tryb grounded CPW ma inny model pol i musi zostac zaimplementowany osobno.
- Dla ekstremalnych geometrii ilorazy calek eliptycznych moga byc bardzo czule na zaokraglenia i tolerancje technologiczne.
