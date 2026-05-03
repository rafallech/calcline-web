# Wavelength and Electrical Length

## Cel

Kalkulator przelicza częstotliwość, przenikalność efektywną i długość fizyczną na długość fali oraz długość elektryczną. Ma służyć jako podstawowe narzędzie pomocnicze dla kolejnych kalkulatorów linii transmisyjnych, dopasowań i anten.

## Wejścia

- `frequency`: częstotliwość,
- `frequencyUnit`: jednostka częstotliwości: `Hz`, `kHz`, `MHz`, `GHz`,
- `epsEff`: efektywna przenikalność względna,
- `physicalLength`: długość fizyczna,
- `lengthUnit`: jednostka długości: `mm`, `cm`, `m`.

## Wyniki

- `lambda0`: długość fali w wolnej przestrzeni,
- `lambdaG`: długość fali prowadzona w ośrodku o `eps_eff`,
- `lengthInWavelengths`: długość fizyczna wyrażona jako ułamek `lambdaG`,
- `electricalLengthDeg`: długość elektryczna w stopniach,
- `electricalLengthRad`: długość elektryczna w radianach.

## Założenia

- Model używa prędkości światła `c = 299792458 m/s`.
- Propagacja jest TEM albo quasi-TEM.
- `eps_eff` jest stałe w częstotliwości.
- Długość fali prowadzona jest liczona jako `lambdaG = lambda0 / sqrt(eps_eff)`.
- Długość elektryczna nie jest redukowana modulo `360 deg`; wynik pokazuje pełną długość elektryczną podanego odcinka.

## Walidacja

- `frequency > 0`,
- `eps_eff >= 1`,
- `physicalLength >= 0`,
- wszystkie wartości liczbowe muszą być skończone,
- jednostki muszą należeć do obsługiwanych list.

Typowe błędy formularza zwracane są w strukturze `CalculatorCalculation`, bez rzucania wyjątków.

## Proponowane pliki

- logika: `lib/calculators/wavelength.ts`,
- testy: `tests/wavelength.test.ts`,
- UI: `app/calculators/wavelength/page.tsx`,
- komponent UI: `app/calculators/wavelength/WavelengthCalculator.tsx`.

## Wzory

```text
f_Hz = frequency * unitScale
lambda0 = c / f_Hz
lambdaG = lambda0 / sqrt(eps_eff)
lengthInWavelengths = physicalLength_m / lambdaG
electricalLengthDeg = lengthInWavelengths * 360
electricalLengthRad = lengthInWavelengths * 2 * pi
```

## Ryzyka matematyczne

- Użytkownik może oczekiwać długości elektrycznej modulo `360 deg`; kalkulator pokazuje wartość całkowitą.
- `eps_eff` jest modelem wejściowym użytkownika i nie jest wyliczane z geometrii linii.
- Dla linii dyspersyjnych wynik jest poprawny tylko dla podanej częstotliwości i założonego `eps_eff`.
- Dokładność zależy od poprawnego wyboru jednostek częstotliwości i długości.

