# AI-TOLD — Roadmap

AI-TOLD is a local Windows AI assistant. The goal is a practical desktop application with a central AI conversation, microphone interaction, local AI processing, text-to-speech, and an action layer that allows the AI to create or control additional application windows.

The application should remain **local-first**, modular, and understandable while it grows. The roadmap is a build sequence, not a list of every possible future idea.

The visual identity of AI-TOLD is based on the concept of a **T-OLED (Transparent OLED) display**. This is not simply a transparent Windows window: the application should feel like an intelligent transparent display in which the UI, avatar, information and future windows exist as illuminated layers.

A normal Windows monitor cannot provide literal physical T-OLED transparency, so AI-TOLD should **simulate the visual principles** while always prioritizing usability. The background may remain visible through the interface, but it should be subtly blurred or softened so that underlying Windows elements do not compete with AI-TOLD controls. Interactive AI-TOLD elements must remain clearly distinguishable.

The intended visual language is therefore **transparent OLED-inspired, luminous, layered and cyan-accented**, rather than a dark transparent dashboard.

### T-OLED visual principles

- The environment/background remains visible through transparent parts of the interface.
- A small amount of blur or optical softening is allowed and encouraged where it improves readability and prevents confusion with content underneath the display.
- AI-TOLD UI elements remain sharper and more visually prominent than the background.
- Cyan/blue elements should appear to emit light, as if the display pixels themselves are illuminated.
- Dark or empty areas should not automatically become large opaque dark panels.
- Thin lines, contours, subtle glow and layered depth are preferred over heavy UI containers.
- The avatar is part of the same display and should not look like an image placed inside a conventional card.
- Information panels should appear as part of the display rather than as ordinary Windows dialogs.
- Future AI-created windows should feel like the display is expanding, not like unrelated standard application windows are appearing.
- Hover/focus states should provide additional visual distinction so the user can immediately see what is interactive.
- Transparency must never reduce usability: **T-OLED realism is subordinate to clear interaction**.

### AI-TOLD should not become

- a normal Windows application with a dark transparent background
- a dark-mode dashboard
- a collection of large rounded cards
- a hacker/terminal interface
- a ChatGPT clone
- a collection of standard Windows dialogs as the primary visual language

The visual target is a **transparent intelligent OLED display** with a controlled optical focus: the world behind it remains visible, while AI-TOLD itself is the sharp, luminous layer the user interacts with.

* * *

## Fase 0 — Existing Desktop Foundation

Goal: preserve and verify the existing AI-TOLD desktop foundation instead of rebuilding it as part of the new roadmap.

The project already contains the main desktop building blocks:

- React frontend
- Tauri desktop shell
- Vite frontend setup
- JavaScript
- Rust/Tauri project structure
- Python `ai-pipeline`
- custom desktop window behaviour
- system tray functionality
- docking/window controls

### Tasks

- [x] 0.1 Existing project scaffold
- [x] 0.2 Frameless desktop window
- [x] 0.3 Custom window controls
- [x] 0.4 System tray
- [x] 0.5 Pin / always-on-top
- [x] 0.6 Dock / floating window behaviour
- [x] 0.7 Window resizing
- [x] 0.8 Global hotkey
- [ ] 0.9 Re-verify the complete desktop foundation against the current repository

  Controleer één voor één:

  - [x] App start correct
  - [x] Frameless window werkt
  - [x] Minimize werkt (trayicon blijft active)
  - [x] Maximize / restore werkt (trayicon blijft active)
  - [x] Close werkt (trayicon blijft active)
  - [x] System tray werkt (show + exit  = gecontrolleerd in windows taskmanager of hij daar afgesloten is )
  - [x] Hide / restore via tray werkt (show + exit  = gecontrolleerd in windows taskmanager of hij daar afgesloten is )
  - [x] Quit via tray werkt (show + exit  = gecontrolleerd in windows taskmanager of hij daar afgesloten is )
  - [x] Pin / always-on-top werkt
  - [x] Dock / floating behaviour werkt
  - [x] Window resizing werkt
  - [x] Global hotkey Ctrl+Shift+Space werkt
  - [x] Statusbar toont de juiste huidige status
  - [x] Bestaande React/Vite frontend start correct
  - [x] Tauri backend start correct
  - [x] `ai-pipeline` bestaat en de huidige status is vastgesteld

  Nog niet controleren/bouwen:

  - STT / microfoon → Fase 4
  - TTS → Fase 5
  - VRM/avatar → Fase 6
  - Lipsync → Fase 7
  - AI actions → Fase 8
  - AI-created windows → Fase 9
  - Memory → Fase 10
- [ ] 0.10 Define frontend ↔ Tauri ↔ AI-pipeline communication
- [ ] 0.11 Define one consistent message format between components
- [ ] 0.12 Add basic error handling for unavailable AI-pipeline
- [ ] 0.13 Establish project conventions
  - no TypeScript unless explicitly decided later
  - components remain small and focused
  - AI logic stays outside visual components

Fase 0 klaar als: the existing desktop foundation is verified against the current codebase and the three main parts — UI, Tauri and AI-pipeline — have a clear separation.

* * *

## Fase 1 — Application Interface

Goal: turn the existing desktop shell into the actual AI-TOLD interface.

### Tasks

- [ ] 1.1 Main application layout
  - application/header area
  - central conversation area
  - avatar area
  - bottom input area
- [ ] 1.2 Text input field
- [ ] 1.3 Send button
- [ ] 1.4 Microphone button
- [ ] 1.5 Application status area
- [ ] 1.6 T-OLED visual language
  - transparent display appearance
  - visible background through the interface
  - subtle background blur/softening where needed for usability
  - sharper AI-TOLD content than the background
  - luminous cyan/blue UI elements
  - thin OLED-like lines and contours
  - subtle glow and layered depth
  - floating information elements
  - avatar integrated into the display
  - hover/focus states that clearly identify interactive elements
  - no large dark background panel as the primary interface surface
  - no traditional card/dashboard layout as the primary visual structure
- [ ] 1.7 Validate visual usability
  - underlying Windows content must not compete with AI-TOLD controls
  - transparent areas must remain readable
  - interactive elements must always be visually distinguishable
  - test different desktop backgrounds behind the application
- [ ] 1.8 Responsive layout behaviour
- [ ] 1.9 Remove temporary placeholder UI

Fase 1 klaar als: AI-TOLD has a stable main interface that can host the conversation, avatar, voice controls and status information.

* * *

## Fase 2 — Chat

Goal: build reliable text conversation before adding voice or autonomous actions.

### Tasks

- [ ] 2.1 Text input field
- [ ] 2.2 Send button
- [ ] 2.3 Enter-to-send
- [ ] 2.4 Conversation message component
  - user message
  - AI message
- [ ] 2.5 Conversation scrolling
- [ ] 2.6 Sending/loading state
- [ ] 2.7 Error state
- [ ] 2.8 Connect chat UI to the AI-pipeline
- [ ] 2.9 Receive and display the AI response
- [ ] 2.10 Prevent duplicate sends while a request is processing
- [ ] 2.11 Clear/new conversation action

Fase 2 klaar als: a user can enter text, the local AI can respond, and the complete conversation reliably appears in the AI-TOLD interface.

* * *

## Fase 3 — Local AI Pipeline

Goal: make the AI backend a proper local service instead of a test endpoint.

### Tasks

- [ ] 3.1 Define the pipeline API
- [ ] 3.2 Request/response schema
- [ ] 3.3 Model connection
- [ ] 3.4 Model selection/configuration
- [ ] 3.5 Streaming responses where useful
- [ ] 3.6 Pipeline status
  - starting
  - ready
  - unavailable
  - error
- [ ] 3.7 Timeout/error handling
- [ ] 3.8 Conversation context passed to the model
- [ ] 3.9 Keep model-specific code isolated from the UI
- [ ] 3.10 Configuration without hard-coding machine-specific paths

Fase 3 klaar als: AI-TOLD can communicate with the local AI stack without the frontend needing to know which model technology is being used.

* * *

## Fase 4 — Microphone Input

Goal: allow the user to speak to AI-TOLD.

### Tasks

- [ ] 4.1 Microphone permission handling
- [ ] 4.2 Microphone button in the input area
- [ ] 4.3 Recording state
- [ ] 4.4 Stop/cancel recording
- [ ] 4.5 Speech-to-text pipeline
- [ ] 4.6 Put recognized text into the chat input
- [ ] 4.7 Send recognized text through the same chat pipeline
- [ ] 4.8 Handle microphone/STT errors cleanly

Important: voice input should feed the same message pipeline as typed input wherever possible. There should not be two separate AI conversation implementations.

Fase 4 klaar als: speaking and typing use the same AI conversation flow.

* * *

## Fase 5 — Text-to-Speech

Goal: let AI-TOLD speak its responses naturally.

### Tasks

- [ ] 5.1 Connect local TTS engine
- [ ] 5.2 Play AI response automatically
- [ ] 5.3 Complete-response playback without truncation
- [ ] 5.4 Stop speech
- [ ] 5.5 Queue/replace speech correctly
- [ ] 5.6 Speaking state in UI
- [ ] 5.7 Voice configuration
- [ ] 5.8 Keep TTS independent from chat rendering

Fase 5 klaar als: AI-TOLD can naturally speak a complete AI response and the user can stop the speech.

* * *

## Fase 6 — Avatar

Goal: make the AI-TOLD avatar a reliable part of the application instead of a placeholder.

### Tasks

- [ ] 6.1 Load local VRM model
- [ ] 6.2 Correct camera positioning
- [ ] 6.3 Correct head/face framing
- [ ] 6.4 Basic lighting
- [ ] 6.5 Idle animation
- [ ] 6.6 Blink
- [ ] 6.7 Eye movement
- [ ] 6.8 Subtle head movement
- [ ] 6.9 Basic expressions
- [ ] 6.10 Replace placeholder/error visual with the actual avatar

Fase 6 klaar als: the selected VRM model loads reliably and provides a stable AI-TOLD avatar with basic idle behaviour.

* * *

## Fase 7 — Lipsync

Goal: connect AI-TOLD speech to the avatar.

### Tasks

- [ ] 7.1 Speaking state
- [ ] 7.2 Viseme/mouth-shape support
- [ ] 7.3 Audio/viseme timing
- [ ] 7.4 Mouth movement during TTS playback
- [ ] 7.5 Idle → speaking transition
- [ ] 7.6 Speaking → idle transition
- [ ] 7.7 Natural blink/face behaviour while speaking

Possible technologies can be evaluated when this phase is reached:

- VRM expressions / visemes
- MuseTalk
- LiveTalking

Fase 7 klaar als: the avatar visibly speaks in sync with AI-TOLD's generated audio.

* * *

## Fase 8 — AI Action Layer

Goal: move from "AI that talks" to "AI that can perform controlled application actions".

The AI should not directly manipulate the UI. It should request an action, the application validates that action, and then the appropriate component performs it.

### Tasks

- [ ] 8.1 Define action/message format
- [ ] 8.2 Action parser
- [ ] 8.3 Action validation
- [ ] 8.4 Action dispatcher
- [ ] 8.5 First safe application action
- [ ] 8.6 Open an additional AI-TOLD window
- [ ] 8.7 Close an additional AI-TOLD window
- [ ] 8.8 Move/resize an additional window
- [ ] 8.9 Pass structured data to created windows
- [ ] 8.10 Return action result to the AI
- [ ] 8.11 Reject unknown or invalid actions

Fase 8 klaar als: the AI can safely request application actions through a defined and validated action protocol.

* * *

## Fase 9 — AI-Created Windows

Goal: make additional windows useful instead of merely decorative.

Possible window types should be implemented as application components, not as arbitrary AI-generated UI code.

### Tasks

- [ ] 9.1 Window manager
- [ ] 9.2 Window registry
- [ ] 9.3 Window IDs
- [ ] 9.4 Window types
- [ ] 9.5 Dynamic window creation
- [ ] 9.6 Dynamic window closing
- [ ] 9.7 Window state management
- [ ] 9.8 Data passed into a window
- [ ] 9.9 Window-to-AI communication
- [ ] 9.10 First useful specialist window
- [ ] 9.11 Multiple windows simultaneously

Examples of future window types:

- information panel
- calculation/tool window
- system/status panel
- document viewer
- monitoring panel

The exact window types are deliberately not fixed yet.

Fase 9 klaar als: AI-TOLD can open and manage multiple controlled application windows without the AI generating arbitrary frontend code.

* * *

## Fase 10 — Context & Memory

Goal: make conversations useful beyond a single request while keeping control over what context is retained.

### Tasks

- [ ] 10.1 Conversation state
- [ ] 10.2 Conversation history
- [ ] 10.3 Context selection
- [ ] 10.4 Local persistence
- [ ] 10.5 New conversation
- [ ] 10.6 Load previous conversation
- [ ] 10.7 Context limits
- [ ] 10.8 Clear/delete conversation data
- [ ] 10.9 Separate temporary context from persistent memory

Fase 10 klaar als: AI-TOLD can locally save and reload conversations without allowing context to become unmanageable.

* * *

## Fase 11 — System Integration

Goal: connect AI-TOLD more deeply with the Windows desktop, but through explicit application capabilities.

### Tasks

- [ ] 11.1 Application capability registry
- [ ] 11.2 Controlled Windows actions
- [ ] 11.3 Open approved applications
- [ ] 11.4 Read approved local information
- [ ] 11.5 File interaction layer
- [ ] 11.6 Permission/confirmation layer for sensitive actions
- [ ] 11.7 Action logging
- [ ] 11.8 Recover gracefully when an action fails

The action system should remain explicit and testable. The AI decides what it wants to do; the application decides whether and how that action is allowed to happen.

Fase 11 klaar als: AI-TOLD can perform useful desktop actions through a controlled capability system rather than unrestricted automation.

* * *

## Fase 12 — Stability & Release

Goal: turn the working prototype into a dependable desktop application.

### Tasks

- [ ] 12.1 Startup reliability
- [ ] 12.2 Graceful shutdown
- [ ] 12.3 Crash/error handling
- [ ] 12.4 Logging
- [ ] 12.5 Configuration management
- [ ] 12.6 Local data directory
- [ ] 12.7 Installer/build process
- [ ] 12.8 Clean install test
- [ ] 12.9 Upgrade test
- [ ] 12.10 Performance check
- [ ] 12.11 UI polish
- [ ] 12.12 Remove development-only code and placeholders

Fase 12 klaar als: AI-TOLD can be installed and started on a clean Windows machine without development tooling.

* * *

## Niet in de roadmap

Om te voorkomen dat AI-TOLD te vroeg een enorm project wordt:

- Geen cloud-AI afhankelijkheid als basisarchitectuur
- Geen onnodige webapp-versie
- Geen willekeurige AI-gegenereerde frontend-code als primaire UI-architectuur
- Geen complexe multi-agent architectuur voordat één lokale AI betrouwbaar werkt
- Geen feature-ontwikkeling die de basis conversation/action pipeline omzeilt
- Geen grote 3D/avatar-uitbreiding die de kern AI-functionaliteit vertraagt
- Geen meerdere grote fases tegelijk bouwen tenzij expliciet afgesproken

Deze punten kunnen later veranderen, maar worden niet als basis van de eerste versies gebouwd.

* * *

## Log

| Datum | Stap | Wie | Notitie |
|---|---|---|---|
| 2026-09-20 | plan | Wilfred + AI | Roadmap herwerkt op basis van de bestaande AI-TOLD/Grok projectgeschiedenis en de huidige desktop-foundation. |
| 2026-09-20 | 0.1 | Wilfred + AI | Bestaande Tauri/React/JavaScript desktop-shell als uitgangspunt vastgelegd in plaats van opnieuw als fundament te plannen. |
| 2026-09-20 | 0.2 | Wilfred + AI | Roadmapstructuur afgestemd op de werkwijze van `rack-docu-app`: één fase/punt tegelijk, testen door Wilfred, roadmap bijwerken na bevestiging. |

* * *

## Hoe bijwerken

Werkwijze per puntje:

1. AI bouwt de code voor één roadmap-punt en levert die aan.
2. AI werkt `ROADMAP.md` meteen mee bij:
   - `- [ ]` → `- [x]` voor het afgewerkte punt.
   - nieuwe rij in de tabel hierboven met datum, stap, wie en notitie.
3. AI geeft de exacte `git add / commit / push` commands mee — AI pusht niet.
4. Jij test lokaal.
5. Pas als jij **"ok"** zegt, voer je de commands uit.
6. Bij de start van het volgende punt wordt eerst gecontroleerd of de vorige wijziging/commit daadwerkelijk op GitHub staat voordat verder wordt gebouwd.
7. Eén roadmap-punt tegelijk. Geen meerdere fases tegelijk bouwen tenzij expliciet afgesproken.

The roadmap describes the intended build sequence. The repository and working application remain the source of truth for what is actually implemented.