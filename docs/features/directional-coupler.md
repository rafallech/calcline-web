# Directional Coupler

## Cel

Kalkulator projektuje podstawowy branch-line 90 degree hybrid coupler dla zadanej impedancji systemowej, czestotliwosci srodkowej i efektywnej przenikalnosci linii.

## Zakres pierwszej wersji

Pierwsza wersja obejmuje idealny rowny branch-line hybrid 3 dB. Nie obejmuje sprzezenia o dowolnej wartosci, kierunkowosci, nierownych podzialow ani analizy szerokopasmowej.

## Wejscia

- `Z0` - impedancja systemowa w omach.
- `center frequency` - czestotliwosc srodkowa w GHz.
- `eps_eff` - efektywna przenikalnosc odcinkow linii.

## Wyniki

- `series arm impedance` - impedancja dwoch poziomych ramion linii.
- `branch arm impedance` - impedancja dwoch pionowych ramion linii.
- `quarter-wave physical length` - fizyczna dlugosc kazdego odcinka cwiercfalowego.
- `guided wavelength` - dlugosc fali prowadzonej.
- `ideal split` - idealny rowny podzial mocy.
- `phase relation` - idealna roznica faz miedzy portami wyjsciowymi.

## Zalozenia

- Model dotyczy klasycznego branch-line 90 degree hybrid coupler 3 dB.
- Wszystkie porty sa dopasowane do tej samej impedancji `Z0`.
- Ramiona sa idealnymi bezstratnymi odcinkami `lambda_g / 4`.
- Dla rownego podzialu: ramiona poziome maja `Z0 / sqrt(2)`, ramiona pionowe maja `Z0`.
- Idealny podzial wynosi `-3.0103 dB` na port wyjsciowy, a roznica faz wynosi `90 deg`.

## Walidacja

- `Z0 > 0`
- `frequency > 0`
- `eps_eff >= 1`

## Trasa URL

`/calculators/directional-coupler`

## Plik logiki

`lib/calculators/directionalCoupler.ts`

## Plik testow

`tests/directionalCoupler.test.ts`

## Ryzyka matematyczne

- Model jest idealny: nie uwzglednia strat, dyspersji, nieciaglosci, zakretow ani tolerancji wykonania.
- Branch-line coupler jest waskopasmowy; wynik jest nominalny dla czestotliwosci srodkowej.
- Rzeczywiste impedancje ramion musza zostac przeliczone na geometrie konkretnej technologii transmisyjnej.
