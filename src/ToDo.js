/*
ToDo:
- RemoteHarvesterUpgrader Rollennamen anpassen so dass er nicht mehr longRangHarvester heißt.
- BunkerBuilding, Ramparts hinzufügen
- Repairer dynamische Menge anhand der Anzahl von Structures und Towers
- role.manager schreiben, der ab RCL4 verwendet wird und aus dem Storage Energie auf Spawn und Tower aufteilt
- Für roles verschiede Verhaltensweisen implementieren, je nach RCL


Erledigt am 21.11.22:
- BunkerBuilding, umschreiben, sodass nur noch eine Construction Site pro tick erstellt wird
- BunkerBuilding zerstört automatisch roads, die im Weg sind
- Transporter füllt den Tower nicht

Erledigt am 20.11.22:
- Grundlage für automatisches Bunkerbuildung implementiert
- longRangeHarvester umgeschrieben, sodass er upgraded statt Energie zum Spawn zu bringen
- Automatisches Bauen von roads
- room.memory verwenden für häufig verwendete infos
- prototype.room hinzugefügt
- Rauminformationen als RoomVisual direkt in der Map anzeigen lassen

 */