# Yagi-Uda Antenna Designer

## Cel

Kalkulator ma wyznaczać wstępne wymiary anteny Yagi-Uda na podstawie częstotliwości, liczby elementów i średnicy elementów. Głównym trybem projektowym jest `DL6WU Long-boom Yagi`, przeznaczony dla anten VHF, UHF i mikrofalowych jako punkt startowy do dalszej optymalizacji albo weryfikacji w symulatorze NEC.

Wynik nie jest gotową dokumentacją produkcyjną. The result is a design starting point. Final antenna dimensions depend on element diameter, mounting method, boom material, feed system and environment. Validate with NEC simulation or measurement before manufacturing.

Opcjonalny tryb `Simple Yagi` może zostać dodany jako wariant edukacyjny pokazujący typowe proporcje elementów względem długości fali. Nie powinien zastępować trybu DL6WU ani być prezentowany jako model wysokiej dokładności.

## Zakres częstotliwości

- Docelowy zakres użytkowy: VHF, UHF i microwave.
- Minimalny zakres walidacji w UI: `frequency > 0`.
- Zalecany zakres ostrzeżeń: od około `30 MHz` do `3 GHz`.
- Powyżej kilku GHz kalkulator powinien ostrzegać, że tolerancje mechaniczne, średnica elementów, sposób mocowania i zasilanie mają krytyczny wpływ na wynik.
- Poniżej VHF kalkulator może nadal liczyć geometrię, ale powinien ostrzegać o dużych wymiarach mechanicznych i ograniczonej użyteczności modelu.

## Model główny

Główny model: `DL6WU Long-boom Yagi`.

Założenia modelu DL6WU w pierwszej wersji:

- antena liniowa Yagi-Uda z jednym reflektorem, jednym elementem zasilanym i zestawem direktorów,
- boom jest prosty, elementy są ustawione prostopadle do boomu,
- pozycja `0` odpowiada reflektorowi,
- impedancja i układ dopasowania nie są rozwiązywane w pierwszej wersji,
- model generuje geometrię startową dla dalszej optymalizacji,
- wynik powinien zawierać ostrzeżenia zależne od typu boomu i typu elementu zasilanego.

DL6WU wymaga tabel albo zależności empirycznych dla długości elementów i odstępów. Przed implementacją logiki trzeba wybrać jedno jawne źródło danych referencyjnych oraz zapisać je w komentarzu kodu albo w dokumentacji kalkulatora. Nie należy ukrywać współczynników empirycznych w komponencie React.

## Tryb Simple Yagi

Tryb `Simple Yagi` jest sensowny jako opcja edukacyjna, jeśli UI jasno rozdzieli go od trybu DL6WU.

Zakres Simple Yagi:

- typowe, uproszczone proporcje elementów względem `lambda`,
- mała liczba elementów, np. `3` do `6`,
- reflektor nieco dłuższy od dipola półfalowego,
- direktorzy krótsi od elementu zasilanego,
- stałe odstępy jako ułamek długości fali.

Ograniczenie: Simple Yagi powinien zwracać mocne ostrzeżenie, że jest demonstracją zależności geometrycznych, a nie metodą projektowania anteny do wykonania.

## Driven element feed model

Kalkulator powinien rozróżniać geometrię elementu zasilanego od przybliżonego modelu zasilania. Wybór `drivenElementType` nie może zmieniać wymiarów reflektora ani direktorów. Wpływ folded dipole dotyczy głównie elementu zasilanego, impedancji startowej, zaleceń baluna i sekcji dopasowania.

### Straight dipole

Tryb `straight dipole` jest bazowym wariantem elementu zasilanego:

- używa długości elementu zasilanego wyznaczonej przez model geometryczny DL6WU-inspired,
- ma jeden przewodnik z punktem zasilania w środku,
- zwraca przybliżoną wartość `straightDrivenImpedanceEstimate`,
- nie stosuje transformacji impedancji folded dipole,
- może nadal wymagać baluna `1:1` albo innego układu dopasowania w rzeczywistej konstrukcji.

`straightDrivenImpedanceEstimate` nie jest dokładną impedancją wejściową anteny. W Yagi impedancja elementu zasilanego zależy od reflektora, direktorów, odstępów, średnicy elementów, boomu i zasilania.

### Folded dipole

Tryb `folded dipole` jest przybliżonym modelem folded dipole z przewodnikami o tej samej średnicy:

- folded dipole uses the same driven element full length as the straight driven element,
- two parallel conductors are connected at both ends,
- for equal conductor diameters the impedance transformation ratio is approximately 4:1 relative to the straight driven element,
- actual feed impedance in a Yagi depends on parasitic elements, element diameter, spacing, boom effects and feed construction,
- result must be treated as a starting estimate and verified in NEC or by measurement.

Założenia folded dipole w pierwszej implementacji:

- `foldedTransformationRatio = 4` dla jednakowych średnic przewodników,
- `foldedFeedImpedanceEstimate = straightDrivenImpedanceEstimate * foldedTransformationRatio`,
- `foldedDipoleSpacing` opisuje odstęp między równoległymi przewodnikami,
- `foldedDipoleLoopWidth` jest geometrycznie równy odstępowi folded dipole,
- `foldedDipoleConductorLength` jest przybliżoną długością pojedynczego przewodnika w pętli folded dipole, liczona jako długość elementu zasilanego plus dodatek na dwa końcowe połączenia,
- wartości impedancji i długości folded dipole są wynikami startowymi, nie modelem pełnofalowym.

Opcja `balunRatio` wpływa na ocenę dopasowania:

- `none`: brak transformacji balunem,
- `1:1`: symetryzacja bez zmiany impedancji,
- `4:1`: transformacja impedancji użyteczna dla folded dipole, jeśli oszacowana impedancja jest blisko czterokrotności impedancji linii.

Kalkulator powinien zwracać `recommendedBalun` i `feedMismatchWarning` na podstawie `drivenElementType`, oszacowanej impedancji wejściowej, `feedLineImpedance` i wybranego `balunRatio`. Ostrzeżenie powinno jasno mówić, że rzeczywiste dopasowanie wymaga NEC albo pomiaru.

## Założenia projektowe

- Częstotliwość projektowa jest częstotliwością środkową anteny.
- Długość fali liczona jest w wolnej przestrzeni:

```text
lambda = c / f
```

- Wszystkie długości wewnętrzne powinny być liczone w metrach, a na wyjściu formatowane do `mm` albo `cm`.
- `number of elements` obejmuje reflektor, element zasilany i wszystkie direktory.
- Minimalna liczba elementów dla DL6WU: `3`.
- Elementy są modelowane jako przewodniki cylindryczne o jednej średnicy.
- `element diameter` jest używany do korekcji geometrii albo do ostrzeżeń, zależnie od wybranego modelu pierwszej implementacji.
- `driven element type` wpływa na opis założeń, ostrzeżenia i późniejszy eksport, ale w pierwszej wersji nie musi rozwiązywać dopasowania.
- `boom type` wpływa na ostrzeżenia i późniejszą korekcję boomu.

## Ograniczenia modelu

- Model nie liczy pełnej impedancji wejściowej anteny.
- Model nie projektuje baluna, gamma match, hairpin match, transformatora ani innego układu dopasowania.
- Model nie uwzględnia strat materiałowych.
- Model nie uwzględnia wpływu masztu, kabla, obudowy, radomu ani otoczenia.
- Model nie zastępuje symulacji NEC ani pomiaru anteny.
- Bez korekcji boomu wynik może być niedokładny dla elementów przechodzących przez metalowy boom.
- Folded dipole zmienia impedancję i konstrukcję elementu zasilanego, ale nie oznacza automatycznie poprawnego dopasowania do `50 ohm`.
- Szacowany zysk i front-to-back ratio mają być opisane jako orientacyjne, jeśli są dostępne z użytego modelu.

## Dane wejściowe

- `frequency`: częstotliwość projektowa.
- `frequencyUnit`: `MHz` albo `GHz`.
- `numberOfElements`: całkowita liczba elementów anteny.
- `elementDiameter`: średnica elementów.
- `elementDiameterUnit`: `mm`.
- `boomType`: `dielectric`, `metal isolated` albo `metal through-boom`.
- `boomDiameterOrSide`: średnica boomu okrągłego albo bok boomu kwadratowego.
- `drivenElementType`: `straight dipole` albo `folded dipole`.
- `foldedDipoleSpacing`: odstęp między równoległymi przewodnikami folded dipole, domyślnie `20 mm`.
- `foldedDipoleSpacingUnit`: `mm`.
- `feedLineImpedance`: impedancja linii zasilającej, domyślnie `50 ohm`.
- `balunRatio`: `none`, `1:1` albo `4:1`, domyślnie `4:1`.
- `outputUnit`: `mm`, `cm` albo `inch`.
- Opcjonalnie później: `modelMode`: `DL6WU` albo `Simple Yagi`.

Walidacja:

- `frequency > 0`,
- `numberOfElements >= 3`,
- `numberOfElements` jest liczbą całkowitą,
- `elementDiameter > 0`,
- `boomDiameterOrSide >= 0`; wartość `0` może oznaczać brak korekcji boomu,
- `foldedDipoleSpacing > 0` gdy `drivenElementType = folded dipole`,
- `feedLineImpedance > 0`,
- jednostki i typy wyboru muszą należeć do obsługiwanych enumów,
- wszystkie liczby muszą być skończone.

## Wyniki

- `wavelength`: długość fali dla częstotliwości projektowej.
- `boomLength`: odległość od reflektora do ostatniego direktora.
- `elements`: tabela elementów:
  - `elementName`: `reflector`, `driven element`, `director 1`, `director 2`, etc.,
  - `positionFromReflector`,
  - `spacingFromPreviousElement`,
  - `elementLength`,
  - `halfElementLength`.
- `estimatedGain`: orientacyjny zysk, najlepiej w `dBi`, jeśli dostępny dla modelu i liczby elementów.
- `estimatedFrontToBackRatio`: orientacyjny front-to-back ratio, jeśli dostępny.
- `straightDrivenImpedanceEstimate`: przybliżona impedancja bazowego prostego elementu zasilanego.
- `foldedTransformationRatio`: dla folded dipole domyślnie `4` przy jednakowych średnicach przewodników.
- `foldedFeedImpedanceEstimate`: przybliżona impedancja folded dipole po transformacji geometrii folded dipole.
- `recommendedBalun`: rekomendacja `none`, `1:1`, `4:1` albo opis tekstowy zależny od trybu i impedancji.
- `feedMismatchWarning`: ostrzeżenie o możliwym niedopasowaniu do `feedLineImpedance`.
- `foldedDipoleSpacing`: odstęp między przewodnikami folded dipole.
- `foldedDipoleLoopWidth`: przybliżona szerokość pętli folded dipole.
- `foldedDipoleConductorLength`: przybliżona długość przewodnika dla pojedynczego ramienia pętli folded dipole.
- `notes`: założenia użyte dla obliczeń.
- `warnings`: ostrzeżenia zależne od wejść i ograniczeń modelu.

Tabela elementów powinna używać jawnych jednostek w nagłówkach i wynikach. Pierwszy wiersz, reflektor, ma `spacingFromPreviousElement = 0` albo `not applicable`.

Wyniki folded dipole powinny być pokazane tylko wtedy, gdy `drivenElementType = folded dipole`, albo jako osobna sekcja z wartościami `not applicable` dla straight dipole. W obu przypadkach UI musi jasno rozdzielać wymiary elementów anteny od oszacowań dopasowania.

## UI

Strona kalkulatora powinna zawierać:

- schemat anteny z elementami na boomie,
- tabelę wymiarów,
- przycisk `Copy results`,
- przycisk `Export CSV`,
- przycisk `Reset`,
- krótką sekcję założeń modelu.

Schemat powinien pokazywać reflektor, element zasilany i direktory w kolejności od lewej do prawej, z boomem jako osią odniesienia. Wizualizacja ma być poglądowa i nie musi zachowywać dokładnej skali przy dużej liczbie elementów.

## Proponowana struktura plików

- Specyfikacja: `docs/features/yagi-uda-antenna.md`
- Logika: `lib/calculators/yagiUdaAntenna.ts`
- Testy: `tests/yagiUdaAntenna.test.ts`
- Strona: `app/calculators/yagi-uda-antenna/page.tsx`
- UI: `app/calculators/yagi-uda-antenna/YagiUdaAntennaCalculator.tsx`
- Ikona: `public/icons/calculators/yagi-uda-antenna.svg`

Kod obliczeniowy musi pozostać poza UI. Komponent React ma tylko obsługiwać formularz, renderowanie schematu, tabelę, kopiowanie i eksport CSV.

## Plan testów

Testy jednostkowe logiki:

- poprawna konwersja `MHz` i `GHz` na Hz,
- poprawne liczenie długości fali,
- walidacja częstotliwości zerowej, ujemnej i nieskończonej,
- walidacja minimalnej liczby elementów,
- walidacja średnicy elementu,
- generowanie nazw elementów dla `3`, `4` i większej liczby elementów,
- monotonicznie rosnące `positionFromReflector`,
- `boomLength` równy pozycji ostatniego direktora,
- `halfElementLength = elementLength / 2`,
- poprawne przełączanie jednostek wyjściowych `mm`, `cm` i `inch`,
- brak zmiany wymiarów reflektora i direktorów po przełączeniu `straight dipole` na `folded dipole`,
- folded dipole używa tej samej pełnej długości elementu zasilanego co straight dipole,
- folded dipole zwraca `foldedTransformationRatio = 4` dla jednakowych średnic przewodników,
- folded dipole zwraca `foldedFeedImpedanceEstimate = straightDrivenImpedanceEstimate * 4`,
- walidacja `foldedDipoleSpacing > 0`,
- walidacja `feedLineImpedance > 0`,
- rekomendacja baluna dla domyślnego `balunRatio = 4:1`,
- ostrzeżenie `feedMismatchWarning` dla dużej rozbieżności między oszacowaną impedancją po balunie a `feedLineImpedance`,
- ostrzeżenie dla `metal through-boom` bez zaimplementowanej korekcji boomu,
- ostrzeżenie dla wyników poza rekomendowanym zakresem częstotliwości,
- osobne testy dla trybu `Simple Yagi`, jeśli zostanie dodany.

Testy UI po implementacji:

- render formularza z wartościami domyślnymi,
- render schematu i tabeli po poprawnym obliczeniu,
- komunikaty walidacyjne dla błędnych danych,
- `Copy results` generuje tekst z jednostkami,
- `Export CSV` zawiera nagłówki i wiersze elementów,
- `Reset` przywraca wartości domyślne.

## Ryzyka matematyczne

- DL6WU jest modelem empirycznym i wymaga poprawnego odwzorowania tabel lub współczynników.
- Różne źródła DL6WU mogą podawać inne współczynniki, zakresy elementów albo interpretację długości boomu.
- Korekcja średnicy elementów może być łatwo pomylona z korekcją boomu.
- Metalowy boom, szczególnie `metal through-boom`, może skracać wymagane długości elementów w sposób zależny od średnicy boomu, średnicy elementu i geometrii montażu.
- Folded dipole wpływa na impedancję, ale w prostym modelu geometrycznym może mieć taką samą długość osiową jak element zasilany; trzeba jasno opisać tę decyzję.
- Przyjęcie transformacji `4:1` dla folded dipole jest poprawne tylko jako klasyczne przybliżenie dla równych średnic przewodników i nie zastępuje obliczeń impedancji anteny Yagi.
- Oszacowanie `straightDrivenImpedanceEstimate` może być mylone z rzeczywistą impedancją wejściową anteny; UI musi opisać je jako wartość startową.
- Szacowanie zysku i front-to-back ratio bez symulacji może tworzyć fałszywe poczucie dokładności.
- Zaokrąglenia do `mm` lub `cm` mogą być istotne dla pasm UHF i mikrofalowych.

## Ostrzeżenia dla użytkownika

Kalkulator powinien zwracać ostrzeżenia tekstowe, między innymi:

- wynik jest punktem startowym do optymalizacji, a nie gotowym projektem produkcyjnym,
- wymagane jest sprawdzenie w NEC albo pomiar wykonanej anteny,
- typ boomu i sposób montażu mogą zmienić długości elementów,
- folded dipole z transformacją `4:1` nie rozwiązuje samodzielnie dopasowania anteny,
- wybrany balun nie zastępuje symulacji ani pomiaru impedancji wejściowej,
- środowisko pracy anteny może przesunąć częstotliwość rezonansową i charakterystykę promieniowania,
- dla pasm mikrofalowych tolerancje mechaniczne mogą dominować nad dokładnością modelu.

W UI należy pokazać stały komunikat:

```text
The result is a design starting point. Final antenna dimensions depend on element diameter, mounting method, boom material, feed system and environment. Validate with NEC simulation or measurement before manufacturing.
```

## Plan późniejszego dodania korekcji boomu

Pierwsza wersja może tylko przyjmować `boomType` i `boomDiameterOrSide`, a następnie dodawać ostrzeżenia. Korekcję boomu należy dodać później jako jawny etap modelu.

Plan:

- opisać źródło wzorów lub tabel korekcji boomu,
- rozdzielić korekcję dla `metal isolated` i `metal through-boom`,
- uwzględnić średnicę lub bok boomu oraz średnicę elementu,
- zwrócić w wynikach zarówno długość bazową, jak i długość skorygowaną, jeśli model na to pozwala,
- dodać ostrzeżenie, gdy korekcja wykracza poza zakres źródłowy,
- dodać testy regresyjne dla kilku znanych przypadków,
- nie stosować ukrytej korekcji bez pokazania jej w `notes`.

## Plan późniejszego eksportu do 4NEC2 albo MMANA-GAL

Eksport powinien zostać dodany po stabilizacji modelu geometrii.

Zakres eksportu:

- eksport CSV jako pierwszy prosty format tabelaryczny,
- eksport geometrii NEC dla 4NEC2,
- eksport formatu MMANA-GAL, jeśli zostanie potwierdzony minimalny poprawny format,
- współrzędne elementów generowane z tabeli wynikowej,
- elementy centrowane względem osi boomu,
- promień przewodnika wyliczony z `elementDiameter / 2`,
- źródło pobudzenia umieszczone na elemencie zasilanym,
- komentarze w pliku eksportu z częstotliwością, jednostkami, trybem modelu i ostrzeżeniami.

Ryzyka eksportu:

- różne symulatory mają inne oczekiwania dotyczące segmentacji przewodników,
- folded dipole wymaga innej geometrii niż straight dipole,
- boom zwykle nie powinien być automatycznie modelowany jako przewodnik bez świadomej decyzji użytkownika,
- plik eksportu może sugerować większą dokładność niż zapewnia model wejściowy.
