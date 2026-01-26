// Main Application Logic for Spelling Practice App

class SpellingApp {
    constructor() {
        // DOM Elements
        this.elements = {
            // Screens
            startScreen: document.getElementById('startScreen'),
            practiceScreen: document.getElementById('practiceScreen'),
            resultsScreen: document.getElementById('resultsScreen'),

            // Start screen
            startBtn: document.getElementById('startBtn'),
            wordCountInput: document.getElementById('wordCount'),
            prioritizeWeakCheckbox: document.getElementById('prioritizeWeak'),

            // Practice screen
            speakBtn: document.getElementById('speakBtn'),
            repeatBtn: document.getElementById('repeatBtn'),
            spellingInput: document.getElementById('spellingInput'),
            checkBtn: document.getElementById('checkBtn'),
            feedback: document.getElementById('feedback'),
            retypeArea: document.getElementById('retypeArea'),
            correctSpelling: document.getElementById('correctSpelling'),
            retypeInput: document.getElementById('retypeInput'),
            retypeCheckBtn: document.getElementById('retypeCheckBtn'),

            // Stats bar
            statsBar: document.getElementById('statsBar'),
            wordProgress: document.getElementById('wordProgress'),
            correctCount: document.getElementById('correctCount'),
            accuracyDisplay: document.getElementById('accuracyDisplay'),
            stopBtn: document.getElementById('stopBtn'),

            // Results screen
            finalWords: document.getElementById('finalWords'),
            finalCorrect: document.getElementById('finalCorrect'),
            finalAccuracy: document.getElementById('finalAccuracy'),
            restartBtn: document.getElementById('restartBtn'),

            // Settings
            settingsBtn: document.getElementById('settingsBtn'),
            settingsModal: document.getElementById('settingsModal'),
            closeSettingsBtn: document.getElementById('closeSettingsBtn'),
            wordListOptions: document.getElementById('wordListOptions'),
            thresholdSlider: document.getElementById('thresholdSlider'),
            thresholdValue: document.getElementById('thresholdValue'),
            totalPracticed: document.getElementById('totalPracticed'),
            overallAccuracy: document.getElementById('overallAccuracy'),
            struggledCount: document.getElementById('struggledCount'),
            resetStatsBtn: document.getElementById('resetStatsBtn')
        };

        // Session state
        this.session = {
            wordQueue: [],
            currentWord: null,
            attempted: 0,
            correct: 0,
            startTime: null,
            elapsedBeforePause: 0, // Track time elapsed before pausing for repeat
            mode: 'continuous', // 'continuous' or 'fixed'
            targetCount: 10,
            prioritizeWeak: false,
            isActive: false,
            isFirstSpeak: true, // Track if this is the first time speaking the word
            retryQueue: [] // Words to retry after incorrect answer
        };

        // Speech synthesis
        this.synth = window.speechSynthesis;
        this.voices = [];

        this.init();
    }

    init() {
        this.loadVoices();
        this.setupEventListeners();
        this.initSettings();
        this.updateOverallStats();
    }

    loadVoices() {
        // Load available voices
        const loadVoicesHandler = () => {
            this.voices = this.synth.getVoices();
        };

        loadVoicesHandler();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoicesHandler;
        }
    }

    setupEventListeners() {
        // Start screen
        this.elements.startBtn.addEventListener('click', () => this.startSession());

        // Mode selection
        document.querySelectorAll('input[name="testMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.elements.wordCountInput.disabled = e.target.value === 'continuous';
            });
        });

        // Practice screen
        this.elements.speakBtn.addEventListener('click', () => this.speakCurrentWord());
        this.elements.repeatBtn.addEventListener('click', () => this.repeatWord());
        this.elements.checkBtn.addEventListener('click', () => this.checkAnswer());
        this.elements.spellingInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.elements.checkBtn.disabled) {
                this.checkAnswer();
            }
        });

        // Retype area
        this.elements.retypeCheckBtn.addEventListener('click', () => this.checkRetype());
        this.elements.retypeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkRetype();
            }
        });

        // Stop button
        this.elements.stopBtn.addEventListener('click', () => this.endSession());

        // Results screen
        this.elements.restartBtn.addEventListener('click', () => this.showScreen('start'));

        // Settings
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) {
                this.closeSettings();
            }
        });

        // Threshold slider
        this.elements.thresholdSlider.addEventListener('input', (e) => {
            this.elements.thresholdValue.textContent = `${e.target.value} seconds`;
        });
        this.elements.thresholdSlider.addEventListener('change', (e) => {
            this.saveThresholdSetting(parseInt(e.target.value) * 1000);
        });

        // Reset stats
        this.elements.resetStatsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
                Storage.resetStats();
                this.updateOverallStats();
            }
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcut(e));
    }

    handleKeyboardShortcut(e) {
        // Don't trigger shortcuts if settings modal is open
        if (!this.elements.settingsModal.classList.contains('hidden')) {
            return;
        }

        // Check if on practice screen
        const onPracticeScreen = !this.elements.practiceScreen.classList.contains('hidden');

        // Space to repeat word - works even in spelling input
        if (e.code === 'Space' && onPracticeScreen && !this.elements.repeatBtn.disabled) {
            // Check if we're in the spelling input (not retype input)
            const inSpellingInput = document.activeElement === this.elements.spellingInput;
            const inRetypeInput = document.activeElement === this.elements.retypeInput;

            // Allow space for repeat in spelling input, but not in retype input
            if (inSpellingInput || (!inRetypeInput && document.activeElement.tagName !== 'INPUT')) {
                e.preventDefault();
                this.repeatWord();
            }
        }

        // Enter to hear word (when speak button is enabled)
        if (e.code === 'Enter' && onPracticeScreen && !this.elements.speakBtn.disabled) {
            const isTypingInInput = document.activeElement.tagName === 'INPUT' &&
                                    document.activeElement.type !== 'radio' &&
                                    document.activeElement.type !== 'checkbox';
            if (!isTypingInInput) {
                e.preventDefault();
                this.speakCurrentWord();
            }
        }
    }

    initSettings() {
        const settings = Storage.getSettings();

        // Populate word list checkboxes
        const lists = getListMetadata();
        this.elements.wordListOptions.innerHTML = lists.map(list => `
            <label>
                <input type="checkbox"
                       value="${list.id}"
                       ${settings.enabledLists.includes(list.id) ? 'checked' : ''}>
                ${list.name} (${list.wordCount} words)
            </label>
        `).join('');

        // Add change listener to checkboxes
        this.elements.wordListOptions.querySelectorAll('input').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.saveListSettings());
        });

        // Set threshold slider
        const thresholdSeconds = Math.round(settings.struggleThreshold / 1000);
        this.elements.thresholdSlider.value = thresholdSeconds;
        this.elements.thresholdValue.textContent = `${thresholdSeconds} seconds`;
    }

    saveListSettings() {
        const checkboxes = this.elements.wordListOptions.querySelectorAll('input:checked');
        const enabledLists = Array.from(checkboxes).map(cb => cb.value);

        if (enabledLists.length === 0) {
            alert('Please select at least one word list.');
            // Re-check the first list
            const firstCheckbox = this.elements.wordListOptions.querySelector('input');
            if (firstCheckbox) {
                firstCheckbox.checked = true;
                enabledLists.push(firstCheckbox.value);
            }
        }

        const settings = Storage.getSettings();
        settings.enabledLists = enabledLists;
        Storage.saveSettings(settings);
    }

    saveThresholdSetting(thresholdMs) {
        const settings = Storage.getSettings();
        settings.struggleThreshold = thresholdMs;
        Storage.saveSettings(settings);
    }

    updateOverallStats() {
        const stats = Storage.getOverallStats();
        this.elements.totalPracticed.textContent = stats.totalPracticed;
        this.elements.overallAccuracy.textContent = stats.totalAttempts > 0
            ? `${stats.overallAccuracy}%`
            : '--';
        this.elements.struggledCount.textContent = stats.struggledCount;
    }

    openSettings() {
        this.updateOverallStats();
        this.elements.settingsModal.classList.remove('hidden');
    }

    closeSettings() {
        this.elements.settingsModal.classList.add('hidden');
    }

    showScreen(screen) {
        this.elements.startScreen.classList.add('hidden');
        this.elements.practiceScreen.classList.add('hidden');
        this.elements.resultsScreen.classList.add('hidden');

        switch (screen) {
            case 'start':
                this.elements.startScreen.classList.remove('hidden');
                this.elements.stopBtn.classList.add('hidden');
                break;
            case 'practice':
                this.elements.practiceScreen.classList.remove('hidden');
                this.elements.stopBtn.classList.remove('hidden');
                break;
            case 'results':
                this.elements.resultsScreen.classList.remove('hidden');
                this.elements.stopBtn.classList.add('hidden');
                break;
        }
    }

    startSession() {
        const settings = Storage.getSettings();

        // Get mode
        const modeRadio = document.querySelector('input[name="testMode"]:checked');
        this.session.mode = modeRadio.value;
        this.session.targetCount = this.session.mode === 'fixed'
            ? parseInt(this.elements.wordCountInput.value) || 10
            : Infinity;

        this.session.prioritizeWeak = this.elements.prioritizeWeakCheckbox.checked;

        // Build word pool
        let wordPool = getWordsFromLists(settings.enabledLists);

        if (wordPool.length === 0) {
            alert('No words available. Please select at least one word list in settings.');
            return;
        }

        // Prioritize weak words if enabled
        if (this.session.prioritizeWeak) {
            const weakWords = Storage.getStruggledWords(wordPool);
            const incorrectWords = Storage.getIncorrectWords(wordPool);

            // Combine weak and incorrect words, remove duplicates
            const priorityWords = [...new Map([...weakWords, ...incorrectWords].map(w => [w.word, w])).values()];

            if (priorityWords.length > 0) {
                // If we have enough priority words, use them
                if (priorityWords.length >= this.session.targetCount) {
                    wordPool = priorityWords;
                } else {
                    // Use priority words first, then fill with others
                    const otherWords = wordPool.filter(w =>
                        !priorityWords.some(pw => pw.word === w.word)
                    );
                    wordPool = [...priorityWords, ...this.shuffleArray(otherWords)];
                }
            }
        }

        // Shuffle and prepare queue
        this.session.wordQueue = this.shuffleArray([...wordPool]);
        this.session.retryQueue = [];
        this.session.attempted = 0;
        this.session.correct = 0;
        this.session.isActive = true;
        this.session.currentWord = null;

        // Reset UI
        this.updateStats();
        this.resetPracticeUI();
        this.showScreen('practice');
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    resetPracticeUI() {
        this.elements.spellingInput.value = '';
        this.elements.spellingInput.disabled = true;
        this.elements.checkBtn.disabled = true;
        this.elements.repeatBtn.disabled = true;
        this.elements.feedback.classList.add('hidden');
        this.elements.retypeArea.classList.add('hidden');
        this.elements.speakBtn.disabled = false;
    }

    getNextWord() {
        // First check retry queue (incorrect words to retry)
        if (this.session.retryQueue.length > 0) {
            return this.session.retryQueue.shift();
        }

        // Check if we've reached target count
        if (this.session.mode === 'fixed' && this.session.attempted >= this.session.targetCount) {
            return null;
        }

        // Get from main queue
        if (this.session.wordQueue.length > 0) {
            return this.session.wordQueue.shift();
        }

        return null;
    }

    speakCurrentWord() {
        // Get next word if we don't have one
        if (!this.session.currentWord) {
            this.session.currentWord = this.getNextWord();
            this.session.isFirstSpeak = true;
            this.session.elapsedBeforePause = 0;

            if (!this.session.currentWord) {
                this.endSession();
                return;
            }
        }

        // Cancel any ongoing speech
        this.synth.cancel();

        const word = this.session.currentWord;
        const isFirst = this.session.isFirstSpeak;

        // Speak the word - slower on first time
        const wordUtterance = new SpeechSynthesisUtterance(word.word);
        wordUtterance.rate = isFirst ? 0.7 : 0.8; // Slower for first speak

        // Speak the sentence after a short pause
        const sentenceUtterance = new SpeechSynthesisUtterance(word.sentence);
        sentenceUtterance.rate = 0.9;

        // Enable input after speaking
        wordUtterance.onend = () => {
            setTimeout(() => {
                this.synth.speak(sentenceUtterance);
            }, 500);
        };

        sentenceUtterance.onend = () => {
            this.elements.spellingInput.disabled = false;
            this.elements.checkBtn.disabled = false;
            this.elements.spellingInput.focus();

            // Start or resume timer
            this.session.startTime = Date.now();
            this.session.isFirstSpeak = false;
        };

        this.synth.speak(wordUtterance);

        // Update UI
        this.elements.speakBtn.disabled = true;
        this.elements.repeatBtn.disabled = false;
    }

    repeatWord() {
        if (!this.session.currentWord) return;

        // Pause the timer - save elapsed time so far
        if (this.session.startTime) {
            this.session.elapsedBeforePause += Date.now() - this.session.startTime;
            this.session.startTime = null;
        }

        // Cancel any ongoing speech
        this.synth.cancel();

        const word = this.session.currentWord;

        // Speak the word at normal repeat speed
        const wordUtterance = new SpeechSynthesisUtterance(word.word);
        wordUtterance.rate = 0.8;

        // Speak the sentence after a short pause
        const sentenceUtterance = new SpeechSynthesisUtterance(word.sentence);
        sentenceUtterance.rate = 0.9;

        wordUtterance.onend = () => {
            setTimeout(() => {
                this.synth.speak(sentenceUtterance);
            }, 500);
        };

        sentenceUtterance.onend = () => {
            // Resume timer
            this.session.startTime = Date.now();
            this.elements.spellingInput.focus();
        };

        this.synth.speak(wordUtterance);
    }

    checkAnswer() {
        const userAnswer = this.elements.spellingInput.value.trim().toLowerCase();
        const correctAnswer = this.session.currentWord.word.toLowerCase();
        // Include any time elapsed before pausing for repeat
        const timeMs = (Date.now() - this.session.startTime) + this.session.elapsedBeforePause;

        this.session.attempted++;

        // Record the attempt
        Storage.recordAttempt(correctAnswer, userAnswer === correctAnswer, timeMs);

        if (userAnswer === correctAnswer) {
            // Correct answer
            this.session.correct++;
            this.showFeedback(true);

            // Move to next word after a short delay
            setTimeout(() => {
                this.session.currentWord = null;
                this.resetPracticeUI();
                this.updateStats();

                // Check if session should end
                if (this.session.mode === 'fixed' &&
                    this.session.attempted >= this.session.targetCount &&
                    this.session.retryQueue.length === 0) {
                    this.endSession();
                }
            }, 1000);
        } else {
            // Incorrect answer
            this.showFeedback(false);
            this.showRetypePrompt();

            // Add to retry queue for later
            this.session.retryQueue.push(this.session.currentWord);
        }

        this.updateStats();
    }

    showFeedback(correct) {
        this.elements.feedback.textContent = correct ? '✓ Correct!' : '✗ Incorrect';
        this.elements.feedback.className = `feedback ${correct ? 'correct' : 'incorrect'}`;
        this.elements.feedback.classList.remove('hidden');

        // Disable input during feedback
        this.elements.spellingInput.disabled = true;
        this.elements.checkBtn.disabled = true;
    }

    showRetypePrompt() {
        this.elements.correctSpelling.textContent = this.session.currentWord.word;
        this.elements.retypeInput.value = '';
        this.elements.retypeArea.classList.remove('hidden');
        this.elements.retypeInput.focus();
    }

    checkRetype() {
        const userRetype = this.elements.retypeInput.value.trim().toLowerCase();
        const correctAnswer = this.session.currentWord.word.toLowerCase();

        if (userRetype === correctAnswer) {
            // Correct retype, move on
            this.session.currentWord = null;
            this.resetPracticeUI();
            this.updateStats();

            // Check if session should end
            if (this.session.mode === 'fixed' &&
                this.session.attempted >= this.session.targetCount &&
                this.session.retryQueue.length === 0) {
                this.endSession();
            }
        } else {
            // Wrong retype, shake input and try again
            this.elements.retypeInput.style.animation = 'none';
            this.elements.retypeInput.offsetHeight; // Trigger reflow
            this.elements.retypeInput.style.animation = 'shake 0.5s';
            this.elements.retypeInput.select();
        }
    }

    updateStats() {
        const attempted = this.session.attempted;
        const correct = this.session.correct;
        const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

        if (this.session.mode === 'fixed') {
            this.elements.wordProgress.textContent = `Words: ${attempted}/${this.session.targetCount}`;
        } else {
            this.elements.wordProgress.textContent = `Words: ${attempted}`;
        }

        this.elements.correctCount.textContent = `Correct: ${correct}`;
        this.elements.accuracyDisplay.textContent = attempted > 0
            ? `Accuracy: ${accuracy}%`
            : 'Accuracy: --';
    }

    endSession() {
        this.session.isActive = false;
        this.synth.cancel();

        // Calculate final stats
        const attempted = this.session.attempted;
        const correct = this.session.correct;
        const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

        // Update results screen
        this.elements.finalWords.textContent = attempted;
        this.elements.finalCorrect.textContent = correct;
        this.elements.finalAccuracy.textContent = `${accuracy}%`;

        // Save session
        Storage.saveSession({
            attempted,
            correct,
            accuracy,
            mode: this.session.mode,
            targetCount: this.session.targetCount
        });

        this.showScreen('results');
    }
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SpellingApp();
});
