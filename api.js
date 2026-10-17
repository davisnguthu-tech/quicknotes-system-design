const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// DOM Elements
const loadBtn = document.getElementById('load-btn');
const submitBtn = document.getElementById('submit-btn');
const statusEl = document.getElementById('status');
const noteForm = document.getElementById('note-form');
const titleInput = document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');
const notesList = document.getElementById('notes-list');

// Status update helper
function setStatus(message, stateClass) {
  statusEl.className = 'status-message';
  if (stateClass) {
    statusEl.classList.add(stateClass);
    statusEl.textContent = message;
  } else {
    statusEl.textContent = '';
  }
}

// Button state helper
function setButtonsDisabled(disabled) {
  loadBtn.disabled = disabled;
  submitBtn.disabled = disabled;
  document.querySelectorAll('.delete-btn').forEach(btn => (btn.disabled = disabled));
}

// Reusable fetch wrapper
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }
  return response;
}

/*
 * JSONPlaceholder Note on Mock Behavior:
 * JSONPlaceholder is a fake REST API. Sending a DELETE request simulates a 
 * 200/204 response from the server, but does NOT actually alter or persist data on the backend.
 * Therefore, upon receiving a successful status code, we explicitly remove the note 
 * element from the DOM to deliver a realistic user experience.
 */
async function deleteNote(id, element) {
  setStatus('Deleting note...', 'loading');
  setButtonsDisabled(true);

  try {
    const res = await request(`${API_URL}/${id}`, { method: 'DELETE' });
    element.remove();
    setStatus(`Note deleted (status ${res.status}).`, 'success');

    if (notesList.children.length === 0) {
      setStatus('No notes remaining.', 'empty');
    }
  } catch (error) {
    setStatus(`Failed to delete note: ${error.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

// Helper to create note element
function createNoteElement(note) {
  const li = document.createElement('li');
  li.className = 'note-item';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'note-content';

  const h3 = document.createElement('h3');
  h3.textContent = note.title;

  const p = document.createElement('p');
  p.textContent = note.body;

  contentDiv.appendChild(h3);
  contentDiv.appendChild(p);

  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.textContent = 'Delete';
  delBtn.addEventListener('click', () => deleteNote(note.id, li));

  li.appendChild(contentDiv);
  li.appendChild(delBtn);

  return li;
}

// Render notes to list
function renderNotes(notes) {
  notesList.innerHTML = '';
  if (!notes || notes.length === 0) {
    setStatus('No notes found.', 'empty');
    return;
  }

  notes.forEach(note => {
    const noteEl = createNoteElement(note);
    notesList.appendChild(noteEl);
  });
}

// TASK 1: GET Notes
async function loadNotes() {
  setStatus('Loading notes...', 'loading');
  setButtonsDisabled(true);

  try {
    const res = await request(`${API_URL}?_limit=10`);
    const data = await res.json();
    renderNotes(data);
    setStatus('Loaded 10 notes from the server.', 'success');
  } catch (error) {
    setStatus(`Failed to fetch notes: ${error.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

// TASK 2: POST Note
async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  // Validation
  if (!title) {
    setStatus('Validation Error: Note title is required.', 'error');
    return;
  }

  if (title.length > 100) {
    setStatus('Validation Error: Note title must not exceed 100 characters.', 'error');
    return;
  }

  setStatus('Saving note...', 'loading');
  setButtonsDisabled(true);

  try {
    const res = await request(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, body, userId: 1 })
    });

    const status = res.status;
    const newNote = await res.json();

    if (statusEl.classList.contains('empty')) {
      notesList.innerHTML = '';
    }

    const noteEl = createNoteElement(newNote);
    notesList.prepend(noteEl);

    // Clear input fields
    titleInput.value = '';
    bodyInput.value = '';

    setStatus(`Note created (status ${status}, id ${newNote.id}).`, 'success');
  } catch (error) {
    setStatus(`Failed to create note: ${error.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

// Event Listeners
loadBtn.addEventListener('click', loadNotes);
noteForm.addEventListener('submit', createNote);