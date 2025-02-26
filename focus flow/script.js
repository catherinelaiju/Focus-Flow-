document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("task-input");
    const addTaskButton = document.getElementById("add-task");
    const taskList = document.getElementById("task-list");
    const themeToggle = document.getElementById("theme-toggle");

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        taskList.innerHTML = "";
        tasks.forEach((task) => addTaskToDOM(task.text, task.completed));
    }

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll("#task-list li").forEach((li) => {
            tasks.push({ text: li.textContent.replace("🍓", "").trim(), completed: li.classList.contains("completed") });
        });
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function addTaskToDOM(taskText, completed = false) {
        const li = document.createElement("li");
        li.textContent = `🍓 ${taskText}`;
        if (completed) li.classList.add("completed");

        li.addEventListener("click", function () {
            li.classList.toggle("completed");
            saveTasks();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.addEventListener("click", function () {
            li.remove();
            saveTasks();
        });

        li.appendChild(deleteBtn);
        taskList.appendChild(li);
        saveTasks();
    }

    addTaskButton.addEventListener("click", function () {
        if (taskInput.value.trim() !== "") {
            addTaskToDOM(taskInput.value.trim());
            taskInput.value = "";
        }
    });

    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
    });

    loadTasks();
});
