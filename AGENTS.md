CalcLine Web
Cel projektu

Migracja aplikacji MIT App Inventor CalcLine2024 do aplikacji webowej Next.js, React, TypeScript i Tailwind.

Materiały referencyjne
Dokument techniczny: docs/technical-spec.md
Rozpakowany projekt AIA: reference/aia-unpacked
Oryginalny plik AIA: reference/CalcLine2024.aia
Zasady pracy
Najpierw czytaj docs/technical-spec.md.
Kod obliczeniowy trzymaj poza UI.
Funkcje obliczeniowe umieszczaj w lib/calculators.
Wspólne funkcje matematyczne umieszczaj w lib/math.
Każdy kalkulator ma mieć testy jednostkowe.
Nie edytuj plików w reference.
Implementuj jeden kalkulator naraz.
Po zmianach podaj listę zmienionych plików i komendy testowe.
W kalkulatorze Single Stub Matching Circuit nie używamy parametru Z1. Model zakłada, że impedancja stuba jest równa impedancji linii głównej Z0. Nie dodawaj pola Z1 bez osobnej decyzji projektowej.
Zasoby graficzne
Oryginalne pliki z reference/aia-unpacked/assets służą tylko jako źródło.
Pliki używane przez UI kopiuj do public/icons/calculators.
Nie importuj grafik bezpośrednio z katalogu reference.
Każda ikona kalkulatora ma mieć opis alt.
Rozwój nowych kalkulatorów
Nowe kalkulatory dodawaj pojedynczo.
Najpierw dodaj specyfikację w docs/features.
Potem dodaj czystą logikę w lib/calculators.
Potem dodaj testy jednostkowe.
Dopiero potem dodaj stronę UI w app/calculators.
Nie zmieniaj istniejących kalkulatorów bez potrzeby.
Każdy kalkulator ma mieć wartości domyślne, walidację, wyniki z jednostkami, testy i krótki opis założeń.
Wzory i funkcje obliczeniowe nie mogą być ukryte w komponentach React.
Kod obliczeniowy ma być niezależny od UI.