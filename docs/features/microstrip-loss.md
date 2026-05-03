# Microstrip Loss

## Cel

Kalkulator szacuje straty linii mikropaskowej. Pierwszy tryb jest uproszczony i przelicza podane tlumienie na calkowita strate linii. Drugi tryb jest przyblizonym modelem projektowym rozdzielajacym strate dielektryczna i przewodnika.

## Tryby

- `simplified` - uzytkownik podaje tlumienie w `dB/m` i dlugosc linii w `m`.
- `advanced` - kalkulator szacuje skladowa dielektryczna i przewodnika z geometrii oraz materialu.

## Wejscia

### Tryb uproszczony

- `attenuation` - tlumienie w `dB/m`.
- `line length` - dlugosc linii w `m`.

### Tryb advanced

- `frequency` - czestotliwosc w `GHz`.
- `W` - szerokosc sciezki w `mm`.
- `h` - wysokosc dielektryka w `mm`.
- `eps_r` - wzgledna przenikalnosc dielektryka.
- `eps_eff` - efektywna przenikalnosc linii.
- `tan_delta` - tangens kata strat dielektryka.
- `conductor conductivity` - przewodnosc metalu w `S/m`.
- `copper thickness` - grubosc miedzi w `um`.
- `line length` - dlugosc linii w `m`.

## Wyniki

- `dielectric loss` - strata dielektryczna w `dB`, tylko w trybie advanced.
- `conductor loss` - strata przewodnika w `dB`, tylko w trybie advanced.
- `total loss` - calkowita strata w `dB`.
- `loss per unit length` - strata w `dB/m`.

## Zalozenia

- Model jest przyblizeniem projektowym, a nie pelna analiza EM.
- Tryb uproszczony nie rozdziela strat na dielektryczne i przewodnika.
- W trybie advanced:
  - `alpha_d = k0 eps_r (eps_eff - 1) tan_delta / (2 sqrt(eps_eff) (eps_r - 1))` w `Np/m`.
  - `alpha_c ~= Rs / (Z0 W_eff)` w `Np/m`.
  - `Rs = sqrt(pi f mu0 / sigma)`.
  - `W_eff = W + t/pi * (1 + ln(4*pi*W/t))` dla `t > 0`.
  - `Z0` jest szacowane z tych samych galezi quasi-static co kalkulator Microstrip Line, ale bez zmiany jego kodu.

## Walidacja

- W trybie uproszczonym: `attenuation >= 0`, `line length >= 0`.
- W trybie advanced: `frequency > 0`, `W > 0`, `h > 0`, `eps_r > 1`, `eps_eff >= 1`, `tan_delta >= 0`, `conductivity > 0`, `copper thickness >= 0`, `line length >= 0`.

## Trasa URL

`/calculators/microstrip-loss`

## Plik logiki

`lib/calculators/microstripLoss.ts`

## Plik testow

`tests/microstripLoss.test.ts`

## Ryzyka matematyczne

- Straty przewodnika sa liczone bardzo uproszczonym modelem i moga istotnie odbiegac od realnych wynikow dla wysokich czestotliwosci, chropowatosci miedzi i efektow brzegowych.
- `eps_eff` i `tan_delta` moga zalezec od czestotliwosci oraz laminatu.
- Dla projektow produkcyjnych wynik powinien byc sprawdzony w narzedziu EM lub na podstawie danych producenta laminatu.
