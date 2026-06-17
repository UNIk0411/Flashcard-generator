# StudyForge Implementation Plan

Build a production-quality AI Study Companion web application named StudyForge. The app will enable users to upload study documents (PDF, DOCX, PPTX, TXT, MD), parse their text contents client-side, send the text to the Gemini API to generate structured learning assets (flashcards, MCQs, summary, revision sheets, and exam questions), and present them in a premium, responsive dashboard with dark mode and spaced repetition learning tools.

## User Review Required

> [!IMPORTANT]
> The application uses VITE_GEMINI_API_KEY from the environment. Ensure this key is set in a .env file in the f:/flashcard_gen/notes-flashcards directory.
> No third-party backend is used. All parsing and API interaction happen in the client's browser, meaning the Gemini API key must be secure and local storage is used for persistence.

## Open Questions

> [!NOTE]
> Since we require exactly 20 flashcards, 20 MCQs, and 10 exam questions, for small upload documents we will configure the Gemini model to supplement the provided text using its general knowledge of the topics mentioned. Let me know if you would prefer different fallback behavior.

## Proposed Changes

### Application Services and Hooks

---

#### [NEW] [useLocalStorage.js](file:///f:/flashcard_gen/notes-flashcards/src/hooks/useLocalStorage.js)
Create a hook to store and retrieve state from LocalStorage. This will be used to manage study decks, user learning statistics, theme selection, and spaced repetition confidence scores.

#### [NEW] [fileParser.js](file:///f:/flashcard_gen/notes-flashcards/src/services/fileParser.js)
Create a reusable document parser supporting:
- PDF: Parse using pdfjs-dist.
- DOCX: Parse using mammoth.
- PPTX: Parse using JSZip to extract slide XML text runs.
- TXT / MD: Read directly as text using FileReader.

#### [NEW] [gemini.js](file:///f:/flashcard_gen/notes-flashcards/src/services/gemini.js)
Create the Gemini integration service. Read the API key from VITE_GEMINI_API_KEY. Prompt the gemini-1.5-flash model to output structured JSON matching the requested schema. Ensure we restrict response formatting to application/json.

### Core UI Components

---

#### [NEW] [Navbar.jsx](file:///f:/flashcard_gen/notes-flashcards/src/components/Navbar.jsx)
Implement a responsive header showing the logo StudyForge, user study metrics summary, and dark/light mode toggle.

#### [NEW] [UploadZone.jsx](file:///f:/flashcard_gen/notes-flashcards/src/components/UploadZone.jsx)
Implement a drag-and-drop file upload zone. It will display the file details, size, parsing progress, and error alerts if parsing fails.

#### [MODIFY] [Flashcard.jsx](file:///f:/flashcard_gen/notes-flashcards/src/components/Flashcard.jsx)
Update the flashcard to support smooth 3D flip animations using CSS perspective and transform styles. Add confidence rating buttons (Know / Don't Know).

#### [NEW] [FlashcardDeck.jsx](file:///f:/flashcard_gen/notes-flashcards/src/components/FlashcardDeck.jsx)
Create a container for reviewing flashcards. It manages the queue of cards, tracking confidence ratings, updating spaced repetition lists, and saving learning progress.

#### [NEW] [MCQCard.jsx](file:///f:/flashcard_gen/notes-flashcards/src/components/MCQCard.jsx)
Create an interactive multiple-choice question card. Displays a question, four options, checks selected answers, displays correctness feedback with explanations, and tracks scores and progress.

#### [NEW] [SummaryPanel.jsx](file:///f:/flashcard_gen/notes-flashcards/src/components/SummaryPanel.jsx)
Create a panel to display the generated summary. Provide functions to copy text to clipboard and export as a TXT file.

#### [NEW] [RevisionSheet.jsx](file:///f:/flashcard_gen/notes-flashcards/src/components/RevisionSheet.jsx)
Create a visual organizer for key concepts, definitions, formulas, and commands. Group contents by category with interactive accordion components.

#### [NEW] [LoadingScreen.jsx](file:///f:/flashcard_gen/notes-flashcards/src/components/LoadingScreen.jsx)
Implement a beautiful loading screen with Framer Motion that cycles through progress messages while waiting for PDF parsing and Gemini generation.

#### [NEW] [ProgressTracker.jsx](file:///f:/flashcard_gen/notes-flashcards/src/components/ProgressTracker.jsx)
Display overview metrics in a visual panel: total decks, total flashcards, MCQs generated, and overall study progress.

### Pages and Main Entry

---

#### [NEW] [Dashboard.jsx](file:///f:/flashcard_gen/notes-flashcards/src/pages/Dashboard.jsx)
Create the main page of the app. It will orchestrate loading files, launching the generator, listing saved decks in local storage, and rendering tab contents.

#### [MODIFY] [App.jsx](file:///f:/flashcard_gen/notes-flashcards/src/App.jsx)
Update the root component to load the Dashboard, initialize the theme state, and handle global error state boundaries.

#### [MODIFY] [index.css](file:///f:/flashcard_gen/notes-flashcards/src/index.css)
Add custom helper classes for 3D card flips (perspective-1000, transform-style-3d, backface-hidden) and scrollbar customizations.

## Verification Plan

### Automated Tests
- Run Vite dev server to verify there are no compilation errors.
- Run build commands to ensure production build compiles successfully.

### Manual Verification
- Open the application in the browser.
- Verify drag-and-drop and manual file uploads for PDF, DOCX, PPTX, TXT, and MD.
- Check parsing accuracy.
- Verify Gemini API responses convert correctly into the UI.
- Test dark mode persistence.
- Verify spaced repetition card queue updates.
- Test exports: Flashcards (JSON), MCQs (JSON), Summary (TXT).
