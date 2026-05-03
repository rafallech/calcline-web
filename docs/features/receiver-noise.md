# Receiver Noise

## Cel

Kalkulator szacuje podloge szumowa odbiornika, minimalny wykrywalny sygnal i prosta estymacje czulosci z pasma, temperatury, noise figure, wymaganego SNR i opcjonalnego zysku.

## Wejscia

- `bandwidth` - pasmo odbiornika.
- `bandwidth unit` - `Hz`, `kHz` albo `MHz`.
- `noise figure` - noise figure w dB.
- `temperature` - temperatura szumowa w K.
- `required SNR` - wymagany stosunek sygnalu do szumu w dB.
- `gain` - opcjonalny zysk w dB; puste pole jest traktowane jak 0 dB.

## Wyniki

- `thermal noise floor` - szum termiczny `kTB` w dBm dla podanego pasma.
- `noise floor with NF` - podloga szumowa po dodaniu noise figure.
- `minimum detectable signal` - poziom wymagany dla zadanego SNR.
- `sensitivity estimate` - estymacja czulosci z uwzglednieniem opcjonalnego zysku.

## Zalozenia

- Gestosc szumu termicznego jest liczona jako `10 log10(kT / 1 mW)` w dBm/Hz.
- Podloga szumowa w pasmie: `N = N0 + 10 log10(B)`.
- `noise floor with NF = N + NF`.
- `minimum detectable signal = noise floor with NF + required SNR`.
- `sensitivity estimate = minimum detectable signal - gain`.
- Puste pole gain oznacza `0 dB`.

## Walidacja

- `bandwidth > 0`
- `temperature > 0`
- `noise figure`, `required SNR` i `gain` musza byc liczbami skonczonymi.

## Trasa URL

`/calculators/receiver-noise`

## Plik logiki

`lib/calculators/receiverNoise.ts`

## Plik testow

`tests/receiverNoise.test.ts`

## Ryzyka matematyczne

- To uproszczony model budzetu szumowego; nie zastepuje analizy kaskady zyskow i noise figure poszczegolnych stopni.
- Opcjonalny gain jest traktowany jako prosty budzet dB i nie zmienia samej noise figure.
- Wynik zalezy liniowo w dB od pasma; bledna szerokosc pasma jest najczestszym zrodlem duzego bledu.
