# Pi and T Matching Networks

## Cel

Kalkulator wyznacza podstawowe idealne sieci dopasowujace Pi albo T pomiedzy rezystancja zrodla i obciazenia dla zadanej czestotliwosci oraz docelowego Q.

## Wejscia

- `source resistance` - rezystancja zrodla `Rs` w omach.
- `load resistance` - rezystancja obciazenia `RL` w omach.
- `frequency` - czestotliwosc pracy w MHz.
- `selected network` - `Pi` albo `T`.
- `target Q` - docelowa dobroc dopasowania.

## Wyniki

- `reactances` - reaktancje elementow szeregowych.
- `susceptances` - susceptancje elementow rownoleglych.
- `L and C element values` - idealne wartosci elementow przy podanej czestotliwosci.
- `Q` - wynikowe Q po stronie zrodla, po stronie obciazenia oraz Q docelowe.
- `topology diagram` - schemat Pi albo T w UI.

## Model

Model uzywa rezystancji wirtualnej i sklada dopasowanie z dwoch idealnych sekcji L.

### Pi

- `Rv = max(Rs, RL) / (Q^2 + 1)`
- `Qsource = sqrt(Rs / Rv - 1)`
- `Qload = sqrt(RL / Rv - 1)`
- `Bsource = Qsource / Rs`
- `Bload = Qload / RL`
- `Xseries = (Qsource + Qload) Rv`

Wartosci elementow low-pass: shunt C, series L, shunt C.

### T

- `Rv = min(Rs, RL) (Q^2 + 1)`
- `Qsource = sqrt(Rv / Rs - 1)`
- `Qload = sqrt(Rv / RL - 1)`
- `Xsource = Qsource Rs`
- `Xload = Qload RL`
- `Bshunt = (Qsource + Qload) / Rv`

Wartosci elementow low-pass: series L, shunt C, series L.

## Walidacja

- `Rs > 0`
- `RL > 0`
- `frequency > 0`
- `Q > 0`
- `Q` musi byc wystarczajaco duze, aby rezystancja wirtualna byla po wlasciwej stronie obu rezystancji.

## Trasa URL

`/calculators/pi-t-matching`

## Plik logiki

`lib/calculators/piTMatching.ts`

## Plik testow

`tests/piTMatching.test.ts`

## Ryzyka matematyczne

- Model zaklada czysto rezystancyjne zrodlo i obciazenie.
- Elementy sa idealne, bez strat, pasozytow i ograniczen dobroci elementow.
- Dla zbyt malego Q dopasowanie Pi/T dla danej relacji rezystancji nie jest mozliwe w tym modelu.
- To nie zmienia i nie zastepuje istniejacego kalkulatora L-section.
