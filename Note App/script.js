// DOM Elements
const newNoteBtn = document.getElementById('newNoteBtn');
const notesList = document.getElementById('notesList');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const wordCount = document.getElementById('wordCount');
const lastEdited = document.getElementById('lastEdited');
const startSpeechBtn = document.getElementById('startSpeechBtn');
const speechStatus = document.getElementById('speechStatus');
const listeningIndicator = document.querySelector('.listening-indicator');
const favoriteBtn = document.getElementById('favoriteBtn');
const deleteBtn = document.getElementById('deleteBtn');
const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');
const underlineBtn = document.getElementById('underlineBtn');
const fontSelect = document.getElementById('fontSelect');
const tagSelect = document.getElementById('tagSelect');
const notificationModal = document.getElementById('notificationModal');
const notificationMessage = document.getElementById('notificationMessage');
const allCategories = document.querySelectorAll('.category');
const noteCounters = document.querySelectorAll('.count');

// State Variables
let notes = [];
let currentNoteId = null;
let recognition = null;
let isListening = false;

// Check for browser speech recognition support
const setupSpeechRecognition = () => {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!window.SpeechRecognition) {
        startSpeechBtn.disabled = true;
        speechStatus.textContent = "Speech recognition not supported in this browser";
        return false;
    }
    
    recognition = new window.SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
        isListening = true;
        startSpeechBtn.classList.add('active');
        startSpeechBtn.innerHTML = '<i class="fas fa-microphone-slash"></i><span>Stop Dictation</span>';
        speechStatus.textContent = "Listening...";
        listeningIndicator.classList.add('active');
        showNotification("Speech recognition started");
    };
    
    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
        
        // Insert at cursor position or append to end
        insertTextAtCursor(transcript);
        updateWordCount();
        saveCurrentNote();
    };
    
    recognition.onend = () => {
        isListening = false;
        startSpeechBtn.classList.remove('active');
        startSpeechBtn.innerHTML = '<i class="fas fa-microphone"></i><span>Start Dictation</span>';
        speechStatus.textContent = "Click to start speaking";
        listeningIndicator.classList.remove('active');
    };
    
    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        speechStatus.textContent = `Error: ${event.error}`;
        stopSpeechRecognition();
    };
    
    return true;
};

// Initialize the app
const initApp = () => {
    loadNotesFromLocalStorage();
    setupEventListeners();
    const speechSupported = setupSpeechRecognition();
    
    if (!speechSupported) {
        document.querySelector('.speech-controls').classList.add('disabled');
    }
    
    // Create a default note if no notes exist
    if (notes.length === 0) {
        createNewNote();
    } else {
        renderNotesList();
        selectNote(notes[0].id);
    }
    
    updateCategoryCounters();
};

// Set up event listeners
const setupEventListeners = () => {
    // New note button
    newNoteBtn.addEventListener('click', createNewNote);
    
    // Note editor events
    noteTitle.addEventListener('input', () => {
        saveCurrentNote();
        updateNoteInList(currentNoteId);
    });
    
    noteContent.addEventListener('input', () => {
        updateWordCount();
        saveCurrentNote();
        updateNoteInList(currentNoteId);
    });
    
    // Speech recognition
    startSpeechBtn.addEventListener('click', toggleSpeechRecognition);
    
    // Formatting buttons
    boldBtn.addEventListener('click', () => formatText('bold'));
    italicBtn.addEventListener('click', () => formatText('italic'));
    underlineBtn.addEventListener('click', () => formatText('underline'));
    fontSelect.addEventListener('change', () => formatText('fontsize', fontSelect.value));
    
    // Note actions
    favoriteBtn.addEventListener('click', toggleFavorite);
    deleteBtn.addEventListener('click', deleteCurrentNote);
    tagSelect.addEventListener('change', () => {
        if (currentNoteId) {
            const note = notes.find(n => n.id === currentNoteId);
            if (note) {
                note.tag = tagSelect.value;
                saveCurrentNote();
                updateNoteInList(currentNoteId);
                updateCategoryCounters();
            }
        }
    });
    
    // Category filters
    allCategories.forEach(category => {
        category.addEventListener('click', () => {
            allCategories.forEach(c => c.classList.remove('active'));
            category.classList.add('active');
            filterNotes(category.querySelector('span').textContent.trim());
        });
    });
};

// Load notes from localStorage
const loadNotesFromLocalStorage = () => {
    const savedNotes = localStorage.getItem('vocalityNotes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    }
};

// Save notes to localStorage
const saveNotesToLocalStorage = () => {
    localStorage.setItem('vocalityNotes', JSON.stringify(notes));
};

// Create a new note
const createNewNote = () => {
    const newNote = {
        id: Date.now(),
        title: "New Note",
        content: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
        tag: ""
    };
    
    notes.unshift(newNote);
    saveNotesToLocalStorage();
    renderNotesList();
    selectNote(newNote.id);
    noteTitle.focus();
    updateCategoryCounters();
    showNotification("New note created");
};

// Render the notes list
const renderNotesList = () => {
    notesList.innerHTML = '';
    
    notes.forEach(note => {
        const noteCard = createNoteCard(note);
        notesList.appendChild(noteCard);
    });
};

// Create a note card element
const createNoteCard = (note) => {
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';
    noteCard.dataset.id = note.id;
    
    if (note.id === currentNoteId) {
        noteCard.classList.add('active');
    }
    
    let tagColor = '';
    if (note.tag === 'work') tagColor = '#FFDE7D';
    else if (note.tag === 'personal') tagColor = '#FF9B73';
    else if (note.tag === 'ideas') tagColor = '#B5EAD7';
    
    const date = new Date(note.updatedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    noteCard.innerHTML = `
        <h3>${note.title || "Untitled"}</h3>
        <p>${stripHtml(note.content).substring(0, 100) || "No content"}</p>
        <div class="card-footer">
            ${note.tag ? `<span><span class="tag-indicator" style="background-color: ${tagColor}"></span>${note.tag}</span>` : '<span>No tag</span>'}
            <span>${date}</span>
        </div>
        ${note.isFavorite ? '<span class="favorite-indicator"><i class="fas fa-star"></i></span>' : ''}
    `;
    
    noteCard.addEventListener('click', () => {
        selectNote(note.id);
    });
    
    return noteCard;
};

// Select a note to edit
const selectNote = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    currentNoteId = noteId;
    
    // Update UI
    document.querySelectorAll('.note-card').forEach(card => {
        card.classList.remove('active');
        if (card.dataset.id == noteId) {
            card.classList.add('active');
        }
    });
    
    // Populate editor
    noteTitle.value = note.title || '';
    noteContent.innerHTML = note.content || '';
    tagSelect.value = note.tag || '';
    
    // Update favorite button
    if (note.isFavorite) {
        favoriteBtn.innerHTML = '<i class="fas fa-star"></i>';
    } else {
        favoriteBtn.innerHTML = '<i class="far fa-star"></i>';
    }
    
    updateWordCount();
    updateLastEdited(note.updatedAt);
};

// Save the current note
const saveCurrentNote = () => {
    if (!currentNoteId) return;
    
    const noteIndex = notes.findIndex(n => n.id === currentNoteId);
    if (noteIndex === -1) return;
    
    notes[noteIndex].title = noteTitle.value;
    notes[noteIndex].content = noteContent.innerHTML;
    notes[noteIndex].updatedAt = new Date().toISOString();
    
    saveNotesToLocalStorage();
    updateLastEdited(notes[noteIndex].updatedAt);
};

// Update a note in the list
const updateNoteInList = (noteId) => {
    const noteCard = document.querySelector(`.note-card[data-id="${noteId}"]`);
    if (!noteCard) return;
    
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    const titleElem = noteCard.querySelector('h3');
    const contentElem = noteCard.querySelector('p');
    
    titleElem.textContent = note.title || "Untitled";
    contentElem.textContent = stripHtml(note.content).substring(0, 100) || "No content";
};

// Toggle favorite status
const toggleFavorite = () => {
    if (!currentNoteId) return;
    
    const noteIndex = notes.findIndex(n => n.id === currentNoteId);
    if (noteIndex === -1) return;
    
    notes[noteIndex].isFavorite = !notes[noteIndex].isFavorite;
    
    if (notes[noteIndex].isFavorite) {
        favoriteBtn.innerHTML = '<i class="fas fa-star"></i>';
        showNotification("Added to favorites");
    } else {
        favoriteBtn.innerHTML = '<i class="far fa-star"></i>';
        showNotification("Removed from favorites");
    }
    
    saveNotesToLocalStorage();
    renderNotesList();
    updateCategoryCounters();
};

// Delete the current note
const deleteCurrentNote = () => {
    if (!currentNoteId || notes.length <= 1) return;
    
    const confirmed = confirm("Are you sure you want to delete this note?");
    if (!confirmed) return;
    
    const noteIndex = notes.findIndex(n => n.id === currentNoteId);
    if (noteIndex === -1) return;
    
    notes.splice(noteIndex, 1);
    saveNotesToLocalStorage();
    
    showNotification("Note deleted");
    renderNotesList();
    selectNote(notes[0].id);
    updateCategoryCounters();
};

// Filter notes by category
const filterNotes = (category) => {
    const filteredNotes = [...document.querySelectorAll('.note-card')];
    
    if (category === 'All Notes') {
        filteredNotes.forEach(card => card.style.display = 'block');
    } else if (category === 'Favorites') {
        filteredNotes.forEach(card => {
            const noteId = parseInt(card.dataset.id);
            const note = notes.find(n => n.id === noteId);
            card.style.display = note && note.isFavorite ? 'block' : 'none';
        });
    } else if (category === 'Trash') {
        // Trash functionality can be implemented here
        filteredNotes.forEach(card => card.style.display = 'none');
    }
};

// Update word count
const updateWordCount = () => {
    const text = stripHtml(noteContent.innerHTML);
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
};

// Update last edited timestamp
const updateLastEdited = (timestamp) => {
    const date = new Date(timestamp);
    lastEdited.textContent = `Edited: ${date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}`;
};

// Update category counters
const updateCategoryCounters = () => {
    // All notes counter
    noteCounters[0].textContent = notes.length;
    
    // Favorites counter
    const favoritesCount = notes.filter(note => note.isFavorite).length;
    noteCounters[1].textContent = favoritesCount;
    
    // Trash counter (if implemented)
    noteCounters[2].textContent = 0;
};

// Toggle speech recognition
const toggleSpeechRecognition = () => {
    if (!recognition) return;
    
    if (isListening) {
        stopSpeechRecognition();
    } else {
        startSpeechRecognition();
    }
};

// Start speech recognition
const startSpeechRecognition = () => {
    try {
        recognition.start();
    } catch (err) {
        console.error("Error starting speech recognition:", err);
    }
};

// Stop speech recognition
const stopSpeechRecognition = () => {
    if (isListening) {
        recognition.stop();
    }
};

// Insert text at cursor position
const insertTextAtCursor = (text) => {
    const selection = window.getSelection();
    
    if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // If noteContent is empty, set focus to it
        if (noteContent.innerHTML === '') {
            noteContent.focus();
        }
        
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        
        // Move cursor to end of inserted text
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        // If no range, just append
        noteContent.innerHTML += text;
    }
};

// Format text
const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    noteContent.focus();
    saveCurrentNote();
};

// Show notification
const showNotification = (message) => {
    notificationMessage.textContent = message;
    notificationModal.classList.add('show');
    
    setTimeout(() => {
        notificationModal.classList.remove('show');
    }, 2000);
};

// Helper function to strip HTML tags
const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Handle beforeunload to save changes
window.addEventListener('beforeunload', () => {
    if (currentNoteId) {
        saveCurrentNote();
    }
});