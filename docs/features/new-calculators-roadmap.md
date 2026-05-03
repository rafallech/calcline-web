# Roadmapa nowych kalkulatorów RF, mikrofalowych i antenowych

## Zakres

Ten dokument opisuje proponowaną kolejność i zakres dodawania kolejnych kalkulatorów do CalcLine Web. Każdy kalkulator powinien być implementowany osobno, zgodnie z zasadami projektu:

- najpierw specyfikacja w `docs/features`,
- potem czysta logika w `lib/calculators`,
- potem testy jednostkowe,
- na końcu strona UI w `app/calculators`,
- kod obliczeniowy pozostaje niezależny od komponentów React,
- każdy wynik ma jawne jednostki, walidację oraz opis założeń.

Nazwy plików poniżej są propozycją zgodną z obecnym stylem projektu: kebab-case dla tras URL oraz camelCase dla plików logiki i testów.

## 1. Wavelength and Electrical Length

**Cel:** Przeliczanie częstotliwości, długości fali, długości fizycznej i długości elektrycznej dla linii lub propagacji w ośrodku.

**Wejścia:**

- częstotliwość `f`,
- jednostka częstotliwości: Hz, kHz, MHz, GHz,
- względna przenikalność efektywna `epsEff` albo współczynnik skrócenia `velocityFactor`,
- długość fizyczna `length`,
- jednostka długości: mm, cm, m,
- opcjonalnie tryb: z `length` do stopni albo ze stopni do `length`.

**Wyniki:**

- długość fali w próżni `lambda0`,
- długość fali w ośrodku `lambdaG`,
- długość elektryczna w stopniach,
- długość elektryczna w radianach,
- ułamek długości fali `length / lambdaG`,
- długość fizyczna dla zadanej długości elektrycznej.

**Założenia:**

- propagacja TEM albo quasi-TEM,
- `epsEff >= 1`,
- brak dyspersji, jeśli użytkownik podaje stałe `epsEff`,
- `velocityFactor = 1 / sqrt(epsEff)` przy wyborze modelu z przenikalnością.

**Proponowana trasa URL:** `/calculators/wavelength-electrical-length`

**Proponowany plik logiki:** `lib/calculators/wavelengthElectricalLength.ts`

**Proponowany plik testów:** `tests/wavelengthElectricalLength.test.ts`

**Ryzyka matematyczne:**

- mylenie długości fali w próżni z długością fali w linii,
- niespójność między `epsEff` i `velocityFactor`,
- błędy konwersji jednostek przy GHz, mm i stopniach,
- interpretacja długości elektrycznej modulo `360 deg` kontra wartość całkowita.

## 2. RF Power and dB Converter

**Cel:** Przeliczanie mocy, napięcia, prądu i poziomów dB używanych w RF.

**Wejścia:**

- moc w W, mW, dBm albo dBW,
- opcjonalnie impedancja odniesienia `R` w ohmach,
- napięcie RMS, peak albo peak-to-peak,
- prąd RMS,
- zysk lub tłumienie w dB.

**Wyniki:**

- moc w W, mW, dBm, dBW,
- napięcie RMS, peak, peak-to-peak,
- prąd RMS,
- poziom po dodaniu zysku lub tłumienia,
- współczynnik liniowy odpowiadający dB.

**Założenia:**

- sygnał sinusoidalny dla relacji RMS, peak i peak-to-peak,
- obciążenie rezystancyjne,
- domyślna impedancja odniesienia `50 ohm`,
- dB bez przyrostka jest stosunkiem, nie poziomem absolutnym.

**Proponowana trasa URL:** `/calculators/rf-power-db`

**Proponowany plik logiki:** `lib/calculators/rfPowerDb.ts`

**Proponowany plik testów:** `tests/rfPowerDb.test.ts`

**Ryzyka matematyczne:**

- użycie `10 log10` dla mocy i `20 log10` dla napięcia lub prądu,
- błędna obsługa mocy równej zero albo wartości ujemnych,
- mieszanie amplitudy peak i RMS,
- brak jawnego odniesienia dla dBm i dBW.

## 3. Quarter-wave Transformer

**Cel:** Projektowanie jednosekcyjnego transformatora ćwierćfalowego dla dopasowania impedancji rzeczywistych.

**Wejścia:**

- impedancja źródła lub linii `Z0`,
- impedancja obciążenia `ZL`,
- częstotliwość projektowa `f0`,
- `epsEff` albo `velocityFactor`,
- opcjonalnie dopuszczalna tolerancja częstotliwości do oceny pasma.

**Wyniki:**

- impedancja transformatora `Zt = sqrt(Z0 * ZL)`,
- długość `lambda / 4` w mm,
- długość elektryczna `90 deg` przy `f0`,
- współczynnik odbicia przy `f0`,
- opcjonalnie szacowana odpowiedź `|Gamma(f)|` dla kilku punktów częstotliwości.

**Założenia:**

- `Z0` i `ZL` są rzeczywiste i dodatnie,
- linia bezstratna,
- pojedyncza sekcja o długości `lambda / 4`,
- model nie rozwiązuje dopasowania dla obciążeń zespolonych bez wcześniejszej transformacji.

**Proponowana trasa URL:** `/calculators/quarter-wave-transformer`

**Proponowany plik logiki:** `lib/calculators/quarterWaveTransformer.ts`

**Proponowany plik testów:** `tests/quarterWaveTransformer.test.ts`

**Ryzyka matematyczne:**

- niepoprawne użycie wzoru dla impedancji zespolonej,
- zawyżone oczekiwanie szerokopasmowości transformatora jednosekcyjnego,
- błędy przy ekstremalnych stosunkach impedancji,
- pomylenie długości fizycznej z elektryczną poza `f0`.

## 4. Microstrip Loss

**Cel:** Szacowanie strat linii mikropaskowej: dielektrycznych, przewodnika i całkowitych.

**Wejścia:**

- częstotliwość `f`,
- długość linii,
- szerokość ścieżki `W`,
- grubość podłoża `H`,
- grubość miedzi `t`,
- `epsR`,
- tangens strat `tanDelta`,
- przewodność metalu `sigma` albo wybór materiału,
- chropowatość opcjonalnie.

**Wyniki:**

- `epsEff`,
- impedancja charakterystyczna użyta w modelu,
- tłumienie przewodnika `alphaC` w dB/m,
- tłumienie dielektryka `alphaD` w dB/m,
- tłumienie całkowite w dB/m,
- strata dla zadanej długości.

**Założenia:**

- quasi-TEM,
- model empiryczny, np. Hammerstad/Jensen lub Wheeler zgodny z zakresem specyfikacji kalkulatora,
- materiał jednorodny,
- domyślnie miedź i brak korekty chropowatości, jeśli nie zostanie dodana jawnie.

**Proponowana trasa URL:** `/calculators/microstrip-loss`

**Proponowany plik logiki:** `lib/calculators/microstripLoss.ts`

**Proponowany plik testów:** `tests/microstripLoss.test.ts`

**Ryzyka matematyczne:**

- wiele konkurencyjnych modeli strat daje różne wyniki,
- zakres ważności wzorów zależy od `W/H`, `t/H`, częstotliwości i materiału,
- trudna weryfikacja bez źródeł referencyjnych,
- ryzyko ukrycia istotnych założeń modelu w UI.

## 5. Stripline

**Cel:** Analiza i synteza symetrycznej linii paskowej.

**Wejścia:**

- tryb: analiza albo synteza,
- szerokość paska `W`,
- odległość między płaszczyznami masy `b`,
- grubość przewodnika `t`,
- `epsR`,
- częstotliwość `f`,
- docelowe `Z0` w trybie syntezy.

**Wyniki:**

- impedancja charakterystyczna `Z0`,
- wymagana szerokość `W` w syntezie,
- długość fali prowadzonej,
- długość ćwierćfali i półfali,
- ostrzeżenia zakresu dla `W/b` i `t/b`.

**Założenia:**

- linia symetryczna, jednorodne wypełnienie dielektryczne,
- tryb TEM,
- brak strat w minimalnej wersji,
- model z korekcją grubości przewodnika tylko jeśli zostanie jawnie wybrany.

**Proponowana trasa URL:** `/calculators/stripline`

**Proponowany plik logiki:** `lib/calculators/stripline.ts`

**Proponowany plik testów:** `tests/stripline.test.ts`

**Ryzyka matematyczne:**

- rozbieżności między wzorami dla cienkiego i grubego przewodnika,
- niejednoznaczność parametru `b` jako całkowitej separacji mas albo odległości do jednej masy,
- ograniczony zakres dokładności wzorów zamkniętych,
- synteza może wymagać stabilnego rozwiązania numerycznego.

## 6. Coplanar Waveguide

**Cel:** Analiza i synteza linii koplanarnej CPW na podłożu dielektrycznym.

**Wejścia:**

- tryb: analiza albo synteza,
- szerokość przewodnika centralnego `W`,
- szczelina `S`,
- grubość podłoża `H`,
- `epsR`,
- częstotliwość `f`,
- docelowe `Z0` w trybie syntezy,
- opcjonalnie wariant: CPW albo grounded CPW.

**Wyniki:**

- impedancja charakterystyczna `Z0`,
- `epsEff`,
- długość fali prowadzonej,
- syntetyzowane `W` lub `S`,
- ostrzeżenia o zakresie wymiarów.

**Założenia:**

- quasi-TEM,
- nieskończenie cienki metal w minimalnej wersji,
- brak strat,
- osobny wariant grounded CPW wymaga jawnie opisanego modelu.

**Proponowana trasa URL:** `/calculators/coplanar-waveguide`

**Proponowany plik logiki:** `lib/calculators/coplanarWaveguide.ts`

**Proponowany plik testów:** `tests/coplanarWaveguide.test.ts`

**Ryzyka matematyczne:**

- wzory używają całek eliptycznych albo ich aproksymacji,
- wrażliwość na stosunki `W`, `S` i `H`,
- różne modele dla CPW i grounded CPW,
- ryzyko niestabilności numerycznej przy skrajnych `k` bliskich 0 lub 1.

## 7. Resistive Attenuators

**Cel:** Projektowanie idealnych tłumików rezystancyjnych typu Pi, T i L-pad.

**Wejścia:**

- typ tłumika: Pi, T, L-pad,
- tłumienie w dB,
- impedancja wejściowa `Zin`,
- impedancja wyjściowa `Zout`,
- opcjonalnie moc wejściowa do oceny mocy rezystorów.

**Wyniki:**

- wartości rezystorów,
- współczynnik tłumienia liniowy,
- dopasowanie wejścia i wyjścia w modelu idealnym,
- moce wydzielane w rezystorach dla zadanej mocy,
- ostrzeżenia dla wartości niepraktycznych.

**Założenia:**

- elementy idealnie rezystancyjne,
- częstotliwościowo niezależny model,
- domyślne dopasowanie `50 ohm` na wejściu i wyjściu,
- dla asymetrycznych impedancji użyć osobnego zestawu wzorów.

**Proponowana trasa URL:** `/calculators/resistive-attenuators`

**Proponowany plik logiki:** `lib/calculators/resistiveAttenuators.ts`

**Proponowany plik testów:** `tests/resistiveAttenuators.test.ts`

**Ryzyka matematyczne:**

- osobne wzory dla tłumików symetrycznych i niesymetrycznych,
- ujemne lub nieskończone rezystancje przy niepoprawnych parametrach,
- błąd znaku przy tłumieniu dB,
- brak modelu pasożytów przy wysokich częstotliwościach.

## 8. Wilkinson Power Divider

**Cel:** Projektowanie idealnego dzielnika mocy Wilkinson dla równych lub później nierównych podziałów.

**Wejścia:**

- impedancja systemowa `Z0`,
- częstotliwość projektowa `f0`,
- `epsEff` albo `velocityFactor`,
- wariant podziału: równy w minimalnej wersji,
- opcjonalnie moc wejściowa.

**Wyniki:**

- impedancja sekcji ćwierćfalowych,
- długość fizyczna sekcji `lambda / 4`,
- rezystor izolacyjny,
- idealna strata podziału,
- moc na portach wyjściowych,
- ostrzeżenia o idealnym charakterze modelu.

**Założenia:**

- minimalna wersja: podział równy 3 dB,
- linie bezstratne,
- porty dopasowane do `Z0`,
- model idealny nie uwzględnia sprzężeń, strat i nieciągłości.

**Proponowana trasa URL:** `/calculators/wilkinson-power-divider`

**Proponowany plik logiki:** `lib/calculators/wilkinsonPowerDivider.ts`

**Proponowany plik testów:** `tests/wilkinsonPowerDivider.test.ts`

**Ryzyka matematyczne:**

- mylenie straty podziału 3.0103 dB ze stratą wtrąceniową,
- wariant nierównego podziału wymaga innych wzorów i definicji stosunku mocy,
- długości są poprawne tylko przy `f0`,
- trudna prezentacja izolacji w modelu idealnym bez macierzy S.

## 9. Directional Coupler

**Cel:** Przeliczanie podstawowych parametrów sprzęgacza kierunkowego.

**Wejścia:**

- moc wejściowa,
- moc wyjściowa portu through,
- moc portu coupled,
- moc portu isolated,
- albo bezpośrednio: coupling, insertion loss, directivity,
- jednostki mocy: W, mW, dBm.

**Wyniki:**

- sprzężenie `C` w dB,
- strata wtrąceniowa,
- izolacja,
- kierunkowość,
- moc na portach w W i dBm,
- opcjonalnie współczynniki liniowe.

**Założenia:**

- model mocy w stanie ustalonym,
- porty dopasowane,
- definicje parametrów muszą być jawnie opisane,
- minimalna wersja nie projektuje geometrii sprzęgacza.

**Proponowana trasa URL:** `/calculators/directional-coupler`

**Proponowany plik logiki:** `lib/calculators/directionalCoupler.ts`

**Proponowany plik testów:** `tests/directionalCoupler.test.ts`

**Ryzyka matematyczne:**

- różne konwencje znaku dla coupling i insertion loss,
- mylenie izolacji z kierunkowością,
- obsługa wartości zerowych w dBm,
- zależność wyników od tego, które dane wejściowe są podane.

## 10. S-parameter Converter

**Cel:** Konwersja parametrów S między reprezentacjami oraz podstawowa analiza portów.

**Wejścia:**

- `S11`, `S21`, `S12`, `S22` jako liczby zespolone,
- format wejściowy: prostokątny, biegunowy, dB + kąt,
- impedancja odniesienia `Z0`,
- opcjonalnie tryb jednoportowy albo dwuportowy.

**Wyniki:**

- parametry S w formacie prostokątnym, biegunowym i dB + kąt,
- return loss,
- insertion gain/loss,
- VSWR dla portów,
- opcjonalnie parametry Z, Y, ABCD dla dwuportu,
- opcjonalnie współczynnik stabilności Rolleta `K` i `Delta`.

**Założenia:**

- wspólna, rzeczywista impedancja odniesienia `Z0`,
- minimalna wersja może zacząć od konwersji formatów i metryk jednoportowych,
- parametry są liniowe i małosygnałowe.

**Proponowana trasa URL:** `/calculators/s-parameter-converter`

**Proponowany plik logiki:** `lib/calculators/sParameterConverter.ts`

**Proponowany plik testów:** `tests/sParameterConverter.test.ts`

**Ryzyka matematyczne:**

- konwersje macierzowe wymagają kontroli osobliwości,
- format dB dotyczy modułu, nie części rzeczywistej,
- kąty wymagają konsekwentnej normalizacji,
- różne definicje ABCD i kierunku prądu portu 2.

## 11. Link Budget

**Cel:** Obliczanie bilansu łącza radiowego w wolnej przestrzeni.

**Wejścia:**

- moc nadajnika w dBm albo W,
- zysk anteny nadawczej i odbiorczej w dBi,
- częstotliwość,
- odległość,
- straty kabli i dodatkowe straty,
- czułość odbiornika albo wymagany margines,
- opcjonalnie szerokość pasma, temperatura szumowa i NF.

**Wyniki:**

- strata wolnoprzestrzenna FSPL,
- EIRP,
- moc odbierana,
- margines łącza,
- opcjonalnie poziom szumu i SNR,
- ostrzeżenia dla jednostek i zakresów.

**Założenia:**

- propagacja w wolnej przestrzeni,
- anteny w polu dalekim,
- brak fadingu, wielodrogowości i strat atmosferycznych w minimalnej wersji,
- dBi jako domyślna jednostka zysku anten.

**Proponowana trasa URL:** `/calculators/link-budget`

**Proponowany plik logiki:** `lib/calculators/linkBudget.ts`

**Proponowany plik testów:** `tests/linkBudget.test.ts`

**Ryzyka matematyczne:**

- stała w FSPL zależy od jednostek częstotliwości i odległości,
- mylenie dBi, dBd i dB,
- dodawanie strat ze złym znakiem,
- brak walidacji odległości w polu bliskim anten.

## 12. Patch Antenna

**Cel:** Wstępne projektowanie prostokątnej anteny mikropaskowej.

**Wejścia:**

- częstotliwość rezonansowa `f0`,
- `epsR`,
- wysokość podłoża `H`,
- opcjonalnie grubość metalu,
- opcjonalnie impedancja wejściowa lub typ zasilania.

**Wyniki:**

- szerokość patcha `W`,
- efektywna przenikalność `epsEff`,
- wydłużenie efektywne `DeltaL`,
- długość patcha `L`,
- przybliżona długość fali,
- opcjonalnie położenie punktu zasilania inset.

**Założenia:**

- prostokątny patch w modzie podstawowym `TM10`,
- cienkie podłoże,
- model transmisyjno-liniowy,
- brak pełnego modelu promieniowania i strat w minimalnej wersji.

**Proponowana trasa URL:** `/calculators/patch-antenna`

**Proponowany plik logiki:** `lib/calculators/patchAntenna.ts`

**Proponowany plik testów:** `tests/patchAntenna.test.ts`

**Ryzyka matematyczne:**

- wzory są przybliżone i zależą od zakresu `H/lambda`,
- rzeczywista częstotliwość wymaga zwykle strojenia EM,
- trudna walidacja impedancji wejściowej bez dodatkowego modelu,
- FR4 ma silną zależność od częstotliwości i strat.

## 13. Horn Antenna

**Cel:** Szacowanie wymiarów i zysku anteny tubowej.

**Wejścia:**

- częstotliwość,
- typ: pyramidal horn w minimalnej wersji,
- wymiary apertury `A` i `B`,
- długość tuby albo kąty rozwarcia,
- sprawność apertury,
- opcjonalnie wymiary falowodu zasilającego.

**Wyniki:**

- długość fali,
- powierzchnia apertury,
- szacowany zysk w dBi,
- szerokości wiązki HPBW w płaszczyznach E i H,
- efektywna apertura,
- ostrzeżenia dla pola dalekiego.

**Założenia:**

- apertura prostokątna,
- sprawność apertury podawana przez użytkownika albo domyślna orientacyjna,
- model szacunkowy, nie pełna synteza tuby,
- antena pracuje w odpowiednim paśmie falowodu.

**Proponowana trasa URL:** `/calculators/horn-antenna`

**Proponowany plik logiki:** `lib/calculators/hornAntenna.ts`

**Proponowany plik testów:** `tests/hornAntenna.test.ts`

**Ryzyka matematyczne:**

- różne aproksymacje HPBW dla apertury prostokątnej,
- zysk silnie zależy od sprawności apertury,
- brak kontroli modów falowodowych bez integracji z kalkulatorem falowodu,
- jednostki apertury łatwo prowadzą do dużych błędów.

## 14. Dipole and Monopole

**Cel:** Obliczanie podstawowych długości anten dipolowych i monopolowych.

**Wejścia:**

- częstotliwość,
- typ: dipol półfalowy, dipol ćwierćfalowy, monopol ćwierćfalowy,
- współczynnik skrócenia,
- opcjonalnie liczba przeciwwag i długość przeciwwagi.

**Wyniki:**

- długość fali,
- całkowita długość anteny,
- długość ramienia dipola,
- długość monopola,
- przybliżona impedancja wejściowa dla wybranego typu,
- ostrzeżenia o uproszczeniu modelu.

**Założenia:**

- cienki przewodnik,
- wolna przestrzeń albo uproszczony współczynnik skrócenia,
- brak wpływu wysokości nad ziemią i średnicy przewodnika w minimalnej wersji,
- impedancje są wartościami orientacyjnymi.

**Proponowana trasa URL:** `/calculators/dipole-monopole`

**Proponowany plik logiki:** `lib/calculators/dipoleMonopole.ts`

**Proponowany plik testów:** `tests/dipoleMonopole.test.ts`

**Ryzyka matematyczne:**

- rzeczywista długość rezonansowa zależy od średnicy przewodnika i otoczenia,
- monopol wymaga płaszczyzny masy,
- impedancja wejściowa jest tylko orientacyjna,
- współczynnik skrócenia bywa mylony z `epsEff`.

## 15. Antenna Gain and Effective Aperture

**Cel:** Przeliczanie zysku anteny, efektywnej apertury i powiązanych wielkości.

**Wejścia:**

- częstotliwość,
- zysk w dBi, dBd albo wartość liniowa,
- efektywna apertura `Ae`,
- sprawność apertury,
- powierzchnia fizyczna apertury.

**Wyniki:**

- zysk liniowy,
- zysk w dBi i dBd,
- efektywna apertura `Ae`,
- wymagana powierzchnia fizyczna dla zadanej sprawności,
- długość fali,
- opcjonalnie EIRP po podaniu mocy.

**Założenia:**

- relacja `Ae = G * lambda^2 / (4 pi)`,
- `dBd = dBi - 2.15`,
- sprawność apertury w zakresie `0..1`,
- antena odbiorcza w polu dalekim.

**Proponowana trasa URL:** `/calculators/antenna-gain-aperture`

**Proponowany plik logiki:** `lib/calculators/antennaGainAperture.ts`

**Proponowany plik testów:** `tests/antennaGainAperture.test.ts`

**Ryzyka matematyczne:**

- mieszanie dBi i dBd,
- zysk liniowy nie może być liczony przez `20 log10`,
- apertury zależą od częstotliwości,
- sprawność apertury większa niż 1 musi być odrzucana.

## 16. RF Cascade

**Cel:** Analiza kaskady bloków RF pod kątem zysku, strat, mocy i punktu kompresji.

**Wejścia:**

- lista stopni,
- zysk lub strata każdego stopnia w dB,
- opcjonalnie `P1dB`, `OIP3`, maksymalna moc wejściowa,
- moc wejściowa,
- impedancja odniesienia opcjonalnie.

**Wyniki:**

- zysk całkowity,
- moc po każdym stopniu,
- moc wyjściowa,
- kaskadowy `P1dB` lub `OIP3`, jeśli dane wejściowe są kompletne,
- ostrzeżenia o przekroczeniu limitów mocy.

**Założenia:**

- stopnie są liniowe dla obliczeń mocy, dopóki nie zostanie oceniony limit,
- wartości dB są dodawane, moce absolutne konwertowane przez dBm,
- minimalna wersja może zacząć od zysku i poziomów mocy bez OIP3.

**Proponowana trasa URL:** `/calculators/rf-cascade`

**Proponowany plik logiki:** `lib/calculators/rfCascade.ts`

**Proponowany plik testów:** `tests/rfCascade.test.ts`

**Ryzyka matematyczne:**

- kaskadowe OIP3 wymaga konwersji na wartości liniowe,
- P1dB kaskadowy jest przybliżeniem i zależy od definicji,
- łatwo pomylić IP3 wejściowy i wyjściowy,
- zmienna liczba stopni wymaga starannej walidacji danych.

## 17. Receiver Noise

**Cel:** Obliczanie szumów odbiornika i kaskadowej liczby szumowej.

**Wejścia:**

- lista stopni z zyskiem i NF,
- temperatura odniesienia,
- szerokość pasma,
- opcjonalnie temperatura anteny,
- opcjonalnie poziom sygnału wejściowego.

**Wyniki:**

- kaskadowa liczba szumowa NF,
- kaskadowy współczynnik szumów `F`,
- temperatura szumowa odbiornika,
- moc szumu `kTB`,
- poziom szumu w dBm,
- SNR na wejściu i wyjściu, jeśli podano sygnał.

**Założenia:**

- wzór Friisa dla kaskady,
- stopnie dopasowane,
- domyślna temperatura odniesienia `290 K`,
- pasmo równoważne szumowo podaje użytkownik.

**Proponowana trasa URL:** `/calculators/receiver-noise`

**Proponowany plik logiki:** `lib/calculators/receiverNoise.ts`

**Proponowany plik testów:** `tests/receiverNoise.test.ts`

**Ryzyka matematyczne:**

- NF w dB trzeba konwertować na liniowy `F`,
- zyski stratnych stopni poniżej 0 dB mocno wpływają na wynik,
- temperatura i szerokość pasma muszą być dodatnie,
- SNR wymaga konsekwentnych jednostek mocy.

## 18. Microwave Filter Prototype

**Cel:** Wstępne projektowanie prototypów filtrów mikrofalowych i LC na podstawie tablic `g`.

**Wejścia:**

- typ charakterystyki: Butterworth albo Chebyshev,
- rząd filtru `N`,
- ripple dla Chebysheva,
- impedancja systemowa `Z0`,
- częstotliwość graniczna lub środkowa,
- typ transformacji: low-pass, high-pass, band-pass, band-stop,
- szerokość pasma dla transformacji pasmowych.

**Wyniki:**

- wartości prototypowe `g0..gN+1`,
- elementy L i C po skalowaniu,
- impedancje lub admitancje inwerterów w wersji mikrofalowej opcjonalnie,
- częstotliwości graniczne,
- ostrzeżenia zakresu.

**Założenia:**

- minimalna wersja może obsłużyć Butterworth low-pass i Chebyshev low-pass,
- elementy idealne,
- dopasowanie do tego samego `Z0` po obu stronach,
- filtry pasmowe wymagają osobnego etapu specyfikacji.

**Proponowana trasa URL:** `/calculators/microwave-filter-prototype`

**Proponowany plik logiki:** `lib/calculators/microwaveFilterPrototype.ts`

**Proponowany plik testów:** `tests/microwaveFilterPrototype.test.ts`

**Ryzyka matematyczne:**

- tablice `g` muszą być wiarygodne albo liczone ze sprawdzonych wzorów,
- Chebyshev wymaga poprawnej obsługi ripple,
- transformacje pasmowe łatwo prowadzą do błędów jednostek angular frequency,
- wysokie rzędy mogą generować wartości trudne praktycznie.

## 19. Pi and T Matching Networks

**Cel:** Projektowanie dwuelementowo-trójelementowych sieci dopasowujących Pi i T z zadanym Q.

**Wejścia:**

- impedancja źródła `RS`,
- impedancja obciążenia `RL`,
- częstotliwość,
- topologia: Pi albo T,
- wybrany wariant dolnoprzepustowy albo górnoprzepustowy,
- zadany Q lub impedancja wirtualna.

**Wyniki:**

- reaktancje elementów,
- wartości L i C,
- dobroć obciążona `Q`,
- opcjonalnie szacowana szerokość pasma,
- ostrzeżenia dla niepraktycznych elementów.

**Założenia:**

- minimalna wersja dla rezystancji rzeczywistych,
- elementy idealne,
- użytkownik jawnie wybiera Q albo aplikacja wylicza minimalny sensowny wariant,
- dopasowanie dla impedancji zespolonych wymaga osobnego rozszerzenia.

**Proponowana trasa URL:** `/calculators/pi-t-matching`

**Proponowany plik logiki:** `lib/calculators/piTMatching.ts`

**Proponowany plik testów:** `tests/piTMatching.test.ts`

**Ryzyka matematyczne:**

- wiele poprawnych wariantów zależnych od Q i topologii,
- ujemne reaktancje trzeba mapować na L albo C konsekwentnie,
- relacja Q i pasma jest przybliżeniem,
- ryzyko duplikowania logiki z kalkulatorem L-section bez wspólnych helperów.

## 20. Multi-section Impedance Transformer

**Cel:** Projektowanie wielosekcyjnego transformatora impedancji o szerszym paśmie niż transformator ćwierćfalowy.

**Wejścia:**

- `Z0`,
- `ZL`,
- liczba sekcji `N`,
- częstotliwość środkowa `f0`,
- `epsEff` albo `velocityFactor`,
- typ syntezy: binomial w minimalnej wersji, Chebyshev w późniejszej,
- opcjonalnie maksymalne dopuszczalne odbicie.

**Wyniki:**

- impedancje kolejnych sekcji,
- długość fizyczna każdej sekcji `lambda / 4`,
- przybliżona odpowiedź odbiciowa w funkcji częstotliwości,
- szerokość pasma dla zadanego progu odbicia, jeśli model ją obsługuje,
- ostrzeżenia dla dużych skoków impedancji.

**Założenia:**

- `Z0` i `ZL` rzeczywiste dodatnie,
- wszystkie sekcje mają długość ćwierć fali przy `f0`,
- linie bezstratne,
- minimalna wersja zaczyna od transformatora binomialnego.

**Proponowana trasa URL:** `/calculators/multi-section-transformer`

**Proponowany plik logiki:** `lib/calculators/multiSectionTransformer.ts`

**Proponowany plik testów:** `tests/multiSectionTransformer.test.ts`

**Ryzyka matematyczne:**

- synteza Chebysheva jest znacznie bardziej złożona niż binomialna,
- odpowiedź częstotliwościowa wymaga stabilnego mnożenia macierzy transmisyjnych,
- duża liczba sekcji może tworzyć impedancje trudne technologicznie,
- wyniki są poprawne tylko dla założonego modelu bez strat.

## Kolejność implementacji

Zalecana kolejność pozostaje taka sama jak lista powyżej. Pierwsze kalkulatory są głównie konwersyjne i wspierają późniejsze funkcje. Kalkulatory linii transmisyjnych i anten wchodzą po zbudowaniu wspólnych helperów jednostek, dB i długości fali. Kalkulatory kaskadowe, szumowe, filtrów i wielosekcyjnych transformatorów powinny zostać dodane później, ponieważ mają większe ryzyko matematyczne i wymagają staranniejszych testów referencyjnych.

