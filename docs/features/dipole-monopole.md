# Dipole and Monopole Antenna

## Cel

Kalkulator wyznacza podstawowe długości elementów dla anteny półfalowej dipolowej i ćwierćfalowej monopolowej na podstawie częstotliwości oraz współczynnika skrócenia. Docelowo ten sam kalkulator ma zostać rozbudowany o trzeci tryb: `Folded Dipole Calculator`.

## Wejścia

- `frequency` w MHz,
- `velocity factor` jako liczba od 0 do 1,
- `antenna type`: `half-wave dipole`, `quarter-wave monopole` albo `folded dipole`.

## Wyniki

- długość fali w wolnej przestrzeni,
- długość fali skorygowana przez velocity factor,
- całkowita długość dipola półfalowego,
- długość jednego ramienia dipola,
- długość monopola ćwierćfalowego,
- rekomendowana długość dla wybranego typu anteny.

## Model

```text
lambda0 = c / f
lambda_corrected = lambda0 * VF
dipole_total = lambda_corrected / 2
dipole_arm = lambda_corrected / 4
monopole = lambda_corrected / 4
```

## Walidacja

- `frequency > 0`,
- `0 < velocity factor <= 1`,
- typ anteny musi być jednym z obsługiwanych wariantów.

## Założenia i ograniczenia

- Model jest prostym oszacowaniem długości fizycznej przewodnika.
- Nie uwzględnia średnicy przewodnika, efektów końcowych, wysokości nad ziemią, przeciwwag, baluna, wpływu otoczenia ani strojenia impedancji.
- Wyniki są punktem startowym do strojenia anteny pomiarem.

## Folded Dipole Calculator

Tryb `Folded Dipole Calculator` ma rozszerzać istniejący kalkulator o projektowy model folded dipole z geometrią typu rounded loop. UI powinien pokazywać czytelny schemat z wymiarami `A`, `B`, `C`, `D`, `R`, `Gap` oraz `Total conductor length`, podobnie do klasycznych kalkulatorów folded dipole, ale bez kopiowania kodu ani algorytmu z zewnętrznych stron.

Model ma być własnym, jawnym modelem projektowym opartym na opisanych założeniach i wzorach. Wszystkie wzory muszą znajdować się w `lib/calculators/dipoleMonopole.ts`, a komponent React ma tylko zbierać wejścia i renderować wyniki.

### Założenia modelu

- Folded dipole jest pętlą z dwóch równoległych przewodników połączonych na końcach.
- Całkowita długość przewodnika pętli jest bliska jednej długości fali po uwzględnieniu współczynnika skrócenia.
- Wymiar całkowity anteny od końca do końca jest bliski połowie długości fali.
- Dla dwóch przewodników o tej samej średnicy impedancja wejściowa folded dipole jest około `4` razy większa niż impedancja zwykłego dipola.
- Typowa impedancja folded dipole w wolnej przestrzeni to około `280` do `300 ohm`.
- Wyniki są projektowym punktem startowym i wymagają weryfikacji pomiarem albo symulacją NEC.

### Wejścia

- `frequency`: częstotliwość projektowa.
- `frequencyUnit`: `MHz` albo `GHz`.
- `velocityFactor`: współczynnik skrócenia, domyślnie `0.95`.
- `rodDiameter`: średnica pręta lub rurki.
- `rodDiameterUnit`: `mm` albo `inch`.
- `spacing`: odstęp między równoległymi przewodnikami, mierzony center-to-center.
- `spacingUnit`: `mm` albo `inch`.
- `feedGap`: przerwa zasilania w środku elementu.
- `feedGapUnit`: `mm` albo `inch`.
- `feedLineImpedance`: impedancja linii zasilającej.
- `feedLineImpedanceOption`: `50 ohm`, `75 ohm`, `300 ohm` albo `custom`.
- `matchingOption`: `none`, `4:1 balun` albo `quarter-wave transformer`.

Domyślne wartości dla trybu folded dipole:

- `frequency = 100 MHz`,
- `frequencyUnit = MHz`,
- `velocityFactor = 0.95`,
- `rodDiameter = 6 mm`,
- `spacing = 50 mm`,
- `feedGap = 20 mm`,
- `feedLineImpedance = 75 ohm`,
- `matchingOption = 4:1 balun`.

### Wyniki

- `freeSpaceWavelength`: długość fali w wolnej przestrzeni.
- `correctedWavelength`: długość fali po uwzględnieniu `velocityFactor`.
- `overallAntennaLength`: całkowity wymiar anteny od końca do końca, startowo bliski `correctedWavelength / 2`.
- `bendRadius`: promień zaokrąglonych końców pętli.
- `centerToCenterSpacing`: odstęp między równoległymi przewodnikami.
- `straightSectionLength`: długość prostego odcinka równoległych przewodników.
- `feedGap`: przerwa zasilania.
- `rodDiameter`: średnica pręta lub rurki.
- `totalConductorLength`: przybliżona długość przewodnika pętli.
- `estimatedFeedImpedance`: przybliżona impedancja wejściowa folded dipole.
- `recommendedMatching`: rekomendacja dopasowania dla wybranej impedancji linii.
- `quarterWaveTransformerImpedance`: impedancja transformatora ćwierćfalowego, jeśli wybrano `quarter-wave transformer`.
- `quarterWaveTransformerLength`: długość transformatora ćwierćfalowego, jeśli wybrano `quarter-wave transformer`.
- `warnings`: ostrzeżenia projektowe i walidacyjne.

### Geometria wynikowa

Nazwy wymiarów w UI:

- `A`: całkowita długość anteny od końca do końca.
- `B`: długość prostego odcinka górnego przewodnika między zaokrąglonymi końcami.
- `C`: odstęp center-to-center między równoległymi przewodnikami.
- `D`: średnica pręta lub rurki.
- `R`: promień gięcia na końcach pętli.
- `Gap`: przerwa zasilania w środku dolnego przewodnika.
- `Total conductor length`: przybliżona całkowita długość przewodnika potrzebna do wykonania pętli.

Proponowany model geometryczny:

```text
lambda0 = c / f
lambda_corrected = lambda0 * velocityFactor
A = lambda_corrected / 2
C = spacing
D = rodDiameter
R = C / 2
B = max(A - 2R, 0)
Gap = feedGap
Total conductor length ~= 2B + 2piR - Gap
```

Uwaga: ten model traktuje folded dipole jako rounded loop z dwoma prostymi odcinkami i dwoma półokrągłymi końcami. W praktyce promień gięcia, sposób mocowania, zaciski zasilania i średnica przewodnika zmienią rezonans.

### Model impedancji i dopasowania

Przybliżenia:

```text
straight_dipole_impedance ~= 73 ohm
folded_transformation_ratio ~= 4
estimated_feed_impedance ~= straight_dipole_impedance * folded_transformation_ratio
```

Dla dwóch przewodników o tej samej średnicy wynik powinien typowo dawać około `292 ohm`, zgodnie z założeniem `4 * 73 ohm`.

Dopasowanie:

- `none`: pokaż niedopasowanie względem wybranej linii zasilającej.
- `4:1 balun`: pokaż oszacowaną impedancję po transformacji `estimatedFeedImpedance / 4` i ostrzeż, że balun nie zastępuje pomiaru.
- `quarter-wave transformer`: policz `quarterWaveTransformerImpedance = sqrt(estimatedFeedImpedance * feedLineImpedance)` oraz `quarterWaveTransformerLength = correctedWavelength / 4`, z wyraźną informacją, że rzeczywista długość zależy od współczynnika skrócenia użytej linii transformatora.

### Walidacja

- `frequency > 0`,
- `frequencyUnit` musi być `MHz` albo `GHz`,
- `0 < velocityFactor <= 1`,
- `rodDiameter > 0`,
- `spacing > 0`,
- `feedGap >= 0`,
- `feedLineImpedance > 0`,
- `matchingOption` musi być jednym z obsługiwanych wariantów,
- wszystkie wartości wejściowe muszą być skończone.

Dodatkowe ostrzeżenia:

- `spacing` powinien być większy niż `rodDiameter`,
- bardzo duży `feedGap` względem `overallAntennaLength` może zaburzać model,
- `rodDiameter / wavelength` poza typowym zakresem powinien generować ostrzeżenie.

### Ostrzeżenia

Tryb folded dipole powinien zawsze zwracać ostrzeżenia:

- Folded dipole dimensions are approximate.
- Element diameter, spacing, mounting and environment affect resonance.
- Feed impedance estimate is approximate.
- Verify with VNA, NEC simulation or measurement before final construction.

### Plan testów

- poprawna konwersja `MHz` i `GHz`,
- poprawne liczenie `freeSpaceWavelength` i `correctedWavelength`,
- domyślny przypadek `100 MHz`, `VF = 0.95`,
- `overallAntennaLength ~= correctedWavelength / 2`,
- `estimatedFeedImpedance ~= 292 ohm` dla dwóch równych przewodników,
- `4:1 balun` daje impedancję po transformacji bliską `73 ohm`,
- `quarter-wave transformer` liczy impedancję `sqrt(Zfolded * Zline)`,
- `quarter-wave transformer` liczy długość `correctedWavelength / 4`,
- walidacja odrzuca częstotliwość `<= 0`,
- walidacja odrzuca `velocityFactor <= 0` i `> 1`,
- walidacja odrzuca `rodDiameter <= 0`,
- walidacja odrzuca `spacing <= 0`,
- walidacja odrzuca `feedLineImpedance <= 0`,
- ostrzeżenie dla `spacing <= rodDiameter`,
- ostrzeżenia folded dipole są zawsze obecne.

## Pliki

- Logika: `lib/calculators/dipoleMonopole.ts` albo istniejący plik kalkulatora.
- Strona: istniejąca strona `app/calculators/dipole-monopole/page.tsx`.
- UI: istniejący komponent `app/calculators/dipole-monopole/DipoleMonopoleCalculator.tsx`.
- Testy: `tests/dipoleMonopole.test.ts`.
- Ikona: `public/icons/calculators/dipole-monopole.svg`
