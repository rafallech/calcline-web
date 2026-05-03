# Stripline

## Cel

Kalkulator szacuje parametry symetrycznej linii stripline: impedancje charakterystyczna, dlugosc fali prowadzonej i opoznienie propagacji.

## Wejscia

- `strip width W` - szerokosc paska przewodzacego w mm.
- `dielectric height b` - odleglosc miedzy plaszczyznami masy w mm.
- `conductor thickness t` - grubosc przewodnika w mm.
- `eps_r` - wzgledna przenikalnosc dielektryka.
- `frequency` - czestotliwosc pracy w GHz.

## Wyniki

- `characteristic impedance Z0` - impedancja charakterystyczna linii.
- `guided wavelength` - dlugosc fali prowadzonej.
- `propagation delay` - opoznienie propagacji w przeliczeniu na jednostke dlugosci.

## Zalozenia

- Model dotyczy symetrycznej stripline w jednorodnym dielektryku.
- Pasek jest wycentrowany pomiedzy dwiema plaszczyznami masy.
- `b` oznacza calkowita wysokosc dielektryka miedzy plaszczyznami masy.
- Impedancja korzysta z przyblizenia `Z0 = 30*pi / (sqrt(eps_r) * (W_eff / b + 0.441))`.
- Dla `t > 0` stosowana jest prosta korekcja szerokosci efektywnej `W_eff = W + t/pi * (1 + ln(4*pi*W/t))`; dla `t = 0` przyjmowane jest `W_eff = W`.
- Straty przewodnika, straty dielektryka, dyspersja i tolerancje technologiczne nie sa liczone.

## Walidacja

- `W > 0`
- `b > 0`
- `t >= 0`
- `eps_r >= 1`
- `frequency > 0`

## Trasa URL

`/calculators/stripline`

## Plik logiki

`lib/calculators/stripline.ts`

## Plik testow

`tests/stripline.test.ts`

## Ryzyka matematyczne

- Przyblizenie impedancji jest modelem projektowym; dla skrajnych geometrii i wysokich czestotliwosci wymagane jest EM simulation albo dane producenta laminatu.
- Prosta korekcja grubosci przewodnika nie obejmuje chropowatosci miedzi ani efektow brzegowych poza modelem szerokosci efektywnej.
- Dlugosc fali i opoznienie zakladaja jednorodny dielektryk o stalej `eps_r`; rzeczywista dyspersja materialu moze przesunac wynik.
