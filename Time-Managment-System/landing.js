// HTML Elements
const welcomeMessage = document.getElementById("welcomeMessage");
const profileIcon = document.getElementById("profileIcon");
const dropdownMenu = document.getElementById("dropdownMenu");
const signOutButton = document.getElementById("signOutButton");
const taskInput = document.getElementById("taskInput");
const taskDescriptionInput = document.getElementById("taskDescriptionInput");
const taskDueDate = document.getElementById("taskDueDate");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");
const searchBar = document.getElementById("searchBar");

// Restrict past dates in the task due date input
taskDueDate.setAttribute("min", new Date().toISOString().split("T")[0]);

// Retrieve logged-in user
const loggedinUser = JSON.parse(localStorage.getItem("loggedinUser"));

if (loggedinUser) {
    welcomeMessage.textContent = `Welcome, ${loggedinUser.name}!`;
} else {
    window.location.href = "index.html";
}

// Generate a unique key for the user's tasks
const getUserTaskKey = () => {
    let userIndex = localStorage.getItem("userIndex");
    if (!userIndex) {
        userIndex = JSON.stringify({});
        localStorage.setItem("userIndex", userIndex);
    }
    userIndex = JSON.parse(userIndex);

    if (!userIndex[loggedinUser.name]) {
        const nextIndex = Object.keys(userIndex).length + 1;
        userIndex[loggedinUser.name] = nextIndex.toString().padStart(2, '0');
        localStorage.setItem("userIndex", JSON.stringify(userIndex));
    }

    return `${userIndex[loggedinUser.name]}_task`;
};

const userTaskKey = getUserTaskKey();
let tasks = JSON.parse(localStorage.getItem(userTaskKey)) || [];
let timers = {};
let startTimes = {};

const saveTasks = () => {
    localStorage.setItem(userTaskKey, JSON.stringify(tasks));
};

const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const updateTimerDisplay = (taskId) => {
    const timerDisplay = document.querySelector(`[data-timer-id="${taskId}"]`);
    const task = tasks.find(t => t.id === taskId);
    if (timerDisplay && task) {
        const currentTime = Date.now();
        const additionalSeconds = task.isRunning ? Math.floor((currentTime - startTimes[taskId]) / 1000) : 0;
        const totalSeconds = (task.elapsedSeconds || 0) + additionalSeconds;
        timerDisplay.textContent = `Time: ${formatTime(totalSeconds)}`;
    }
};

const startTimer = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.isRunning) return;

    task.isRunning = true;
    startTimes[taskId] = Date.now();
    localStorage.setItem(userTaskKey, JSON.stringify(tasks)); // Save tasks after timer start

    timers[taskId] = setInterval(() => {
        updateTimerDisplay(taskId);
    }, 1000);

    updateTimerDisplay(taskId);
};


const stopTimer = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.isRunning) return;

    clearInterval(timers[taskId]);
    delete timers[taskId];

    const currentTime = Date.now();
    const additionalSeconds = Math.floor((currentTime - startTimes[taskId]) / 1000);
    task.elapsedSeconds = (task.elapsedSeconds || 0) + additionalSeconds;
    task.isRunning = false;
    delete startTimes[taskId];

    localStorage.setItem(userTaskKey, JSON.stringify(tasks)); // Save tasks after timer stop
    updateTimerDisplay(taskId);
};

const renderTasks = (filteredTasks = tasks) => {
    taskList.innerHTML = "";

    const userTasks = filteredTasks;

    userTasks.sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityComparison !== 0) return priorityComparison;
        return new Date(a.dueDate || "9999-12-31") - new Date(b.dueDate || "9999-12-31");
    });

    userTasks.forEach((task) => {
        const taskItem = document.createElement("li");
        taskItem.className = "task-item";

        const taskLabel = document.createElement("span");
        taskLabel.textContent = task.taskTitle;
        taskLabel.style.textDecoration = task.done ? "line-through" : "none";
        taskLabel.style.color = task.done ? "gray" : "red";

        const description = document.createElement("div");
        description.textContent = task.description || "No description provided.";
        description.style.display = "none";
        description.style.marginTop = "5px";
        description.style.color = "#555";

        taskLabel.addEventListener("click", () => {
            description.style.display = description.style.display === "none" ? "block" : "none";
        });

        const timerDisplay = document.createElement("div");
        timerDisplay.setAttribute('data-timer-id', task.id);
        timerDisplay.textContent = `Time: ${formatTime(task.elapsedSeconds || 0)}`;
        timerDisplay.style.marginTop = "5px";
        timerDisplay.style.fontFamily = "monospace";

        const taskDetails = document.createElement("div");

        // Priority circle styles
        const priorityColors = {
            low: "green",
            medium: "yellow",
            high: "red"
        };

        // Create priority label with circle and color coding
        const priorityLabel = document.createElement("span");
        priorityLabel.textContent = task.priority === 'low' ? "P1" :
                                    task.priority === 'medium' ? "P2" : "P3";
        priorityLabel.style.color = "#fff";  // Text color
        priorityLabel.style.backgroundColor = priorityColors[task.priority] || "black";  // Circle color
        priorityLabel.style.padding = "5px 10px";  // Circle size
        priorityLabel.style.borderRadius = "50%";  // Make it circular
        priorityLabel.style.fontWeight = "bold";
        priorityLabel.style.display = "inline-block";
        priorityLabel.style.marginLeft = "10px";

        taskDetails.innerHTML = 
            `<span>Due: ${task.dueDate || "No due date"}</span> |`;
        taskDetails.appendChild(priorityLabel);
        taskDetails.style.marginTop = "5px";

        const timeTrackButton = document.createElement("button");
        if (task.isRunning) {
            timeTrackButton.textContent = "Stop Timer";
            timeTrackButton.classList.add("end-task");
        } else {
            timeTrackButton.textContent = "Start Timer";
            timeTrackButton.classList.add("start-task");
        }
        timeTrackButton.disabled = task.done;

        timeTrackButton.addEventListener("click", () => {
            if (task.isRunning) {
                stopTimer(task.id);
                timeTrackButton.textContent = "Start Timer";
                timeTrackButton.classList.remove("end-task");
                timeTrackButton.classList.add("start-task");
            } else {
                startTimer(task.id);
                timeTrackButton.textContent = "Stop Timer";
                timeTrackButton.classList.remove("start-task");
                timeTrackButton.classList.add("end-task");
            }
        });

        const editIcon = document.createElement("button");
        editIcon.classList.add("fas", "fa-pencil-alt", "edit-icon");

        editIcon.addEventListener("click", () => {
            if (task.isRunning) {
                stopTimer(task.id);
                timeTrackButton.textContent = "Start Timer";
                timeTrackButton.classList.remove("end-task");
                timeTrackButton.classList.add("start-task");
            }
            const updatedText = prompt("Edit task Title:", task.taskTitle);
            const updatedDescription = prompt("Edit description:", task.description);
            if (updatedText) task.taskTitle = updatedText;
            if (updatedDescription !== null) task.description = updatedDescription;
            saveTasks();
            renderTasks();
        });

        const doneIcon = document.createElement("i");
        doneIcon.classList.add("fas", task.done ? "fa-undo" : "fa-check", "done-icon");

        doneIcon.addEventListener("click", () => {
            if (task.isRunning) {
                stopTimer(task.id);
            }
            task.done = !task.done;
            if (task.done) {
                timeTrackButton.disabled = true;
                timeTrackButton.textContent = "Start Timer";
                timeTrackButton.classList.remove("end-task");
                timeTrackButton.classList.add("start-task");
            } else {
                timeTrackButton.disabled = false;
                task.isRunning = false;
            }
            saveTasks();
            renderTasks();
        });

        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fas", "fa-trash", "delete-icon");
    
        deleteIcon.addEventListener("click", () => {
            if (task.isRunning) {
                stopTimer(task.id);
            }
            const taskIndex = tasks.indexOf(task);
            tasks.splice(taskIndex, 1);
            saveTasks();
            renderTasks();
        });

        taskItem.appendChild(taskLabel);
        taskItem.appendChild(description);
        taskItem.appendChild(taskDetails);
        taskItem.appendChild(timerDisplay);
        taskItem.appendChild(timeTrackButton);
        taskItem.appendChild(editIcon);
        taskItem.appendChild(doneIcon);
        taskItem.appendChild(deleteIcon);
        taskList.appendChild(taskItem);

        // Restart timer if it was running
        if (task.isRunning) {
            startTimer(task.id);
        }
    });
};

// Initial rendering of tasks
renderTasks();


signOutButton.addEventListener("click", () => {
    const isConfirmed = confirm("Are you sure you want to sign out?");
    
    if (isConfirmed) {
        // Stop all running timers
        tasks.forEach(task => {
            if (task.isRunning) {
                stopTimer(task.id);
            }
        });
        localStorage.removeItem("loggedinUser");
        window.location.href = "index.html";
    }
});

// Search bar logic
searchBar.addEventListener("input", () => {
    const searchQuery = searchBar.value.toLowerCase();
    const filteredTasks = tasks.filter(task =>
        task.taskTitle.toLowerCase().includes(searchQuery) ||
        (task.description && task.description.toLowerCase().includes(searchQuery))
    );
    renderTasks(filteredTasks);
});

// Clean up all timers when the window is closed or refreshed
window.addEventListener('beforeunload', () => {
    tasks.forEach(task => {
        if (task.isRunning) {
            stopTimer(task.id);
        }
    });
});

profileIcon.addEventListener('click', () => {
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

const navigateTo = (url) => {
    window.location.href = url;
};

const addTaskButton = document.getElementById('addTaskButton');
const taskPopup = document.getElementById('taskPopup');
const closePopup = document.getElementById('closePopup');
const taskForm = document.getElementById('taskForm');

// Show the popup when "Add Task" is clicked
addTaskButton.addEventListener('click', () => {
    taskPopup.style.display = 'flex';
});

// Hide the popup when the close button is clicked
closePopup.addEventListener('click', () => {
    taskPopup.style.display = 'none';
});

// Optional: Hide the popup when clicking outside the content
window.addEventListener('click', (event) => {
    if (event.target === taskPopup) {
        taskPopup.style.display = 'none';
    }
});

// Handle form submission
taskForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent form from reloading the page

    const taskTitle = document.getElementById('taskInput').value;
    const taskDescription = document.getElementById('taskDescriptionInput').value;
    const taskDueDate = document.getElementById('taskDueDate').value;
    const taskPriority = document.getElementById('taskPriority').value;

    // Generate a unique ID for the task
    const taskId = `task-${Date.now()}`;

    // Create a new task object
    const newTask = {
        id: taskId,
        taskTitle,
        description: taskDescription,
        dueDate: taskDueDate || null, // Set to null if no due date
        priority: taskPriority || 'low', // Default to 'low' if not provided
        done: false,
        isRunning: false,
        elapsedSeconds: 0,
    };

    // Add the new task to the tasks array
    tasks.push(newTask);

    // Save the updated tasks to localStorage
    saveTasks();

    // Re-render the task list
    renderTasks();

    // Close the popup after task submission
    taskPopup.style.display = 'none';

    // Optionally, clear form fields
    taskForm.reset();
});

