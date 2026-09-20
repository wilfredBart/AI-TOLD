# AI-TOLED

Lokale desktop companion met een frameless T-OLED uitstraling: transparante HUD-shell, floating UI panels, compacte HUD-typografie, desktop controls, avatar-ruimte en lokale AI-pipeline integratie.

## Huidige status

De volgende milestones zijn voor nu als gedaan beschouwd:

- 1.6 T-OLED visual language
- 1.7 Validate visual usability
- 3.3 Model connection

De focus ligt nu op het stabiliseren van de chatflow, het model-contract en de volgende lokale AI-onderdelen zoals model selectie, streaming en voice input.

## Architectuur

Het project bestaat uit drie lagen:

- Frontend: React + Vite app in de `src` map
- Desktop shell: Tauri in `src-tauri`
- Lokale AI service: Python API in `ai-pipeline/server.py`

De UI communiceert via Tauri commands en een lokaal JSON message contract met de Python service.

## Starten

```bash
cd ai-toled-app
npm install
npm run tauri dev
```

Voor de lokale AI-pipeline apart opstarten:

```bash
cd ai-toled-app
python .\ai-pipeline\server.py
```

De Python pipeline probeert standaard een lokaal Ollama-model te benaderen op `http://127.0.0.1:11434`. De modelnaam kan je aanpassen met de environment variable `AI_PIPELINE_MODEL`.

Voorbeeld:

```bash
$env:AI_PIPELINE_MODEL = "llama3.2"
python .\ai-pipeline\server.py
```

Als Ollama niet draait, retourneert de pipeline een gestructureerde `error`-envelope met code `MODEL_UNAVAILABLE` in plaats van een vage backend-fout.

## Bediening

- Sleep via de linker titelbalk
- Pin: always-on-top
- Dock links / rechts / float
- X knop: verbergt naar tray
- Hotkey: **Ctrl+Shift+Space** toont/verbergt het venster

## Avatar

Het voorbeeldmodel staat in `public/avatars/avatar.vrm`.
Vervang dit bestand door je eigen VRM-model (bijv. Ready Player Me of VRoid).

## Visuele richting

De app gebruikt momenteel een transparante, licht-glasachtige OLED/HUD-visual identity met:

- cyan/laserblauwe accentlijnen
- subtiele glow- en scan-effekten
- floating panel-structuur zonder zware dark-card look
- compacte technische typografie voor de HUD-ervaring

## Belangrijkste ontwikkelnotitie

Dit project is nog steeds lokaal-first en modulair opgebouwd. De desktop shell, de Tauri bridge en de AI-pipeline blijven gescheiden zodat de UI niet direct afhankelijk is van specifieke model- of backend-details.

## AI-TOLD
