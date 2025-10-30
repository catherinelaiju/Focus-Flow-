// script.js — improved To-Do with export/import, theme persistence, notes saving
document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const addTaskButton = document.getElementById("add-task");
  const taskList = document.getElementById("task-list");
  const themeToggle = document.getElementById("theme-toggle");
  const exportBtn = document.getElementById("export-btn");
  const importBtn = document.getElementById("import-btn");
  const importFile = document.getElementById("import-file");
  const clearTasksBtn = document.getElementById("clear-tasks");
  const notesArea = document.getElementById("notes-area");

  const TASK_KEY = "ff_tasks_v1";
  const NOTES_KEY = "ff_notes_v1";
  const THEME_KEY = "ff_theme_v1";

  // load persisted theme
  if(localStorage.getItem(THEME_KEY) === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  });

  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem(TASK_KEY)) || [];
    taskList.innerHTML = "";
    tasks.forEach(t => addTaskToDOM(t.text, t.completed));
  }

  function saveTasks(){
    const arr = [];
    document.querySelectorAll("#task-list li").forEach(li => {
      arr.push({
        text: li.querySelector(".task-text").innerText.trim(),
        completed: li.classList.contains("completed")
      });
    });
    localStorage.setItem(TASK_KEY, JSON.stringify(arr));
  }

  function addTaskToDOM(taskText, completed = false){
    const li = document.createElement("li");

    const span = document.createElement("div");
    span.className = "task-text";
    span.innerText = taskText;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const delBtn = document.createElement("button");
    delBtn.className = "icon";
    delBtn.title = "Delete";
    delBtn.ariaLabel = "Delete task";
    delBtn.innerText = "❌";

    const editBtn = document.createElement("button");
    editBtn.className = "icon";
    editBtn.title = "Edit";
    editBtn.ariaLabel = "Edit task";
    editBtn.innerText = "✏️";

    // toggle complete when clicking the text
    span.addEventListener("click", () => {
      li.classList.toggle("completed");
      saveTasks();
    });

    // delete (stop propagation so it doesn't toggle complete)
    delBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      li.remove();
      saveTasks();
    });

    // edit inline
    editBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const current = span.innerText;
      const input = document.createElement("input");
      input.type = "text";
      input.value = current;
      input.style.flex = "1";
      li.replaceChild(input, span);
      input.focus();

      function finishEdit() {
        const newVal = input.value.trim();
        if(newVal) {
          span.innerText = newVal;
          li.replaceChild(span, input);
          saveTasks();
        } else {
          // empty → delete
          li.remove();
          saveTasks();
        }
      }
      input.addEventListener("blur", finishEdit);
      input.addEventListener("keydown", (e) => {
        if(e.key === "Enter") input.blur();
        if(e.key === "Escape") {
          li.replaceChild(span, input);
        }
      });
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(span);
    li.appendChild(actions);

    if(completed) li.classList.add("completed");
    taskList.appendChild(li);
    saveTasks();
  }

  addTaskButton.addEventListener("click", () => {
    if(taskInput.value.trim()){
      addTaskToDOM(taskInput.value.trim());
      taskInput.value = "";
      taskInput.focus();
    }
  });

  // Enter key to add
  taskInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter") addTaskButton.click();
  });

  // notes persistence
  notesArea.value = localStorage.getItem(NOTES_KEY) || "";
  notesArea.addEventListener("input", () => {
    localStorage.setItem(NOTES_KEY, notesArea.value);
  });

  // export/import
  exportBtn.addEventListener("click", () => {
    const data = {
      tasks: JSON.parse(localStorage.getItem(TASK_KEY) || "[]"),
      notes: localStorage.getItem(NOTES_KEY) || "",
      theme: localStorage.getItem(THEME_KEY) || "light"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "focusflow_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if(data.tasks) localStorage.setItem(TASK_KEY, JSON.stringify(data.tasks));
        if(data.notes !== undefined) localStorage.setItem(NOTES_KEY, data.notes);
        if(data.theme) localStorage.setItem(THEME_KEY, data.theme);
        location.reload();
      } catch (err) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  });

  clearTasksBtn.addEventListener("click", () => {
    if(confirm("Clear ALL tasks?")) {
      localStorage.removeItem(TASK_KEY);
      loadTasks();
    }
  });

  // initial load
  loadTasks();
});
