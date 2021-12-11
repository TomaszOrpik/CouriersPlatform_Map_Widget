# Map View

### Opis

Widget mapy niezbędny do działania wszystkich pozostałych aplikacji. Generuje on podgląd trasy kuriera w czasie rzeczywistym poprzez pobieranie danych bezpośrednio z bazy. Aplikacja działa w dwóch trybach developerskim i produkcyjnym. Widget wymaga do prawidłowego działania parametrów `mapType`, `isLocalDev`, `token` oraz `Id`. 
Prawidłowe przykłady parametrów:
| Typ        |   Parametr   |
| ---------- | :----------: |
| courier    |  id kuriera  |
| navigation |  id kuriera  |
| package    | id przesyłki |

Parametry przekazywane są poprzez url lub bezpośrednio z aplikacji flutterowej.

### Instalacja

- Przygotowanie Bazy Danych (baza danych musi być tą samą, która jest wykorzystywana do uruchomienia [Backendu](https://dev.azure.com/tomaszorpik/Couriers%20Application/_git/Backend)) <br/>
   Aby aplikacja działała poprawnie należy utworzyć nową bazę danych według [instrukcji instalacji Firebase Database](https://firebase.google.com/docs/database/web/start) oraz bazę danych w MongoDB według [instrukcji](LINK)
- Przygotowanie niezbędnych zmiennych do testów lokalnych <br/>
   Po poprawnym utworzeniu bazy danych należy skopiować plik `firebase-config.example.ts` i zmienić znajdujące się w nim zmienne na te prowadzące do własnej bazy danych, a nazwę pliku na `firebase-config.ts`.
- Przygotowanie zmiennych do wersji produkcyjnej <br/>
   Po utworzeniu backendu, należy podpiąć odpowiednie zmienne w pliku `constants.tsx`
- Instalacja Pakietów <br/>
   Po przygotowaniu bazy danych i zmiennych instalujemy wszystkie niezbędne pakiety komendą `npm install`.

### Wersja Developerska

Po poprawnej instalacji aplikację uruchamiamy komendą `npm run start`

### Testy

Aplikację można przetestować za pomocą testu automatycznego, by wykonać test należy: <br/>
-  Uruchomić backend
-  Podmienić zmienne testowe w pliku `src/automation_test/test-environment.js`
-  Uruchomić aplikację komendą `npm run start`
-  Po uruchomieniu aplikacji oraz backendu test przeprowadza się komendą `npm run automationTest`
-  Testy można przeprowadzić w różnych środowiskach przekazując do komendy flagi `firebase` (do testów z wykorzystaniem firebase websocket) oraz `production` (do testów z wykorzystaniem własnego websocketa i bazy danych mongoDB)

### Wersja Produkcyjna

W celu skompilowania aplikacji do wersji produkcyjnej należy uruchomić komendę `npm run build`. Wszystkie niezbędne pliki do działania będą znajdować się w folderze build.