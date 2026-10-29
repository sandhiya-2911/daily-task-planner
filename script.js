const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDate");
const priorityInput = document.getElementById("priority");
const filterSelect = document.getElementById("filterSelect");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

let tasks = [];
try {
  tasks = JSON.parse(localStorage.getItem("dailyTaskPlannerTasks")) || [];
} catch {
  tasks = [];
}

const today = new Date();
document.getElementById("dayName").textContent =
  today.toLocaleDateString(undefined, { weekday: "long" });
document.getElementById("todayDate").textContent =
  today.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
dueDateInput.value = today.toISOString().slice(0, 10);

function saveTasks() {
  localStorage.setItem("dailyTaskPlannerTasks", JSON.stringify(tasks));
}

function updateSummary() {
  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("pendingCount").textContent = tasks.filter(task => !task.completed).length;
  document.getElementById("completedCount").textContent = tasks.filter(task => task.completed).length;
}

function formatDueDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(dateString + "T00:00:00");
  return "Due " + date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function renderTasks() {
  taskList.replaceChildren();
  const filter = filterSelect.value;
  const visibleTasks = tasks.filter(task => {
    if (filter === "Pending") return !task.completed;
    if (filter === "Completed") return task.completed;
    return true;
  });

  emptyMessage.hidden = visibleTasks.length > 0;
  visibleTasks.forEach(task => {
    const item = document.createElement("article");
    item.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task completed");
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const details = document.createElement("div");
    const title = document.createElement("p");
    title.className = "task-title" + (task.completed ? " done" : "");
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";
    const due = document.createElement("span");
    due.textContent = formatDueDate(task.dueDate);
    const priority = document.createElement("span");
    priority.className = "priority " + task.priority;
    priority.textContent = task.priority + " priority";
    meta.append(due, priority);
    details.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "icon-button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      const revised = prompt("Edit task name:", task.title);
      if (revised === null) return;
      if (revised.trim()) {
        task.title = revised.trim();
        saveTasks();
        renderTasks();
      } else {
        alert("Task name cannot be empty.");
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "icon-button delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      if (confirm("Delete this task?")) {
        tasks = tasks.filter(item => item.id !== task.id);
        saveTasks();
        renderTasks();
      }
    });
    actions.append(editButton, deleteButton);
    item.append(checkbox, details, actions);
    taskList.append(item);
  });
  updateSummary();
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;
  tasks.unshift({
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    title,
    dueDate: dueDateInput.value,
    priority: priorityInput.value,
    completed: false
  });
  saveTasks();
  taskForm.reset();
  dueDateInput.value = today.toISOString().slice(0, 10);
  priorityInput.value = "Medium";
  renderTasks();
  taskInput.focus();
});

filterSelect.addEventListener("change", renderTasks);
renderTasks();
