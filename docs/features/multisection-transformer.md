# Multi-section Impedance Transformer

## Cel

Kalkulator projektuje podstawowy wielosekcyjny transformer impedancji typu binomial pomiedzy impedancja zrodla i obciazenia.

## Zakres pierwszej wersji

Pierwsza wersja obsluguje tylko binomial multi-section transformer. Wariant Chebyshev bedzie kolejnym etapem rozwoju.

## Wejscia

- `source impedance Z0` - impedancja zrodla w omach.
- `load impedance ZL` - impedancja obciazenia w omach.
- `number of sections N` - liczba sekcji od 1 do 10.
- `center frequency` - czestotliwosc srodkowa w GHz.
- `eps_eff` - efektywna przenikalnosc sekcji transmisyjnych.

## Wyniki

- `impedance of each quarter-wave section` - impedancja kazdej sekcji.
- `physical length of each section` - fizyczna dlugosc kazdej sekcji.
- `lambda_g` - dlugosc fali prowadzonej.
- `bandwidth note` - informacja jak interpretowac przyblizona szerokopasmowosc.

## Model

Binomial transformer uzywa rozkladu logarytmicznego z wagami dwumianowymi:

- `r = ZL / Z0`
- `Delta_m = C(N,m) / 2^N * ln(r)`, dla `m = 0 ... N`
- `Zi = Z0 * exp(sum(Delta_m, m = 0 ... i-1))`, dla `i = 1 ... N`
- kazda sekcja ma dlugosc elektryczna `90 deg`
- `lambda_g = c / (f sqrt(eps_eff))`
- `physical length = lambda_g / 4`

## Walidacja

- `Z0 > 0`
- `ZL > 0`
- `N` musi byc liczba calkowita od 1 do 10.
- `frequency > 0`
- `eps_eff >= 1`

## Trasa URL

`/calculators/multisection-transformer`

## Plik logiki

`lib/calculators/multisectionTransformer.ts`

## Plik testow

`tests/multisectionTransformer.test.ts`

## Ryzyka matematyczne

- Binomial transformer jest maksymalnie plaski w okolicy czestotliwosci srodkowej, ale nie daje tak ostrej kontroli pasma jak Chebyshev.
- Model jest idealny: nie uwzglednia strat, dyspersji, tolerancji wykonania ani nieciaglosci miedzy sekcjami.
- Wszystkie sekcje sa liczone z tym samym `eps_eff`; realna geometria moze zmieniac efektywna przenikalnosc dla kazdej impedancji.
