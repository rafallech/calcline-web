# Matching comparison - porównanie wariantów dopasowania

## Zakres

Funkcja ma porównywać dwa warianty dopasowania zwracane przez kalkulatory:

- Single Stub Matching Circuit,
- L-section Matching Network.

Minimalna wersja nie zmienia algorytmów kalkulatorów. Porównanie jest osobną warstwą interpretacji wyników: przyjmuje istniejące `solution1` i `solution2`, wylicza metryki pomocnicze i prezentuje je obok wyników.

## Cele

- Pomóc użytkownikowi szybko zobaczyć różnice między dwoma poprawnymi rozwiązaniami.
- Wyróżnić wariant praktycznie korzystniejszy według jawnych, prostych kryteriów.
- Nie ukrywać alternatywnego rozwiązania, bo oba warianty mogą być poprawne w zależności od technologii wykonania.
- Zachować porównanie poza UI, aby można je było testować jednostkowo.

## Zakres danych

### Single Stub

Dane wejściowe do porównania:

- `configuration`: `openSeries`, `shortSeries`, `openShunt`, `shortShunt`,
- `z0Ohm`,
- `solution1.dOverLambda`,
- `solution1.lOverLambda`,
- `solution2.dOverLambda`,
- `solution2.lOverLambda`,
- `warnings` z kalkulatora.

Dane wyjściowe dla każdego wariantu:

- numer rozwiązania: `1` albo `2`,
- `dOverLambda`,
- `lOverLambda`,
- długość elektryczna stuba w stopniach: `lOverLambda * 360`,
- odległość po linii w stopniach: `dOverLambda * 360`,
- flaga `recommended`,
- lista powodów lub ostrzeżeń dotyczących wariantu.

### L-section Matching Network

Dane wejściowe do porównania:

- `rL`,
- `xL`,
- `z0Ohm`,
- `fMHz`,
- `solution1.xOhm`,
- `solution1.bS`,
- `solution1.seriesElement`,
- `solution1.parallelElement`,
- `solution2.xOhm`,
- `solution2.bS`,
- `solution2.seriesElement`,
- `solution2.parallelElement`.

Dane wyjściowe dla każdego wariantu:

- numer rozwiązania: `1` albo `2`,
- `xOhm`,
- `bS` i `bMs`,
- typ elementu szeregowego: `Ls` albo `Cs`,
- wartość elementu szeregowego,
- typ elementu równoległego: `Lp` albo `Cp`,
- wartość elementu równoległego,
- flaga `recommended`,
- lista powodów lub ostrzeżeń dotyczących wariantu.

## Metryki porównania

### Single Stub

Metryki podstawowe:

- `dOverLambda`: odległość od obciążenia do miejsca podłączenia stuba.
- `lOverLambda`: długość stuba.
- `totalLineOverLambda = dOverLambda + lOverLambda`: prosta miara łącznej długości struktury.
- `stubElectricalLengthDeg = lOverLambda * 360`.
- `distanceElectricalLengthDeg = dOverLambda * 360`.
- `isShortStub = lOverLambda <= 0.25`: stub nie dłuższy niż ćwierć fali.
- `isVeryShortStub = lOverLambda < 0.02`: wariant potencjalnie trudny wykonawczo.
- `isNearHalfWaveStub = lOverLambda > 0.48`: wariant potencjalnie niepraktyczny, blisko pół fali.

Metryki opcjonalne w późniejszej wersji:

- długości w milimetrach po podaniu `lambda`,
- dodatkowe kryterium strat lub tolerancji technologicznej.

### L-section Matching Network

Metryki podstawowe:

- `absX = abs(xOhm)`: bezwzględna wartość reaktancji szeregowej.
- `absB = abs(bS)`: bezwzględna wartość susceptancji równoległej.
- `seriesElementType`: `Ls` albo `Cs`.
- `parallelElementType`: `Lp` albo `Cp`.
- `reactiveMagnitudeScore`: bezwymiarowy wynik porównawczy oparty na znormalizowanych `absX` i `absB`.
- `componentPracticalityScore`: kara za elementy bardzo małe albo bardzo duże.
- `usesCapacitorsOnly`: wariant z elementami pojemnościowymi po obu stronach.
- `usesInductorsOnly`: wariant z elementami indukcyjnymi po obu stronach.
- `mixedElements`: wariant z jednym L i jednym C.

Proponowane progi praktyczności dla elementów w minimalnej wersji:

- kondensator `< 0.1 pF`: bardzo mały, trudny do realizacji,
- kondensator `> 1000 pF`: bardzo duży dla typowych zastosowań RF,
- indukcyjność `< 0.5 nH`: bardzo mała,
- indukcyjność `> 10000 nH`: bardzo duża.

Te progi powinny być opisane jako heurystyka, nie jako reguła projektowa.

## Sposób prezentacji

### Układ wspólny

Na stronie kalkulatora dodać sekcję `Comparison` pod wynikami albo obok wykresu, zależnie od miejsca:

- dwie karty: `Solution #1` i `Solution #2`,
- identyczny układ pól na obu kartach,
- etykieta `Recommended` przy wariancie wybranym przez heurystykę,
- lista powodów wyboru,
- ostrzeżenia widoczne bez ukrywania drugiego wariantu.

Minimalna tabela porównawcza:

```text
Metric                  Solution #1      Solution #2
d / lambda              ...              ...
l / lambda              ...              ...
total length / lambda   ...              ...
recommendation          yes/no           yes/no
```

Dla L-section:

```text
Metric                  Solution #1      Solution #2
X                       ...              ...
B                       ...              ...
series element          ...              ...
parallel element        ...              ...
recommendation          yes/no           yes/no
```

### Single Stub

Pokazać:

- `d / lambda`,
- `l / lambda`,
- `d + l`,
- długości elektryczne w stopniach,
- typ konfiguracji.

Jeżeli Smith Chart jest widoczny, przełącznik rozwiązania może używać tej samej wartości co sekcja porównania. Wariant rekomendowany może być domyślnie wybrany, ale użytkownik musi móc przełączyć na drugi wariant.

### L-section Matching Network

Pokazać:

- `X` w omach,
- `B` w mS,
- typ i wartość elementu szeregowego,
- typ i wartość elementu równoległego,
- informację, czy wariant używa `L/C`, `L/L` lub `C/C`,
- ostrzeżenia o elementach poza prostym zakresem praktyczności.

## Kryteria wyróżnienia lepszego wariantu

### Zasady ogólne

Rekomendacja jest heurystyką. UI powinien używać sformułowań typu:

- `Recommended by default`,
- `Shorter physical implementation`,
- `More practical element values`.

Nie używać komunikatu sugerującego, że drugi wariant jest błędny.

Jeżeli wynik metryk jest remisowy albo różnica jest mała, nie wyróżniać jednoznacznie lepszego wariantu. W takim przypadku pokazać `No clear default`.

### Single Stub

Domyślna heurystyka:

1. Odrzuć wariant z niefinitowymi wartościami.
2. Preferuj mniejsze `totalLineOverLambda = dOverLambda + lOverLambda`.
3. Jeżeli różnica `totalLineOverLambda` jest mniejsza niż `0.02 lambda`, preferuj krótszy stub `lOverLambda`.
4. Dodaj karę dla `lOverLambda < 0.02`, bo stub może być zbyt krótki wykonawczo.
5. Dodaj karę dla `lOverLambda > 0.48`, bo stub jest blisko pół fali.
6. Jeżeli po karach różnica nadal jest mała, zwróć brak jednoznacznej rekomendacji.

Powody rekomendacji:

- `shorter total line length`,
- `shorter stub`,
- `avoids very short stub`,
- `avoids near-half-wave stub`.

### L-section Matching Network

Domyślna heurystyka:

1. Odrzuć wariant z niefinitowymi wartościami.
2. Dodaj karę za elementy poza zakresem praktyczności.
3. Preferuj wariant bez ekstremalnie małych elementów.
4. Jeżeli oba warianty są praktyczne, preferuj mniejsze znormalizowane wartości `absX` i `absB`.
5. Jeżeli różnica jest mała, nie wskazuj jednoznacznie lepszego wariantu.

Proponowany wynik pomocniczy:

```text
score = normalizedAbsX + normalizedAbsB + practicalityPenalty
```

Gdzie:

- `normalizedAbsX = abs(xOhm) / z0Ohm`,
- `normalizedAbsB = abs(bS) * z0Ohm`,
- `practicalityPenalty` jest sumą kar za bardzo małe albo bardzo duże elementy.

Powody rekomendacji:

- `lower normalized reactance and susceptance`,
- `more practical component values`,
- `avoids very small capacitor`,
- `avoids very large inductor`.

## Proponowana struktura plików

W późniejszej implementacji:

```text
lib/calculators/matchingComparison.ts
components/MatchingComparison.tsx
tests/matchingComparison.test.ts
```

Zakres odpowiedzialności:

- `lib/calculators/matchingComparison.ts`: czyste funkcje porównujące wyniki Single Stub i L-section.
- `components/MatchingComparison.tsx`: prezentacja kart, tabel i wyróżnień.
- `tests/matchingComparison.test.ts`: testy scoringu, remisów i ostrzeżeń.

Porównanie powinno przyjmować wyniki kalkulatorów oraz potrzebne wejścia, ale nie powinno samo wywoływać kalkulatorów.

## Plan testów

### Testy Single Stub

- Dwa poprawne warianty zwracają dwie pozycje porównania.
- Wariant z mniejszym `dOverLambda + lOverLambda` dostaje rekomendację.
- Przy różnicy mniejszej niż `0.02 lambda` wygrywa krótszy stub.
- Stub `lOverLambda < 0.02` dostaje ostrzeżenie praktyczności.
- Stub `lOverLambda > 0.48` dostaje ostrzeżenie praktyczności.
- Remis lub prawie remis zwraca brak jednoznacznej rekomendacji.
- Ostrzeżenia zwrócone przez kalkulator są zachowane w danych porównania.

### Testy L-section

- Dwa poprawne warianty zwracają dwie pozycje porównania.
- Wariant z mniejszym `score` dostaje rekomendację.
- Wariant z kondensatorem `< 0.1 pF` dostaje ostrzeżenie.
- Wariant z indukcyjnością `< 0.5 nH` dostaje ostrzeżenie.
- Wariant z kondensatorem `> 1000 pF` dostaje ostrzeżenie.
- Wariant z indukcyjnością `> 10000 nH` dostaje ostrzeżenie.
- Przy bardzo podobnych wynikach funkcja zwraca brak jednoznacznej rekomendacji.
- Typy elementów `Ls`, `Cs`, `Lp`, `Cp` są poprawnie przeniesione do danych porównania.

### Testy prezentacji

- Komponent porównania renderuje pusty stan, gdy kalkulator nie ma wartości.
- Komponent pokazuje dokładnie dwie karty dla dwóch rozwiązań.
- Tylko jedna karta ma etykietę rekomendacji, chyba że wynik jest remisem.
- Ostrzeżenia są widoczne przy odpowiednim wariancie.
- Przełącznik rozwiązania na stronie Single Stub może domyślnie wskazać wariant rekomendowany, ale użytkownik może wybrać drugi wariant.

### Testy regresyjne

Po implementacji uruchamiać:

```text
npm test -- tests/singleStub.test.ts tests/lMatch.test.ts tests/matchingComparison.test.ts
```

Jeżeli komponent porównania zostanie dodany do stron kalkulatorów, uruchamiać również pełny zestaw:

```text
npm test
npm run lint
```
