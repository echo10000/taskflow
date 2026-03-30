// =========================================
// TaskFlow — app.js
// Handles task CRUD, filtering, persistence
// =========================================

// --- State ---
let tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [];
let currentFilter = 'all';

// --- DOM References ---
const taskInput     = document.getElementById('taskInput');
const categorySelect= document.getElementById('categorySelect');
const addBtn        = document.getElementById('addBtn');
const taskList      = document.getElementById('taskList');
const emptyState    = document.getElementById('emptyState');
const totalCount    = document.getElementById('totalCount');
const doneCount     = document.getElementById('doneCount');
const filterBtns    = document.querySelectorAll('.filter-btn[data-filter]');
const clearDoneBtn  = document.getElementById('clearDoneBtn');

// --- Save to localStorage ---
function saveTasks() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

// --- Generate unique ID ---
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// --- Add Task ---
function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    taskInput.classList.add('shake');
    setTimeout(() => taskInput.classList.remove('shake'), 300);
    return;
  }

  const task = {
    id:        generateId(),
    text:      text,
    category:  categorySelect.value,
    completed: false,
    createdAt: Date.now()
  };

  tasks.unshift(task); // add to top
  saveTasks();
  taskInput.value = '';
  taskInput.focus();
  render();
}

// --- Toggle Completion ---
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

// --- Delete Task ---
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

// --- Clear Completed Tasks ---
function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
}

// --- Filter Logic ---
function getFilteredTasks() {
  if (currentFilter === 'active')    return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

// --- Build a single task element ---
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' completed' : '');
  li.dataset.id = task.id;

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-check';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleTask(task.id));

  // Label
  const label = document.createElement('span');
  label.className = 'task-label';
  label.textContent = task.text;
  label.addEventListener('click', () => toggleTask(task.id));

  // Category tag
  const tag = document.createElement('span');
  tag.className = `task-tag tag-${task.category}`;
  tag.textContent = task.category;

  // Delete button
  const del = document.createElement('button');
  del.className = 'task-delete';
  del.innerHTML = '&times;';
  del.title = 'Delete task';
  del.addEventListener('click', () => deleteTask(task.id));

  li.appendChild(checkbox);
  li.appendChild(label);
  li.appendChild(tag);
  li.appendChild(del);

  return li;
}

// --- Render ---
function render() {
  const filtered = getFilteredTasks();

  // Clear list
  taskList.innerHTML = '';

  // Show/hide empty state
  if (filtered.length === 0) {
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');
    filtered.forEach(task => {
      taskList.appendChild(createTaskElement(task));
    });
  }

  // Update stats (always based on all tasks)
  totalCount.textContent = tasks.length;
  doneCount.textContent  = tasks.filter(t => t.completed).length;
}

// --- Event Listeners ---
addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

clearDoneBtn.addEventListener('click', clearCompleted);

// --- Initial Render ---
render();
