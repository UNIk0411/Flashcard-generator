# StudyForge Walkthrough

StudyForge is a production-quality, responsive AI study companion designed to generate learning assets (flashcards, multiple-choice quizzes, summaries, revision sheets, and exam questions) from uploaded files (PDF, DOCX, PPTX, TXT, MD).

## Summary of Changes

We implemented a client-side architecture that eliminates the need for backend servers:

1. **State Persistence & Theme Management**:
   - `src/hooks/useLocalStorage.js`: Synchronizes decks, user progress, and dark/light modes automatically in the browser.

2. **Client-side Document Parser**:
   - `src/services/fileParser.js`: Extracts text from PDF files (using pdfjs-dist), DOCX files (using mammoth), PPTX files (using JSZip to parse slide XML structures), and TXT/MD files.

3. **Gemini API Integration**:
   - `src/services/gemini.js`: Interacts with gemini-1.5-flash. Utilizes generationConfig to enforce a strict structured JSON output schema matching the required UI properties.

4. **Modern UI and Learning Components**:
   - `src/components/Navbar.jsx`: Features dark mode switching and clean branding.
   - `src/components/UploadZone.jsx`: Handles drag-and-drop file imports, file type validation, and error state alerts.
   - `src/components/Flashcard.jsx` & `src/components/FlashcardDeck.jsx`: Implements a 3D double-sided flip animation with spaced repetition tracking. Cards marked as "Don't Know" are automatically queued again. Allows exporting flashcards as JSON.
   - `src/components/MCQCard.jsx`: Displays interactive multiple-choice questions with correct/incorrect coloring, detailed explanation callouts, progress scoring, and JSON exporting.
   - `src/components/SummaryPanel.jsx`: Shows formatted summaries with copy-to-clipboard and TXT file exporting controls.
   - `src/components/RevisionSheet.jsx`: Lists categorized definitions, formulas, and terminal commands using an accordion card layout.
   - `src/components/LoadingScreen.jsx`: Displays a step-by-step loading sequence during text extraction and Gemini calls.
   - `src/components/ProgressTracker.jsx`: Visualizes cumulative dashboard statistics (mastery index, decks built, and cards generated).
   - `src/pages/Dashboard.jsx`: Orchestrates the main view layout, file loading events, sidebar navigation, and the Important Questions list.

## Local Verification Steps

To run and test the application on your computer:

1. **Set up API Key**:
   - Create a file named `.env` in the root of the project (`f:\flashcard_gen\notes-flashcards\.env`).
   - Add your Gemini API key:
     ```env
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     ```

2. **Install Dependencies**:
   - In your command line terminal, run:
     ```bash
     npm install
     ```

3. **Run Dev Server**:
   - To launch the development environment, run:
     ```bash
     npm run dev
     ```
   - Open the URL printed in the terminal (usually `http://localhost:5173`) in your web browser.

4. **Verify Features**:
   - Select or drag a PDF/DOCX/PPTX/TXT/MD document to the upload zone.
   - Observe the step-by-step loading overlay.
   - Browse the newly created deck using the Dashboard tabs (Flashcards, MCQ Quiz, Summary, Revision Sheet, Exam Questions).
   - Test the Dark Mode toggle in the top navbar.
   - Export your generated content using the download buttons.
