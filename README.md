# 3D Model Explorer

Ein leichter Drei.js-Demo-Viewer, um verschiedene GLTF-Modelle samt HDR-Umgebung zu testen. Die App lädt alles direkt aus dem Web und benötigt daher keinen Build-Prozess.

## Projekt starten

Da es sich um reine statische Dateien handelt, reicht bereits ein beliebiger Webserver. Zwei schnelle Optionen:

```bash
# Python 3
python -m http.server 8080

# oder mit npm http-server (falls installiert)
npx http-server . -p 8080
```

Anschließend im Browser `http://localhost:8080` öffnen.

> **Hinweis:** Der direkte Doppelklick auf `index.html` funktioniert in vielen Browsern aufgrund von CORS-Sicherheitsrichtlinien nicht. Bitte verwende daher einen lokalen Server.

## Features

- Aktuelle Three.js-Version (r164) mit moderner Orbit-Steuerung
- HDR-Umgebung mit PMREM für realistische Beleuchtung
- Austauschbare GLTF-Demos per Button-Klick
- Ressourcen werden beim Modellwechsel ordentlich freigegeben
- Responsives Layout mit Fokus auf Touch- und Desktop-Geräten

## Nützliche Links

- [Three.js Dokumentation](https://threejs.org/docs/)
- [glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models)
- [Poly Haven HDRIs](https://polyhaven.com/hdris)
