// ===== GREETING =====
function updateGreeting() {
  const now = new Date();
 
  // Clock
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const ss = now.getSeconds().toString().padStart(2, '0');
  document.getElementById('clock').textContent = `${hh}:${mm}:${ss}`;
 
  // Date
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('date-display').textContent =
    now.toLocaleDateString('en-US', dateOptions);
 
  // Greeting based on time
  const hour = now.getHours();
  let sapa;
  if (hour < 12)      sapa = 'Good Morning';
  else if (hour < 15) sapa = 'Good Afternoon';
  else if (hour < 18) sapa = 'Good Afternoon';
  else if (hour < 21) sapa = 'Good Evening';
  else                sapa = 'Good Night';
 
  const name = localStorage.getItem('userName');
  document.getElementById('greet-text').textContent =
    name ? `${sapa}, ${name}!` : `${sapa}!`;
}
 
updateGreeting();
setInterval(updateGreeting, 1000);
 
 
// ===== Custom Name =====
const displayNameEl = document.getElementById('display-name');
const nameForm      = document.getElementById('name-form');
const nameInput     = document.getElementById('name-input');
const btnEditName   = document.getElementById('btn-edit-name');
const btnSaveName   = document.getElementById('btn-save-name');
 
function loadName() {
  const saved = localStorage.getItem('userName');
  if (saved) {
    displayNameEl.textContent = saved;
    nameInput.value = saved;
  } else {
    displayNameEl.textContent = 'Set your name ↑';
  }
}
loadName();
 
btnEditName.addEventListener('click', () => {
  nameForm.classList.toggle('hidden');
  if (!nameForm.classList.contains('hidden')) nameInput.focus();
});
 
btnSaveName.addEventListener('click', saveName);
nameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') saveName();
  if (e.key === 'Escape') nameForm.classList.add('hidden');
});
 
function saveName() {
  const val = nameInput.value.trim();
  if (!val) return;
  localStorage.setItem('userName', val);
  displayNameEl.textContent = val;
  nameForm.classList.add('hidden');
  updateGreeting();
}
 
 
// ===== Focus Timer =====
let totalSeconds  = 25 * 60;
let timerInterval = null;
let customMinutes = 25;
 
const timerDisplay  = document.getElementById('timer-display');
const durationInput = document.getElementById('duration-input');
const btnStart      = document.getElementById('btn-start');
const btnStop       = document.getElementById('btn-stop');
const btnReset      = document.getElementById('btn-reset');
 
// Load saved duration preference
const savedDuration = localStorage.getItem('timerDuration');
if (savedDuration) {
  customMinutes = parseInt(savedDuration);
  durationInput.value = customMinutes;
  totalSeconds = customMinutes * 60;
  renderTimer();
}
 
function renderTimer() {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${m}:${s}`;
}
renderTimer();
 
btnStart.addEventListener('click', () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerDisplay.textContent = '00:00';
      alert('Waktunya istirahat!! .');
      return;
    }
    totalSeconds--;
    renderTimer();
  }, 1000);
});
 
btnStop.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
});
 
btnReset.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  customMinutes = parseInt(durationInput.value) || 25;
  customMinutes = Math.max(1, Math.min(120, customMinutes));
  durationInput.value = customMinutes;
  localStorage.setItem('timerDuration', customMinutes);
  totalSeconds = customMinutes * 60;
  renderTimer();
});
 
durationInput.addEventListener('change', () => {
  if (!timerInterval) {
    customMinutes = parseInt(durationInput.value) || 25;
    customMinutes = Math.max(1, Math.min(120, customMinutes));
    durationInput.value = customMinutes;
    localStorage.setItem('timerDuration', customMinutes);
    totalSeconds = customMinutes * 60;
    renderTimer();
  }
});
 
 
// ===== TO-DO LIST =====
let todos    = JSON.parse(localStorage.getItem('todos')) || [];
let sortedAZ = false;
 
const todoInput   = document.getElementById('todo-input');
const btnAddTodo  = document.getElementById('btn-add-todo');
const todoList    = document.getElementById('todo-list');
const btnSort     = document.getElementById('btn-sort');
const taskCountEl = document.getElementById('task-count');
 
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}
 
function updateTaskCount() {
  const done  = todos.filter(t => t.done).length;
  const total = todos.length;
  taskCountEl.textContent = total ? `${done}/${total} done` : '';
}
 
function renderTodos() {
  todoList.innerHTML = '';
 
  let displayList = [...todos];
  if (sortedAZ) {
    displayList = displayList
      .map((t, i) => ({ ...t, originalIndex: i }))
      .sort((a, b) => a.text.localeCompare(b.text));
  } else {
    displayList = displayList.map((t, i) => ({ ...t, originalIndex: i }));
  }
 
  if (displayList.length === 0) {
    todoList.innerHTML = '<li style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px 0;">No tasks yet!</li>';
    updateTaskCount();
    return;
  }
 
  displayList.forEach(task => {
    const idx = task.originalIndex;
    const li  = document.createElement('li');
    li.className = 'todo-item';
 
    li.innerHTML = `
      <input type="checkbox" ${task.done ? 'checked' : ''} data-idx="${idx}">
      <span class="todo-item-text ${task.done ? 'done' : ''}" data-idx="${idx}">${escapeHtml(task.text)}</span>
      <div class="todo-item-actions">
        <button class="btn--edit" data-idx="${idx}">Edit</button>
        <button class="btn btn--danger" data-idx="${idx}">Delete</button>
      </div>
    `;
 
    // Checkbox: toggle done
    li.querySelector('input[type="checkbox"]').addEventListener('change', e => {
      todos[e.target.dataset.idx].done = e.target.checked;
      saveTodos();
      renderTodos();
    });
 
    // Text click: also toggle done
    li.querySelector('.todo-item-text').addEventListener('click', e => {
      const i = parseInt(e.target.dataset.idx);
      todos[i].done = !todos[i].done;
      saveTodos();
      renderTodos();
    });
 
    // Edit button
    li.querySelector('.btn--edit').addEventListener('click', e => {
      const i       = parseInt(e.target.dataset.idx);
      const span    = li.querySelector('.todo-item-text');
      const oldText = todos[i].text;
 
      const editInput    = document.createElement('input');
      editInput.type     = 'text';
      editInput.value    = oldText;
      editInput.className = 'todo-item-edit';
 
      span.replaceWith(editInput);
      editInput.focus();
      editInput.select();
 
      const saveEdit = () => {
        const newText = editInput.value.trim();
        if (!newText) { renderTodos(); return; }
        todos[i].text = newText;
        saveTodos();
        renderTodos();
      };
 
      editInput.addEventListener('blur', saveEdit);
      editInput.addEventListener('keydown', e => {
        if (e.key === 'Enter')  saveEdit();
        if (e.key === 'Escape') renderTodos();
      });
    });
 
    // Delete button
    li.querySelector('.btn--danger').addEventListener('click', e => {
      const i = parseInt(e.target.dataset.idx);
      todos.splice(i, 1);
      saveTodos();
      renderTodos();
    });
 
    todoList.appendChild(li);
  });
 
  updateTaskCount();
}
 
function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;
 
  // Prevent duplicate tasks (case-insensitive)
  const isDuplicate = todos.some(
    t => t.text.toLowerCase() === text.toLowerCase()
  );
  if (isDuplicate) {
    todoInput.style.borderColor = 'var(--accent-danger)';
    todoInput.placeholder = 'Task already exists!';
    setTimeout(() => {
      todoInput.style.borderColor = '';
      todoInput.placeholder = 'Add a new task...';
    }, 1500);
    return;
  }
 
  todos.push({ text, done: false });
  todoInput.value = '';
  saveTodos();
  renderTodos();
}
 
btnAddTodo.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});
 
// Sort toggle
btnSort.addEventListener('click', () => {
  sortedAZ = !sortedAZ;
  btnSort.textContent = sortedAZ ? 'Sort: Default' : 'Sort A–Z';
  renderTodos();
});
 
renderTodos();
 
 
// ===== QUICK LINKS =====
let links = JSON.parse(localStorage.getItem('links'));
if (!links) {
  links = [
    { name: 'Google',   url: 'https://google.com' },
    { name: 'Gmail',    url: 'https://mail.google.com' },
    { name: 'Calendar', url: 'https://calendar.google.com' }
  ];
  localStorage.setItem('links', JSON.stringify(links));
}
 
const linkNameInput   = document.getElementById('link-name');
const linkUrlInput    = document.getElementById('link-url');
const btnAddLink      = document.getElementById('btn-add-link');
const linksContainer  = document.getElementById('links-container');
 
function saveLinks() {
  localStorage.setItem('links', JSON.stringify(links));
}
 
function renderLinks() {
  linksContainer.innerHTML = '';
  links.forEach((link, i) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'inline-flex';
 
    const a       = document.createElement('a');
    a.href        = link.url;
    a.target      = '_blank';
    a.rel         = 'noopener noreferrer';
    a.textContent = link.name;
    a.className   = 'link-chip';
 
    const del       = document.createElement('button');
    del.textContent = '×';
    del.className   = 'link-chip-del';
    del.title       = 'Remove link';
    del.addEventListener('click', e => {
      e.preventDefault();
      links.splice(i, 1);
      saveLinks();
      renderLinks();
    });
 
    a.appendChild(del);
    linksContainer.appendChild(a);
  });
}
 
function addLink() {
  const name = linkNameInput.value.trim();
  const url  = linkUrlInput.value.trim();
  if (!name || !url) return;
 
  // Ensure URL has protocol
  const fullUrl = url.startsWith('http') ? url : 'https://' + url;
 
  links.push({ name, url: fullUrl });
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  saveLinks();
  renderLinks();
}
 
btnAddLink.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addLink();
});
 
renderLinks();
 
 
// ===== UTILITIES =====
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
