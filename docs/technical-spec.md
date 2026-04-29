Dokument techniczny dla Codex
Migracja CalcLine2024 z MIT App Inventor do aplikacji webowej

Wersja dokumentu: 1.0
Cel: przygotować specyfikację techniczną do zbudowania aplikacji webowej na podstawie projektu CalcLine2024.aia.

1. Cel projektu

Zbudować nową aplikację webową dla studentów i inżynierów zajmujących się inżynierią mikrofalową.

Aplikacja ma odtworzyć logikę projektu CalcLine2024 stworzonego w MIT App Inventor i poprawić jego użyteczność.

Nowa wersja powinna działać jako:

strona internetowa,
aplikacja responsywna na telefon, tablet i komputer,
PWA z możliwością działania offline,
narzędzie edukacyjne z opcjonalnym pokazaniem wzorów.

Nie kopiować interfejsu 1:1. Zachować logikę obliczeń, ale zaprojektować nowy, spójny interfejs.

2. Materiały wejściowe

Plik źródłowy:
CalcLine2024.aia

Projekt App Inventor zawiera:

9 ekranów:
Screen1,
Screen_About,
Screen_RectWaveguide,
Screen_Microstrip2,
Screen_Impedance,
Screen_Impedance2,
Screen_VSWR,
Screen_Matching,
Screen_Matching2.

28 grafik i ikon w katalogu assets.

Pliki układu:
.scm

Pliki logiki blokowej:
.bky

Dane projektu:
Nazwa aplikacji: CalcLine2024
Nazwa aplikacji Android: CalcLine
Wersja w project.properties: 1.25
Wersja pokazana w ekranie About: 1.21
Autor: Rafal Lech

3. Zakres funkcjonalny

Aplikacja składa się z 7 kalkulatorów:

1. Rectangular Waveguide
   Obliczanie częstotliwości odcięcia falowodu prostokątnego.

2. Microstrip Line
   Analiza i synteza linii mikropaskowej.

3. Load Impedance Calculation
   Obliczanie impedancji obciążenia na podstawie SWR i odległości do minimum fali.

4. Impedance Transformation
   Transformacja impedancji wzdłuż linii transmisyjnej.

5. VSWR Calculation
   Przeliczanie między SWR, współczynnikiem odbicia, impedancją i admitancją.

6. Single Stub Matching Circuit
   Dopasowanie pojedynczym stubem, wariant szeregowy lub równoległy, zwarty lub rozwarty.

7. L-section Matching Network
   Dopasowanie układem L i przeliczenie reaktancji oraz susceptancji na L i C.

8. Założenia techniczne

Stos technologiczny:

Next.js,
React,
TypeScript,
Tailwind CSS,
Vitest,
Playwright,
PWA,
ESLint,
Prettier.

Cel jakościowy:

Kod obliczeniowy ma być oddzielony od komponentów UI.
Każdy kalkulator ma mieć testy jednostkowe.
Każdy wynik ma mieć jawne jednostki.
Każdy formularz ma mieć walidację.
Wyniki zespolone mają być formatowane jednolicie jako R + jX.

5. Proponowana struktura projektu

/app
/page.tsx
/about/page.tsx
/calculators/waveguide/page.tsx
/calculators/microstrip/page.tsx
/calculators/load-impedance/page.tsx
/calculators/impedance-transform/page.tsx
/calculators/vswr/page.tsx
/calculators/single-stub/page.tsx
/calculators/l-match/page.tsx

/components
AppShell.tsx
CalculatorCard.tsx
NumberInput.tsx
UnitSelect.tsx
ComplexInput.tsx
ComplexResult.tsx
FormulaBlock.tsx
ResultTable.tsx
ValidationMessage.tsx
ModeToggle.tsx

/lib
/math/complex.ts
/math/format.ts
/math/units.ts
/calculators/waveguide.ts
/calculators/microstrip.ts
/calculators/loadImpedance.ts
/calculators/impedanceTransform.ts
/calculators/vswr.ts
/calculators/singleStub.ts
/calculators/lMatch.ts

/tests
waveguide.test.ts
microstrip.test.ts
loadImpedance.test.ts
impedanceTransform.test.ts
vswr.test.ts
singleStub.test.ts
lMatch.test.ts

/public
/icons
/schematics
manifest.webmanifest

6. Wspólne moduły obliczeniowe

6.1. complex.ts

Utworzyć typ Complex:

export type Complex = {
re: number;
im: number;
};

Wymagane funkcje:

add(a, b),
sub(a, b),
mul(a, b),
div(a, b),
abs(a),
argRad(a),
argDeg(a),
conj(a),
fromPolar(mag, angleDeg),
toString(a, digits),
isFiniteComplex(a).

6.2. units.ts

Wymagane konwersje:

mmToM,
mToMm,
MHzToHz,
GHzToHz,
HzToGHz,
degToRad,
radToDeg.

6.3. format.ts

Wymagane funkcje:

roundTo(value, digits),
formatNumber(value, digits),
formatComplex(value, digits),
formatWithUnit(value, unit, digits).

6.4. Walidacja

Każdy kalkulator powinien zwracać strukturę:

{
ok: boolean,
value?: Result,
errors: string[],
warnings: string[]
}

Nie rzucać wyjątków dla typowych błędów formularza.

7. Ekran główny

Odpowiednik: Screen1

Cel:
Pokazać listę kalkulatorów jako karty.

Elementy:

Tytuł: Microwave Line Calculator
Karta: Rectangular Waveguide
Karta: Microstrip Line
Karta: Load Impedance Calculation
Karta: Impedance Transformation
Karta: VSWR Calculation
Karta: Impedance Matching, Single Stub
Karta: Impedance Matching, L-section Network
Link: About

Wersja webowa:

Dodać krótkie opisy pod kartami.
Dodać wyszukiwarkę kalkulatorów.
Dodać przełącznik języka PL/EN.
Dodać przełącznik trybu Student/Inżynier.

8. Ekran About

Odpowiednik: Screen_About

Dane z AIA:

CalcLine
Version 1.21
Author: Rafal Lech
e-mail: [rafal.lech@pg.edu.pl](mailto:rafal.lech@pg.edu.pl)

Wersja webowa:

Pokazać wersję aplikacji webowej.
Pokazać źródło algorytmów: CalcLine2024 AIA.
Dodać informację o założeniach, na przykład linie bezstratne, jeśli dotyczy.
Dodać link do dokumentacji wzorów.

9. Kalkulator 1: Rectangular Waveguide

Odpowiednik: Screen_RectWaveguide

9.1. Wejścia

a, szerokość falowodu, domyślnie 22.86 mm
b, wysokość falowodu, domyślnie 10.16 mm
eps_r, domyślnie 1
n, indeks trybu, domyślnie 0
m, indeks trybu, domyślnie 0

Uwaga:
W projekcie AIA pola n i m są zamienione względem typowego zapisu fc_nm. W wersji webowej użyć nazw m i n zgodnych ze wzorem i jasno opisać kierunek a oraz b.

9.2. Wyniki

fc10,
fc20,
fc30,
fc01,
fc02,
fc03,
fc11,
fc12,
fc13,
fcmn dla trybu wybranego przez użytkownika.

Jednostka: GHz.
Zaokrąglenie zgodne z AIA: 3 miejsca po przecinku.

9.3. Wzór z AIA

c = 300000000 m/s

fc_mn = c / (2 sqrt(eps_r)) sqrt((m / a)^2 + (n / b)^2)

AIA liczy wzór równoważny:

fc_mn = c / (2 pi sqrt(eps_r)) sqrt((m pi / a)^2 + (n pi / b)^2)

Wymiary a i b w obliczeniach są w metrach.

9.4. Walidacja

a > 0
b > 0
eps_r >= 1
m i n jako liczby całkowite nieujemne

9.5. Test referencyjny

Dane:
a = 22.86 mm
b = 10.16 mm
eps_r = 1

Oczekiwane wyniki:
fc10 = 6.562 GHz
fc20 = 13.123 GHz
fc30 = 19.685 GHz
fc01 = 14.764 GHz
fc02 = 29.528 GHz
fc03 = 44.291 GHz
fc11 = 16.156 GHz
fc12 = 30.248 GHz
fc13 = 44.775 GHz

10. Kalkulator 2: Microstrip Line

Odpowiednik: Screen_Microstrip2

10.1. Tryby

Analysis:
Z wymiarów linii oblicza Z0, eps_eff i lambda.

Synthesis:
Z impedancji Z0 oblicza W, eps_eff i lambda.

10.2. Wejścia wspólne

H, wysokość dielektryka, domyślnie 1.5 mm
eps_r, domyślnie 3.5
f, częstotliwość, domyślnie 1.8 GHz

10.3. Wejścia trybu Analysis

W, szerokość paska, domyślnie 3.38 mm

10.4. Wejścia trybu Synthesis

Z0, impedancja charakterystyczna, domyślnie 3.38 w AIA, ale w wersji webowej ustawić domyślnie 50 Ohm

10.5. Wyniki

Tryb Analysis:
Z0 w Ohm,
eps_eff,
lambda w mm.

Tryb Synthesis:
W w mm,
eps_eff,
lambda w mm.

10.6. Wzory z AIA

eps_eff = (eps_r + 1) / 2 + (eps_r - 1) / 2 * 1 / sqrt(1 + 12 H / W)

Dla W/H < 1:

Z0 = 60 / sqrt(eps_eff) * ln(8H/W + W/(4H))

Dla W/H >= 1:

Z0 = 120 pi / [sqrt(eps_eff) * (W/H + 1.393 + 0.667 ln(W/H + 1.444))]

Synteza:

A = Z0/60 * sqrt((eps_r + 1)/2) + (eps_r - 1)/(eps_r + 1) * (0.23 + 0.11/eps_r)

B = 377 pi / (2 Z0 sqrt(eps_r))

W/H, wariant 1:
8 exp(A) / (exp(2A) - 2)

W/H, wariant 2:
2/pi * [(B - 1) - ln(2B - 1) + (eps_r - 1)/(2eps_r) * (ln(B - 1) + 0.39 - 0.61/eps_r)]

Jeżeli abs(wariant 1) < 2, użyć wariantu 1. W przeciwnym razie użyć wariantu 2.

lambda = 0.3 / (f_GHz sqrt(eps_eff)) * 1000 mm

10.7. Walidacja

H > 0
W > 0 w trybie Analysis
Z0 > 0 w trybie Synthesis
eps_r >= 1
f > 0

10.8. Test referencyjny

Analysis:
H = 1.5 mm
W = 3.38 mm
eps_r = 3.5
f = 1.8 GHz

Oczekiwane wyniki:
Z0 około 50.339 Ohm
eps_eff około 2.747
lambda około 100.558 mm

Synthesis:
H = 1.5 mm
Z0 = 50 Ohm
eps_r = 3.5
f = 1.8 GHz

Oczekiwane wyniki:
W około 3.389 mm
eps_eff około 2.748
lambda około 100.548 mm

11. Kalkulator 3: Load Impedance Calculation

Odpowiednik: Screen_Impedance

11.1. Wejścia

lambda, długość fali w linii, domyślnie 100 mm
SWR, domyślnie 3
d, odległość od obciążenia do pierwszego minimum, domyślnie 5 mm
Typ minimum:
Voltage wave,
Current wave.

W AIA checkbox Current wave jest domyślnie wyłączony, a Voltage wave jest aktywny. W wersji webowej użyć radio buttonów.

11.2. Wyniki

Z_L / Z_0 jako liczba zespolona,
R_L / Z_0,
X_L / Z_0.

Uwaga:
W AIA na ekranie są pola R_L/Z0 i X_L/Z0, ale w bloku obliczeniowym widoczne jest głównie przypisanie całego ZL. Przy migracji dopisać jawne rozdzielenie części rzeczywistej i urojonej.

11.3. Wzory z AIA

beta_d = 2 pi d / lambda

t = tan(beta_d)

Dla Current wave:

z_L = (SWR - j t) / (1 - j SWR t)

Dla Voltage wave:

z_L = (1 - j SWR t) / (SWR - j t)

11.4. Walidacja

lambda > 0
d >= 0
SWR >= 1
wybrany typ minimum

11.5. Ulepszenie webowe

Dodać wybór:
minimum napięcia,
minimum prądu,
maksimum napięcia,
maksimum prądu.

Dodać pokazanie położenia na wykresie linii albo na wykresie Smitha.

12. Kalkulator 4: Impedance Transformation

Odpowiednik: Screen_Impedance2

12.1. Wejścia

lambda, domyślnie 100 mm
R_L / Z_0, domyślnie 2
X_L / Z_0, domyślnie 3
d, odległość transformacji, domyślnie 0 mm
Kierunek:
towards generator,
towards load.

12.2. Wyniki

z'_L = R'_L + jX'_L, znormalizowane.

12.3. Wzory z AIA

Jeżeli kierunek to towards load, AIA mnoży d przez -1.
Jeżeli kierunek to towards generator, d zostaje dodatnie.

beta_d = 2 pi d / lambda

t = tan(beta_d)

z_L = R_L + jX_L

z' = (z_L + j t) / (1 + j z_L t)

12.4. Walidacja

lambda > 0
R_L >= 0
d >= 0
wybrany kierunek

12.5. Ulepszenie webowe

Pokazać też impedancję nieznormalizowaną po podaniu Z0.
Dodać przełącznik jednostek długości: mm, cm, m, lambda.
Dodać wykres zmiany impedancji wzdłuż linii.

13. Kalkulator 5: VSWR Calculation

Odpowiednik: Screen_VSWR

13.1. Wejścia

Z0, domyślnie 50 Ohm

Użytkownik wybiera jeden typ danych wejściowych:

VSWR i arg(Gamma),
|Gamma| i arg(Gamma),
Re(Gamma) i Im(Gamma),
r i x, impedancja znormalizowana,
g i b, admitancja znormalizowana,
G i B, admitancja w S,
R i X, impedancja w Ohm.

13.2. Wyniki

VSWR,
|Gamma|,
arg(Gamma) w stopniach,
Re(Gamma),
Im(Gamma),
r + jx,
g + jb,
R + jX w Ohm,
G + jB w S.

13.3. Wzory docelowe

Gamma = (z - 1) / (z + 1)

z = (1 + Gamma) / (1 - Gamma)

VSWR = (1 + |Gamma|) / (1 - |Gamma|)

|Gamma| = (VSWR - 1) / (VSWR + 1)

y = 1 / z

Z = Z0 z

Y = y / Z0

13.4. Ważna uwaga z migracji

W blokach AIA dla wejścia VSWR i |Gamma| część urojona Gamma jest liczona tak:

imG = modG * cos(argG)

Matematycznie powinno być:

imG = modG * sin(argG)

To wygląda na błąd w starej aplikacji albo błąd w interpretacji bloków. W wersji webowej zastosować poprawny wzór i dodać test porównawczy.

13.5. Walidacja

Z0 > 0
VSWR >= 1
0 <= |Gamma| < 1
sqrt(Re(Gamma)^2 + Im(Gamma)^2) < 1
r >= 0
g >= 0
R >= 0
G >= 0

13.6. Ulepszenie webowe

Zamiast checkboxów użyć jednej listy wyboru typu wejścia.
Po zmianie typu wejścia pokazać tylko potrzebne pola.
Wyniki aktualizować od razu po wpisaniu danych.
Dodać wykres Smitha jako funkcję rozszerzoną.

14. Kalkulator 6: Single Stub Matching Circuit

Odpowiednik: Screen_Matching

14.1. Wejścia

R_L, domyślnie 50 Ohm
X_L, domyślnie 50 Ohm
Z0, impedancja linii, domyślnie 50 Ohm
Z1, impedancja stuba, domyślnie 50 Ohm

Uwaga:
W AIA jest pole Z1, ale bloki obliczeniowe widoczne w kliknięciach używają głównie Z0. Przy migracji sprawdzić, czy Z1 ma zostać włączone do wzorów długości stuba. Jeżeli aplikacja ma obsługiwać stub o impedancji innej niż linia główna, Z1 musi wejść do wzorów.

14.2. Konfiguracje

Single Open Stub Series,
Single Short Stub Series,
Single Open Stub Shunt,
Single Short Stub Shunt.

14.3. Wyniki

Solution #1:
d1/lambda,
l1/lambda.

Solution #2:
d2/lambda,
l2/lambda.

14.4. Funkcje z AIA

Par_t1(R, X, ZY0):

Jeżeli R == ZY0:
(-X) / (2 ZY0)

W przeciwnym razie:
[X + sqrt(R * ((ZY0 - R)^2 + X^2) / ZY0)] / (R - ZY0)

Par_t2(R, X, ZY0):

Jeżeli R == ZY0:
(-X) / (2 ZY0)

W przeciwnym razie:
[X - sqrt(R * ((ZY0 - R)^2 + X^2) / ZY0)] / (R - ZY0)

Val_d(t):

Jeżeli t < 0:
(1 / 2pi) * (pi + atan(t))

W przeciwnym razie:
(1 / 2pi) * atan(t)

Par_BX(R, X, ZY0, t):

[R^2 t - (ZY0 - X t)(X + ZY0 t)] / [ZY0 * (R^2 + (X + ZY0 t)^2)]

14.5. Logika konfiguracji z AIA

Dla stuba szeregowego AIA najpierw liczy admitancję obciążenia:

G_L = R_L / (R_L^2 + X_L^2)

B_L = -X_L / (R_L^2 + X_L^2)

Y0 = 1 / Z0

Następnie używa Par_t1(G_L, B_L, Y0) i Par_t2(G_L, B_L, Y0).

Dla stuba równoległego AIA używa bezpośrednio Par_t1(R_L, X_L, Z0) i Par_t2(R_L, X_L, Z0).

14.6. Walidacja

R_L >= 0
Z0 > 0
Z1 > 0, jeżeli zostanie użyte
obsługa R_L = 0 bez sztucznego dodawania 0.0001, jeśli da się zapisać stabilniej numerycznie

14.7. Ulepszenie webowe

Dodać wizualny schemat dla każdej konfiguracji.
Dodać wybór: wynik w lambda, stopniach albo mm po podaniu częstotliwości i eps_eff.
Dodać komentarz, które rozwiązanie ma krótszy stub.
Dodać wariant z Z1 różnym od Z0.

15. Kalkulator 7: L-section Matching Network

Odpowiednik: Screen_Matching2

15.1. Wejścia

R_L, domyślnie 200 Ohm
X_L, domyślnie -100 Ohm
Z0, domyślnie 100 Ohm
f, domyślnie 500 MHz

15.2. Wyniki

Solution #1:
X1 w Ohm,
B1 w mS,
element szeregowy Ls albo Cs,
element równoległy Lp albo Cp,
schemat.

Solution #2:
X2 w Ohm,
B2 w mS,
element szeregowy Ls albo Cs,
element równoległy Lp albo Cp,
schemat.

15.3. Wzory z AIA dla R_L >= Z0

B1 = [X_L + sqrt(R_L/Z0) * sqrt(R_L^2 + X_L^2 - Z0 R_L)] / (R_L^2 + X_L^2)

B2 = [X_L - sqrt(R_L/Z0) * sqrt(R_L^2 + X_L^2 - Z0 R_L)] / (R_L^2 + X_L^2)

X = 1/B + X_L Z0/R_L - Z0/(B R_L)

15.4. Wzory z AIA dla R_L < Z0

B1 = sqrt((Z0 - R_L) / R_L) / Z0

B2 = -sqrt((Z0 - R_L) / R_L) / Z0

X1 = sqrt(R_L (Z0 - R_L)) - X_L

X2 = -sqrt(R_L (Z0 - R_L)) - X_L

15.5. Przeliczenie X i B na elementy

Dla X > 0:
Ls = X / (2pi f)
wynik w nH

Dla X < 0:
Cs = 1 / (2pi f |X|)
wynik w pF

Dla B < 0:
Lp = 1 / (|B| 2pi f)
wynik w nH

Dla B > 0:
Cp = B / (2pi f)
wynik w pF

Uwaga:
W AIA zapis Cp jest równoważny B / omega, choć zapis blokowy wygląda jak 1 / (omega * (1/B)).

15.6. Walidacja

Z0 > 0
R_L >= 0
f > 0
Dla R_L = 0 wynik wymaga osobnej obsługi, bo wzory dzielą przez R_L.
Jeżeli wyrażenie pod pierwiastkiem jest ujemne przez dane wejściowe albo błąd numeryczny, zwrócić czytelny błąd.

15.7. Ulepszenie webowe

Pokazać oba rozwiązania jako karty.
Dodać schemat z oznaczeniami elementów.
Dodać opcję wyboru topologii, zamiast tylko automatycznego wyboru.
Dodać ostrzeżenie o elementach idealnych i braku strat.
Dodać przeliczenie dobroci Q, jeśli użytkownik poda ograniczenia elementów.

16. Języki i treści

Pierwsza wersja może być po angielsku, zgodnie ze starą aplikacją.
Docelowo dodać dwa języki:

PL,
EN.

Wszystkie etykiety przenieść do plików tłumaczeń:

/locales/pl.json
/locales/en.json

Przykład:

calculator.waveguide.title
calculator.waveguide.description
common.calculate
common.reset
common.results
common.errors.required

17. UI i UX

17.1. Ogólne zasady

Każdy kalkulator jako osobna strona.
Stały nagłówek z powrotem do menu.
Wyniki po prawej stronie na desktopie.
Wyniki pod formularzem na telefonie.
Pola wejściowe z jednostką w tym samym wierszu.
Jednostki jako select tam, gdzie ma to sens.
Przycisk Reset do wartości domyślnych.
Przycisk Copy results.

17.2. Tryb Student

Pokazuje:
wzory,
krótkie objaśnienia,
jednostki,
kroki obliczeń.

17.3. Tryb Inżynier

Pokazuje:
kompaktowy formularz,
wyniki,
minimalną liczbę opisów,
kopiowanie wyników.

18. Testy

18.1. Testy jednostkowe

Dla każdego kalkulatora utworzyć testy:

wartości domyślne z AIA,
przypadki brzegowe,
błędy walidacji,
porównanie z wynikami znanymi z literatury albo ręcznie policzonymi.

18.2. Testy regresyjne z AIA

Dla każdego ekranu przepisać co najmniej 3 przypadki wejściowe ze starej aplikacji.
Nowa aplikacja powinna zwrócić te same wyniki, z wyjątkiem miejsc celowo poprawionych.

18.3. Tolerancje

Częstotliwości: 0.001 GHz.
Impedancje: 0.001 dla wartości znormalizowanych, 0.01 Ohm dla wartości rzeczywistych.
Elementy L/C: 0.01 nH lub 0.01 pF.

19. Plan migracji

Etap 1: Inwentaryzacja

Odczytać wszystkie .scm i .bky z AIA.
Zmapować ekrany na trasy webowe.
Zmapować pola App Inventor na komponenty React.
Zmapować bloki obliczeniowe na funkcje TypeScript.

Etap 2: Rdzeń matematyczny

Utworzyć complex.ts.
Utworzyć units.ts.
Utworzyć format.ts.
Przepisać kalkulatory jako czyste funkcje.
Napisać testy jednostkowe.

Etap 3: Interfejs

Zbudować AppShell.
Zbudować ekran główny.
Zbudować 7 ekranów kalkulatorów.
Dodać walidację formularzy.
Dodać komponenty wyników.

Etap 4: Zasoby graficzne

Przenieść schematy z assets albo narysować je od nowa jako SVG.
Preferować SVG zamiast bitmap PNG.
Dodać podpisy do schematów.

Etap 5: Ulepszenia

Dodać język PL/EN.
Dodać tryb Student/Inżynier.
Dodać zapis ostatnich wartości w localStorage.
Dodać eksport wyników do CSV.
Dodać opcję eksportu PDF w kolejnej wersji.
Dodać wykres Smitha jako osobny moduł.

Etap 6: PWA i publikacja

Dodać manifest.webmanifest.
Dodać service worker.
Dodać ikony.
Przetestować offline.
Wdrożyć na Vercel, Netlify albo własny serwer.

20. Priorytety pierwszej wersji MVP

MVP ma zawierać:

Ekran główny,
7 kalkulatorów,
walidację,
testy jednostkowe,
responsywny interfejs,
kopiowanie wyników,
PWA.

Poza MVP:

wykres Smitha,
eksport PDF,
pełny tryb edukacyjny,
porównanie wielu wyników,
zapis historii obliczeń.

21. Zadania dla Codex

Zadanie 1

Utwórz projekt Next.js z TypeScript, Tailwind CSS, Vitest i strukturą katalogów zgodną z dokumentem. Dodaj ekran główny z kartami siedmiu kalkulatorów. Nie implementuj jeszcze obliczeń.

Zadanie 2

Utwórz moduły /lib/math/complex.ts, /lib/math/units.ts i /lib/math/format.ts. Dodaj testy jednostkowe dla działań na liczbach zespolonych, konwersji jednostek i formatowania wyników.

Zadanie 3

Zaimplementuj kalkulator Rectangular Waveguide w /lib/calculators/waveguide.ts. Dodaj stronę /calculators/waveguide. Użyj wartości domyślnych z AIA. Dodaj test referencyjny dla WR-90: a = 22.86 mm, b = 10.16 mm, eps_r = 1.

Zadanie 4

Zaimplementuj kalkulator Microstrip Line w trybie Analysis i Synthesis. Dodaj testy dla H = 1.5 mm, W = 3.38 mm, eps_r = 3.5, f = 1.8 GHz oraz dla syntezy Z0 = 50 Ohm.

Zadanie 5

Zaimplementuj Load Impedance Calculation i Impedance Transformation. Użyj typu Complex. Dodaj testy dla obu kierunków transformacji i obu typów minimum fali.

Zadanie 6

Zaimplementuj VSWR Calculation jako konwerter między Gamma, z, y, Z, Y i VSWR. Użyj poprawnego wzoru Im(Gamma) = |Gamma| sin(arg). W teście dodaj komentarz, że stary AIA prawdopodobnie używał cos dla części urojonej.

Zadanie 7

Zaimplementuj Single Stub Matching Circuit. Zadbaj o osobne funkcje Par_t1, Par_t2, Val_d i Par_BX. Sprawdź, czy Z1 ma wpływać na długość stuba. Jeżeli nie ma pewności, zostaw TODO i testy dla Z1 = Z0.

Zadanie 8

Zaimplementuj L-section Matching Network. Dodaj obie gałęzie R_L >= Z0 i R_L < Z0. Przelicz X oraz B na L i C. Dodaj schematy SVG dla wyników.

Zadanie 9

Dodaj tryb Student/Inżynier. W trybie Student pokazuj wzory i kroki. W trybie Inżynier pokazuj tylko formularz i wyniki.

Zadanie 10

Dodaj PWA, manifest, ikony, działanie offline i zapis ostatnich danych formularza w localStorage.

22. Ryzyka i decyzje do podjęcia

23. Z1 w kalkulatorze Single Stub
    W AIA pole istnieje, ale logika widoczna w blokach używa Z0. Trzeba zdecydować, czy nowa wersja ma obsługiwać Z1 różne od Z0.

24. VSWR, część urojona Gamma
    W AIA wygląda na użycie cos zamiast sin. Trzeba potraktować to jako błąd i poprawić w nowej wersji, chyba że porównanie z działającą aplikacją pokaże inaczej.

25. Oznaczenia m i n dla falowodu
    W AIA pola są opisane jako n i m, ale wyniki jako fc_nm. W nowej wersji trzeba przyjąć jednoznaczną konwencję.

26. Założenie linii bezstratnej
    Kalkulatory impedancji i dopasowania wyglądają na oparte o linię bezstratną. W UI dodać informację o tym założeniu.

27. Format liczb zespolonych
    App Inventor mógł pokazywać liczby zespolone w formie wewnętrznej. Web musi mieć własne formatowanie.

28. Definicja ukończenia MVP

Aplikacja jest gotowa jako MVP, gdy:

wszystkie 7 kalkulatorów działa,
wszystkie formularze mają walidację,
wyniki mają jednostki,
testy jednostkowe przechodzą,
aplikacja działa na telefonie i desktopie,
aplikacja działa offline jako PWA,
kod obliczeniowy jest niezależny od UI,
każdy kalkulator ma co najmniej jeden test referencyjny z wartościami domyślnymi AIA.
