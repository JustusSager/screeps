# Dokumentation

## Aufbau des Speichers

### Metadaten über Räume dauerhaft speichern

Da der Raumspeicher über `Memory.rooms` nur erreichbar und vorhanden ist, solange ein Creep oder Gebäude von einem in diesem Raum ist, gibt es zusätzlich das `Memory.worldmap` um dort Metadaten, wie die in dem Raum vorhandenen Energiequellen, zu speichern. 

Hier sollen nur Daten gespeichert werden, die sich selten ändern, da diese nur alle 10 Ticks und nur wenn der Raum über `Game.rooms` erreichbar ist, aktualisiert werden (Siehe [Abschnitt Load Balancing](#load-balancing-auf-verschiedene-ticks)). 

Ähnlich zu `Game.rooms` werden diese Informationen über den Raumnamen als Key abgerufen. 

### Dynamische Daten zu Räumen

Dynamische Raumdaten werden in `Memory.rooms` gespeichert. Diese werden jeden Tick aktualisiert, sind jedoch nur für Räume vorhanden, in denen eine Basis vorhanden ist, oder sich Creeps dauerhaft aufhalten.



## Load balancing auf verschiedene Ticks

Mithilfe von `Game.time % 10 == x` werden unterschiedliche Aufgaben, die nicht jeden Tick nötig sind, auf unterschiedliche Ticks verteilt. Durch das `% 10` ergeben sich 10 unterschiedliche Ticks auf die bestimmte Aufgaben gelegt werden können. 

**Tick 0**

- Aktualisierung der Raumeintragung in `Memory.worldmap`.
- Speichern des Referenzpunktes für Basenbau in `room.memory`

**Tick 1**

- Die automatische Platzierung von construction sites vom basebuilding manager.

# How To

## TypeScript kompilieren

### Kompilieren
``` bash
npx tsc
```

## VS Code Dateien verstecken

In VS Code lassen sich die kompilierten (.js und .js.map) im Explorer verstecken. Dafür muss man:

- File -> Preferences -> Settings öffnen
- Nach `files:exclude` suchen
- Das entsprechende Pattern einfügen

Dadurch wird der Explorer deutlich übersichtlicher, bei der Screeps Entwicklung mit TypeScript.
