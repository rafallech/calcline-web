# Smith Chart - minimalna wersja funkcji

## Zakres

Minimalna wersja funkcji Smith Chart ma dodać wspólną warstwę danych do rysowania wykresu Smitha dla czterech istniejących kalkulatorów:

- VSWR Calculation,
- Load Impedance Calculation,
- Impedance Transformation,
- Single Stub Matching Circuit.

Funkcja nie powinna zmieniać wzorów kalkulatorów. Wykres ma być widokiem wyników obliczeń, z danymi przygotowanymi poza UI.

## Cele

- Pokazać położenie impedancji lub admitancji na wykresie Smitha.
- Ujednolicić sposób wyznaczania punktów przez współczynnik odbicia Gamma.
- Dodać ślady transformacji wzdłuż linii transmisyjnej tam, gdzie kalkulator operuje odległością.
- Przygotować API, które da się przetestować jednostkowo bez renderowania SVG lub canvas.
- Zachować zgodność z aktualną strukturą projektu: obliczenia w `lib/calculators`, wspólna matematyka w `lib/math`, komponent rysujący w `components`.

## Założenia matematyczne

- Wykres przedstawia znormalizowaną impedancję `z = r + jx` lub admitancję `y = g + jb`.
- Punkt na wykresie jest reprezentowany przez współczynnik odbicia:

```text
Gamma = (z - 1) / (z + 1)
z = (1 + Gamma) / (1 - Gamma)
y = 1 / z
```

- Dla admitancji wejściowej punkt można wyznaczyć przez `z = 1 / y`.
- Dla linii bezstratnej transformacja wzdłuż linii porusza punkt po okręgu stałego `|Gamma|`.
- Odległość `0.5 lambda` odpowiada pełnemu obrotowi na wykresie Smitha.
- Minimalna wersja rysuje tylko wnętrze jednostkowego koła `|Gamma| < 1`; przypadki graniczne i aktywne `|Gamma| >= 1` są odrzucane przez walidację danych wykresu.

## Dane wejściowe wspólnego modelu

Proponowany wspólny typ danych:

```ts
export type SmithPoint = {
  id: string;
  label: string;
  gamma: Complex;
  z?: Complex;
  y?: Complex;
};

export type SmithTrace = {
  id: string;
  label: string;
  points: SmithPoint[];
  direction?: "towardsGenerator" | "towardsLoad";
};

export type SmithChartData = {
  points: SmithPoint[];
  traces: SmithTrace[];
  warnings: string[];
};
```

Generator danych wykresu powinien przyjmować wyniki istniejących kalkulatorów, a nie odczytywać stan formularza z komponentów React. Dzięki temu UI pozostaje tylko konsumentem gotowych punktów i śladów.

## Dane wyjściowe

Minimalny komponent Smith Chart powinien dostać:

- listę punktów z etykietami,
- listę śladów jako uporządkowane próbki punktów,
- ostrzeżenia, jeżeli wynik jest poprawny liczbowo, ale wykres jest częściowy,
- brak danych, jeżeli kalkulator zwrócił `ok: false`.

Komponent prezentacyjny powinien przeliczać `Gamma` na współrzędne rysunku:

```text
x = Re(Gamma)
y = -Im(Gamma)
```

Znak minus dla osi `y` wynika z układu współrzędnych SVG/canvas.

## VSWR Calculation

### Dane wejściowe

- `VswrResult.gamma`,
- `VswrResult.z`,
- `VswrResult.y`,
- `VswrResult.vswr`,
- `VswrResult.magGamma`,
- `VswrResult.argGammaDeg`.

### Dane wyjściowe

- punkt impedancji `z`,
- opcjonalnie ten sam punkt opisany admitancją `y`,
- okrąg stałego `|Gamma|` jako ślad referencyjny.

### Punkty i ślady

- `load`: punkt `Gamma` wynikający z wybranego typu wejścia.
- `constant-vswr`: ślad po okręgu o promieniu `|Gamma|`, próbkowany np. co 2-5 stopni.

Minimalna wersja nie musi rysować siatki stałego `r`, `x`, `g` i `b`; wystarczy jednostkowe koło, oś rzeczywista, punkt oraz okrąg VSWR.

## Load Impedance Calculation

### Dane wejściowe

- `LoadImpedanceResult.zL`,
- `LoadImpedanceResult.r`,
- `LoadImpedanceResult.x`,
- wejścia kalkulatora: `lambdaMm`, `dMm`, `swr`, `minimumType`.

### Dane wyjściowe

- punkt obciążenia `zL`,
- punkt minimum fali użyty do wyznaczenia obciążenia,
- ślad od minimum do obciążenia po okręgu stałego SWR.

### Punkty i ślady

- `load`: `zL` przeliczone na `Gamma`.
- `minimum`: punkt referencyjny minimum:
  - dla minimum napięcia `Gamma = -|Gamma| + j0`,
  - dla minimum prądu `Gamma = |Gamma| + j0`.
- `minimum-to-load`: ślad od punktu minimum do punktu obciążenia, z kierunkiem zgodnym z aktualnym wzorem kalkulatora.

Minimalna wersja powinna użyć wyniku `zL` jako źródła prawdy dla punktu końcowego. Jeżeli próbkowany ślad nie trafia dokładnie w `zL` przez okresowość tangensa, ostatnia próbka powinna być jawnie ustawiona na punkt `load`.

## Impedance Transformation

### Dane wejściowe

- wejściowe `rL`, `xL`,
- `ImpedanceTransformResult.zTransformed`,
- `lambdaMm`,
- `dMm`,
- `direction`.

### Dane wyjściowe

- punkt startowy `zL`,
- punkt końcowy `zTransformed`,
- ślad transformacji wzdłuż linii.

### Punkty i ślady

- `start`: wejściowe `zL = rL + jxL`.
- `end`: wynik `zTransformed`.
- `transform`: próbki transformacji od `0` do `d / lambda`.

Dla `direction = "generator"` ślad idzie zgodnie z dodatnim dystansem używanym w kalkulatorze. Dla `direction = "load"` dystans jest ujemny, zgodnie z aktualnym wzorem `signedDistanceMm = -dMm`.

## Single Stub Matching Circuit

### Dane wejściowe

- wejściowe `rL`, `xL`, `z0Ohm`,
- `SingleStubResult.solution1`,
- `SingleStubResult.solution2`,
- `configuration`.

### Dane wyjściowe

- punkt obciążenia,
- dla każdego rozwiązania punkt w miejscu podłączenia stuba,
- dla każdego rozwiązania ślad od obciążenia do miejsca podłączenia stuba,
- opcjonalny punkt dopasowania w centrum wykresu po dodaniu stuba.

### Punkty i ślady

- `load`: wejściowa impedancja obciążenia znormalizowana do `Z0`, czyli `zL = (R_L + jX_L) / Z0`.
- `solution-1-stub-position`: punkt po przesunięciu o `solution1.dOverLambda`.
- `solution-2-stub-position`: punkt po przesunięciu o `solution2.dOverLambda`.
- `solution-1-trace`: ślad od obciążenia do pierwszego miejsca stuba.
- `solution-2-trace`: ślad od obciążenia do drugiego miejsca stuba.
- `matched`: centrum wykresu `Gamma = 0`, rysowane jako wspólny punkt docelowy.

Dla konfiguracji równoległych naturalnym widokiem pomocniczym jest admitancja. Minimalna wersja może nadal rysować punkty przez równoważną impedancję, ale etykiety powinny wskazywać, czy rozwiązanie pochodzi z układu szeregowego czy równoległego.

Model Single Stub zakłada, że impedancja stuba jest równa impedancji linii głównej `Z0`; wykres nie tworzy dodatkowej geometrii dla innej impedancji stuba.

## Walidacja

Walidacja danych wykresu powinna być oddzielona od walidacji formularza:

- `Gamma` musi być skończone: `Number.isFinite(re)` i `Number.isFinite(im)`.
- Minimalna wersja akceptuje tylko `|Gamma| < 1`.
- Impedancja znormalizowana musi mieć skończone `re` i `im`.
- Dla konwersji `z -> Gamma` wartość `z + 1` nie może prowadzić do dzielenia przez zero.
- Dla admitancji `y -> z` wartość `|y|` nie może być zerowa.
- Liczba próbek śladu powinna być ograniczona stałą, np. 64 lub 128 punktów.
- Odległości śladów powinny być skończone i nieujemne na wejściu publicznego API; znak kierunku powinien wynikać z trybu kalkulatora.
- Jeżeli kalkulator zwróci `ok: false`, nie generować danych wykresu.

Błędy typowo formularzowe nadal powinny pozostać w kalkulatorach. Generator Smith Chart powinien zwracać pusty wykres z ostrzeżeniem tylko wtedy, gdy wynik kalkulatora jest poprawny, ale nie da się go narysować w minimalnym zakresie.

## Struktura plików

Proponowane nowe pliki:

```text
lib/math/smith.ts
lib/calculators/smithChart.ts
components/SmithChart.tsx
tests/smithMath.test.ts
tests/smithChartData.test.ts
```

Zakres odpowiedzialności:

- `lib/math/smith.ts`: czyste funkcje matematyczne, np. `gammaFromNormalizedImpedance`, `normalizedImpedanceFromGamma`, `normalizeDistanceOverLambda`, `sampleConstantGammaCircle`, `sampleTransmissionLineTrace`.
- `lib/calculators/smithChart.ts`: adaptery wyników kalkulatorów do `SmithChartData`, np. `smithDataFromVswr`, `smithDataFromLoadImpedance`, `smithDataFromImpedanceTransform`, `smithDataFromSingleStub`.
- `components/SmithChart.tsx`: komponent prezentacyjny rysujący jednostkowe koło, osie, punkty, etykiety i ślady.
- `tests/smithMath.test.ts`: testy konwersji matematycznych.
- `tests/smithChartData.test.ts`: testy kontraktu danych dla czterech kalkulatorów.

W późniejszym etapie można dodać siatkę stałych rezystancji i reaktancji jako osobny komponent lub moduł danych, ale nie jest to wymagane w minimalnej wersji.

## Plan testów

### Testy jednostkowe matematyki

- `z = 1 + j0` daje `Gamma = 0 + j0`.
- `z = 0 + j0` daje `Gamma = -1 + j0` i jest odrzucone przez minimalny widok, jeżeli wymagane jest `|Gamma| < 1`.
- `z = 2 + j1` po konwersji do `Gamma` i z powrotem daje pierwotne `z` w tolerancji numerycznej.
- `y = 0.4 - j0.2` daje ten sam punkt co `z = 2 + j1`.
- Próbki transformacji linii mają stałe `|Gamma|` w tolerancji numerycznej.
- Dystans `0.5 lambda` kończy w tym samym punkcie co start.

### Testy adapterów kalkulatorów

- VSWR: wynik dla `VSWR = 3`, `arg(Gamma) = 30 deg` tworzy punkt `load` i ślad `constant-vswr` o promieniu `0.5`.
- Load Impedance: dla minimum napięcia punkt `minimum` leży po lewej stronie osi rzeczywistej, a punkt `load` odpowiada `zL` z kalkulatora.
- Load Impedance: dla minimum prądu punkt `minimum` leży po prawej stronie osi rzeczywistej.
- Impedance Transformation: `start` odpowiada wejściowemu `rL + jxL`, `end` odpowiada `zTransformed`, a ślad ma co najmniej dwa punkty.
- Impedance Transformation: kierunki `generator` i `load` dla tej samej odległości dają przeciwne kierunki ruchu po okręgu.
- Single Stub: oba rozwiązania tworzą osobne punkty i ślady.

### Testy komponentu

- Komponent bez danych pokazuje pusty stan zamiast rzucać wyjątek.
- Komponent z jednym punktem renderuje punkt i etykietę.
- Komponent ze śladem renderuje element ścieżki.
- Współrzędne SVG mieszczą się w obszarze widoku dla `|Gamma| < 1`.

### Testy regresyjne istniejących kalkulatorów

Po dodaniu adapterów uruchamiać:

```text
npm test -- tests/vswr.test.ts tests/loadImpedance.test.ts tests/impedanceTransform.test.ts tests/singleStub.test.ts tests/smithMath.test.ts tests/smithChartData.test.ts
```

Jeżeli zmieniany będzie komponent UI Smith Chart, dodać test smoke albo test dostępności sprawdzający, że kalkulatory nadal renderują wyniki bez błędów.
