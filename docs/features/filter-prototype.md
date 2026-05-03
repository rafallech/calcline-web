# Microwave Filter Prototype

## Cel

Kalkulator generuje podstawowy Butterworth low-pass prototype: znormalizowane wartosci `g`, przeskalowane elementy `L` i `C` oraz sekwencje elementow drabinki.

## Zakres pierwszej wersji

Pierwsza wersja obsluguje tylko filtr Butterworth low-pass prototype z drabinka zaczynajaca sie od szeregowej cewki. Chebyshev, band-pass oraz transformacje do topologii mikrofalowych beda kolejnymi etapami rozwoju.

## Wejscia

- `order n` - rzad filtru, liczba calkowita od 1 do 10.
- `cutoff frequency` - czestotliwosc graniczna w MHz.
- `source/load impedance Z0` - impedancja zrodla i obciazenia w omach.

## Wyniki

- `normalized g-values` - lista `g0`, `g1 ... gn`, `g(n+1)`.
- `scaled L and C values` - wartosci elementow po skalowaniu impedancyjnym i czestotliwosciowym.
- `element sequence` - sekwencja drabinki low-pass: szeregowe L, rownolegle C, naprzemiennie.

## Wzory

- `g0 = 1`
- `gk = 2 sin((2k - 1) pi / (2n))`
- `g(n+1) = 1`
- `wc = 2 pi fc`
- dla elementow szeregowych: `L = Z0 gk / wc`
- dla elementow rownoleglych: `C = gk / (Z0 wc)`

## Walidacja

- `n` musi byc liczba calkowita od 1 do 10.
- `cutoff frequency > 0`
- `Z0 > 0`

## Trasa URL

`/calculators/filter-prototype`

## Plik logiki

`lib/calculators/filterPrototype.ts`

## Plik testow

`tests/filterPrototype.test.ts`

## Ryzyka matematyczne

- Prototyp low-pass nie jest jeszcze transformowany do band-pass ani high-pass.
- Wyniki sa idealnymi elementami skupionymi; przy czestotliwosciach mikrofalowych wymagaja transformacji do struktur rozproszonych i weryfikacji EM.
- Topologia zaczyna sie od szeregowej cewki; wariant dualny zaczynajacy sie od rownoleglego kondensatora nie jest jeszcze zaimplementowany.
