# RF Cascade

## Cel

Kalkulator analizuje kaskade etapow toru RF: calkowity zysk, noise figure wedlug wzoru Friisa, moc wyjsciowa po kazdym etapie oraz opcjonalny kaskadowy IP3, kiedy wszystkie etapy maja podany OIP3.

## Wejscia

- `input power` - moc na wejsciu kaskady w dBm, domyslnie `0 dBm`.
- Lista etapow toru RF:
  - `name` - nazwa etapu.
  - `gain/loss in dB` - zysk albo strata etapu w dB.
  - `noise figure in dB` - noise figure etapu w dB.
  - `P1dB` - opcjonalny punkt kompresji 1 dB w dBm.
  - `OIP3` - opcjonalny output IP3 w dBm.

## Wyniki

- `total gain` - suma zyskow i strat w dB.
- `cascaded noise figure` - noise figure kaskady wedlug Friisa.
- `output power after each stage` - moc wyjsciowa po kazdym etapie dla podanej mocy wejsciowej.
- `cascaded IP3` - opcjonalne IIP3 i OIP3 kaskady, jesli wszystkie etapy maja podany OIP3.

## Zalozenia

- Zyski i straty sa traktowane jako liniowe bloki w skali mocy.
- Noise figure jest przeliczane na noise factor: `F = 10^(NF/10)`.
- Friis: `Ftotal = F1 + (F2 - 1)/G1 + (F3 - 1)/(G1G2) + ...`.
- OIP3 etapu jest przeliczane na IIP3 etapu jako `IIP3 = OIP3 - gain`.
- Kaskadowe IIP3: `1/IIP3total = 1/IIP3_1 + G1/IIP3_2 + G1G2/IIP3_3 + ...`, w jednostkach liniowych mW.
- `P1dB` jest przechowywane i walidowane, ale pierwsza wersja nie liczy kaskadowego P1dB.

## Walidacja

- Lista musi miec co najmniej jeden etap.
- `gain/loss`, `noise figure`, opcjonalny `P1dB`, opcjonalny `OIP3` i `input power` musza byc liczbami skonczonymi.
- `noise figure >= 0 dB`.
- Puste opcjonalne pola `P1dB` i `OIP3` sa dozwolone.

## Trasa URL

`/calculators/rf-cascade`

## Plik logiki

`lib/calculators/rfCascade.ts`

## Plik testow

`tests/rfCascade.test.ts`

## Ryzyka matematyczne

- Wynik Friisa jest bardzo czuly na zysk pierwszych etapow.
- Etapy o duzych stratach moga mocno pogorszyc noise figure i IP3.
- IP3 kaskadowy wymaga konsekwentnego rozumienia OIP3 kazdego etapu; mieszanie IIP3 i OIP3 da bledny wynik.
- Model nie liczy dopasowania, pasma, saturacji przy duzym sygnale ani kaskadowego P1dB.
