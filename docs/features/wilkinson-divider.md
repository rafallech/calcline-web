# Wilkinson Power Divider

## Cel

Kalkulator projektuje klasyczny idealny dzielnik mocy Wilkinson 2-way equal split dla impedancji systemowej `Z0`, czestotliwosci srodkowej i efektywnej przenikalnosci odcinkow linii.

## Wejscia

- `Z0` - impedancja systemowa w omach.
- `center frequency` - czestotliwosc srodkowa w GHz.
- `eps_eff` - efektywna przenikalnosc odcinkow transmisyjnych.

## Wyniki

- `quarter-wave line impedance` - impedancja kazdego odcinka lambda/4.
- `isolation resistor` - rezystor izolujacy miedzy portami wyjsciowymi.
- `line electrical length` - dlugosc elektryczna odcinkow linii.
- `physical length` - dlugosc fizyczna odcinka lambda/4.
- `lambda_g` - dlugosc fali prowadzacej.

## Zalozenia

- Model dotyczy klasycznego idealnego dzielnika Wilkinson 2-way equal split.
- Wszystkie porty sa dopasowane do tej samej impedancji `Z0`.
- Linie cwiercfalowe maja taka sama efektywna przenikalnosc `eps_eff`.
- Straty, dyspersja, nieciaglosci i tolerancje elementow nie sa uwzgledniane.

## Walidacja

- `Z0 > 0`
- `frequency > 0`
- `eps_eff >= 1`

## Trasa URL

`/calculators/wilkinson-divider`

## Plik logiki

`lib/calculators/wilkinson.ts`

## Plik testow

`tests/wilkinson.test.ts`

## Ryzyka matematyczne

- Wzor `Zt = sqrt(2) * Z0` jest poprawny dla idealnego rownego podzialu 2-way i identycznych impedancji portow; nie obejmuje nierownego podzialu ani impedancji zespolonych.
- Dlugosc fizyczna zalezy bezposrednio od `eps_eff`; blad w tej wartosci przenosi sie na strojenie czestotliwosci srodkowej.
- Model nie estymuje szerokopasmowosci, izolacji poza czestotliwoscia srodkowa ani strat przewodnika/dielektryka.
