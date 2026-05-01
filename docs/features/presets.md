# Presety falowodów i materiałów

## Cel funkcji

Presety mają przyspieszyć wprowadzanie typowych danych wejściowych w kalkulatorach:

- Rectangular Waveguide: wybór standardowego falowodu ustawia wymiary `a` i `b`.
- Microstrip Line: wybór materiału podłoża ustawia `eps_r`.

Presety są wyłącznie ułatwieniem UI. Nie zmieniają wzorów obliczeniowych, walidacji ani modelu obliczeń kalkulatorów. Po wybraniu presetu użytkownik nadal może ręcznie zmienić każdą ustawioną wartość.

## Rectangular Waveguide

Kalkulator Rectangular Waveguide ma wejścia:

- `aMm`: szerokość falowodu `a` w mm,
- `bMm`: wysokość falowodu `b` w mm,
- `epsR`: względna przenikalność dielektryczna,
- `m`, `n`: indeksy modu.

Preset falowodu powinien ustawiać tylko:

- `aMm`,
- `bMm`.

Preset nie powinien zmieniać:

- `epsR`,
- `m`,
- `n`.

Domyślny stan formularza może pozostać bez zmian. Preset działa jako akcja użytkownika w formularzu, podobnie jak ręczne wpisanie wartości.

## Microstrip Line

Kalkulator Microstrip Line ma tryby:

- Analysis: obliczenie `Z0` z `H`, `W`, `eps_r` i `f`,
- Synthesis: obliczenie `W` z `H`, `Z0`, `eps_r` i `f`.

Preset materiału powinien ustawiać tylko:

- `epsR`.

Preset nie powinien zmieniać:

- trybu `analysis` / `synthesis`,
- `hMm`,
- `wMm`,
- `z0Ohm`,
- `fGHz`.

Wartości materiałów są wartościami typowymi albo orientacyjnymi. Szczególnie FR4 musi być opisany jako wartość orientacyjna, ponieważ jego `eps_r` zależy od producenta, składu laminatu i częstotliwości.

## Model danych

Proponowane typy:

```ts
export type WaveguidePreset = {
  id: string;
  label: string;
  standard?: string;
  aMm: number;
  bMm: number;
  band?: string;
};

export type MaterialPreset = {
  id: string;
  label: string;
  epsR: number;
  note?: string;
};
```

Presety powinny być trzymane poza komponentami UI, na przykład w:

- `lib/presets/waveguides.ts`,
- `lib/presets/materials.ts`.

Dane presetów nie należą do `lib/calculators`, ponieważ nie są częścią obliczeń. Są danymi pomocniczymi dla formularzy.

## Sposób użycia w UI

W obu kalkulatorach można dodać prosty `select` albo kompaktowy komponent wyboru presetu nad odpowiednimi polami formularza.

Rectangular Waveguide:

- label: `Waveguide preset`,
- placeholder: `Custom dimensions`,
- po wyborze presetu formularz ustawia `aMm` i `bMm`,
- pola `a` i `b` pozostają edytowalne.

Microstrip Line:

- label: `Substrate material`,
- placeholder: `Custom eps_r`,
- po wyborze presetu formularz ustawia `epsR`,
- pole `eps_r` pozostaje edytowalne.

Jeżeli użytkownik ręcznie zmieni wartość po wyborze presetu, UI może:

- pozostawić wybrany preset jako ostatnio użyty, albo
- przełączyć selector na `Custom`.

Rekomendacja: przełączać na `Custom`, jeśli ręczna wartość przestaje odpowiadać wartościom presetu. To ogranicza niejednoznaczność.

## Zasady implementacyjne

- Presety nie zmieniają tras URL.
- Presety nie zmieniają wzorów obliczeniowych.
- Presety nie zmieniają typów wejściowych kalkulatorów obliczeniowych.
- Wybranie presetu falowodu ustawia tylko `a` i `b`.
- Wybranie presetu materiału ustawia tylko `eps_r`.
- Każda wartość ustawiona przez preset może zostać ręcznie nadpisana przez użytkownika.
- Dane presetów powinny mieć testy jednostkowe sprawdzające podstawowy kontrakt danych, dodatnie wymiary i dodatnie `eps_r`.

## Proponowane presety falowodów

| ID | Nazwa | Standard | Pasmo | a [mm] | b [mm] |
| --- | --- | --- | --- | ---: | ---: |
| `wr90` | WR-90 | UG-39 / R100 | X | 22.86 | 10.16 |
| `wr75` | WR-75 | R120 | X/Ku | 19.05 | 9.525 |
| `wr62` | WR-62 | R140 | Ku | 15.799 | 7.899 |
| `wr42` | WR-42 | R220 | K | 10.668 | 4.318 |
| `wr28` | WR-28 | R320 | Ka | 7.112 | 3.556 |
| `wr22` | WR-22 | R400 | Q | 5.690 | 2.845 |
| `wr15` | WR-15 | R620 | V | 3.759 | 1.880 |
| `wr10` | WR-10 | R900 | W | 2.540 | 1.270 |

## Proponowane presety materiałów

| ID | Nazwa | eps_r | Uwagi |
| --- | --- | ---: | --- |
| `air` | Air | 1.0006 | Przybliżenie praktycznie równe 1. |
| `ptfe` | PTFE / Teflon | 2.1 | Typowa wartość dla PTFE. |
| `rogers-rt-duroid-5880` | Rogers RT/duroid 5880 | 2.2 | Typowa wartość katalogowa. |
| `rogers-4003c` | Rogers RO4003C | 3.38 | Typowa wartość katalogowa. |
| `fr4` | FR4 | 4.3 | Wartość orientacyjna; zależy od producenta, składu i częstotliwości. |
| `alumina-96` | Alumina 96% | 9.8 | Typowa wartość dla ceramiki Al2O3 96%. |

## Pliki do zmiany przy implementacji

Proponowany zakres kolejnego etapu:

- `lib/presets/waveguides.ts`: dane presetów falowodów.
- `lib/presets/materials.ts`: dane presetów materiałów.
- `tests/presets.test.ts`: testy kontraktu danych presetów.
- `app/calculators/waveguide/WaveguideCalculator.tsx`: selector presetów falowodów i obsługa ustawiania `aMm`, `bMm`.
- `app/calculators/microstrip/MicrostripCalculator.tsx`: selector presetów materiałów i obsługa ustawiania `epsR`.
- Opcjonalnie `components/PresetSelect.tsx`: wspólny, lekki komponent wyboru presetu, jeśli selektory zaczną się powtarzać.
