import { Todo } from './todo.js';
import { format, parseISO, isBefore, differenceInDays } from 'date-fns';
import { saveToLocalStorage } from './storage.js';

// Render all project buttons
export function renderProjects(manager, container) {
    container.innerHTML = '';
    manager.projects.forEach(project => {
        const btn = document.createElement('button');
        btn.textContent = project.name;
        
        // Highlight active project
        if (manager.currentProject && manager.currentProject.name === project.name) {
            btn.classList.add('active');
        }
        
        btn.onclick = () => {
            manager.setCurrentProject(project.name);
            renderProjects(manager, container); // Re-render to update highlights
            renderTodos(manager, document.getElementById('todo-list'));
            saveToLocalStorage(manager);
        };
        container.appendChild(btn);
    });
}

// Render todos for the current project
export function renderTodos(manager, container) {
    const project = manager.currentProject;
    container.innerHTML = '';
    if (!project) {
        container.innerHTML = '<p>Select a project to view todos</p>';
        return;
    }

    if (project.todos.length === 0) {
        container.innerHTML = '<p>No todos in this project.</p>';
        return;
    }

    project.todos.forEach((todo, index) => {
        const todoDiv = createTodoElement(manager, todo, index);
        container.appendChild(todoDiv);
    });
}

// Create a DOM element for one todo item
function createTodoElement(manager, todo, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'todo-item';
    wrapper.style.borderLeft = getPriorityColor(todo.priority);

    let dateInfo = '';
    if (todo.duedate) {
        try {
            const dueDateObj = parseISO(todo.duedate);
            const formattedDate = format(dueDateObj, 'PPPP');
            const daysLeft = differenceInDays(dueDateObj, new Date());
            const dueMsg = daysLeft >= 0 
                ? `${daysLeft} day(s) left` 
                : `Overdue by ${Math.abs(daysLeft)} day(s)`;
            
            dateInfo = `(Due: ${formattedDate} - ${dueMsg})`;

            // Highlight if overdue
            if (isBefore(dueDateObj, new Date()) && !todo.completed) {
                wrapper.style.backgroundColor = '#ffe6e6';
            }
        } catch (error) {
            console.error('Invalid date format:', todo.duedate);
            dateInfo = '(Invalid due date)';
        }
    } else {
        dateInfo = '(No due date)';
    }

    // Title + Due Date
    const title = document.createElement('p');
    title.innerHTML = `<strong>${todo.title}</strong> ${dateInfo}`;

    // Complete button
    const completeBtn = document.createElement('button');
    completeBtn.textContent = todo.completed ? 'Undo' : 'Complete';
    completeBtn.onclick = () => {
        todo.toggleComplete();
        renderTodos(manager, document.getElementById('todo-list'));
        saveToLocalStorage(manager);
    };

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
        manager.currentProject.removeTodo(index);
        renderTodos(manager, document.getElementById('todo-list'));
        saveToLocalStorage(manager);
    };

    // Expand details
    const expandBtn = document.createElement('button');
    expandBtn.textContent = 'Details';

    // Details section
    const details = document.createElement('div');
    details.style.display = 'none';
    details.innerHTML = `
        <p><strong>Description:</strong> ${todo.description || 'None'}</p>
        <p><strong>Note:</strong> ${todo.note || 'None'}</p>
    `;

    const noteInput = document.createElement('input');
    noteInput.placeholder = 'Add/edit note';
    noteInput.value = todo.note || '';
    noteInput.onchange = () => {
        todo.addNote(noteInput.value);
        saveToLocalStorage(manager);
    };

    details.appendChild(noteInput);

    expandBtn.onclick = () => {
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
    };

    wrapper.append(title, completeBtn, expandBtn, deleteBtn, details);
    return wrapper;
}

function getPriorityColor(priority) {
    switch (priority) {
        case 'high': return '4px solid red';
        case 'medium': return '4px solid orange';
        case 'low': return '4px solid green';
        default: return '4px solid gray';
    }
}

export function bindForm(manager, form) {
    form.addEventListener('submit', e => {
        e.preventDefault();

        const title = form.title.value;
        const description = form.description.value;
        const dueDate = form.dueDate.value;
        const priority = form.priority.value;

        const todo = new Todo(title, description, dueDate, priority);
        if (manager.addTodoToCurrentProject(todo)) {
            renderTodos(manager, document.getElementById('todo-list'));
            form.reset();
            saveToLocalStorage(manager);
        } else {
            alert('No project selected! Create a project first.');
        }
    });
}

// Project creation form handler
export function bindProjectForm(manager, form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        const nameInput = form.querySelector('#project-name');
        const name = nameInput.value.trim();
        
        if (name) {
            if (manager.createProject(name)) {
                manager.setCurrentProject(name);
                renderProjects(manager, document.getElementById('projects'));
                renderTodos(manager, document.getElementById('todo-list'));
                nameInput.value = '';
                saveToLocalStorage(manager);
            } else {
                alert('Project with this name already exists!');
            }
        }
    });
}