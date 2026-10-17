const API_URL = 'https://jsonplaceholder.typicode.com/posts';

const loadBtn = document.getElementById('load-btn');
const submitBtn = document.getElementById('submit-btn');
const statusEl = document.getElementById('status');
const noteForm = document.getElementById('note-form');
const titleInput = document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');
const notesList = document.getElementById('notes-list');

function setStatus(message, stateClass) {
  statusEl.className = 'status-message';
  if (stateClass) {
    statusEl.classList.add(stateClass);
    statusEl.textContent = message;
  } else {
    statusEl.textContent = '';
  }
}

function setButtonsDisabled(disabled) {
  loadBtn.disabled = disabled;
  submitBtn.disabled = disabled;
  document.querySelectorAll('.delete-btn').forEach(btn => (btn.disabled = disabled));
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }
  return response;
}

function renderNotes(notes) {
  notesList.innerHTML = '';
  if (!notes || notes.length === 0) {
    setStatus('No notes found.', 'empty');
    return;
  }

  notes.forEach(note => {
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

    li.appendChild(contentDiv);
    li.appendChild(delBtn);
    notesList.appendChild(li);
  });
}

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

loadBtn.addEventListener('click', loadNotes);