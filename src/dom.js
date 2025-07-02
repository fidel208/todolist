import { Todo } from './todo.js';
import { format, parseISO, isBefore, differenceInDays, isValid } from 'date-fns';
import { saveToLocalStorage } from './storage.js';

export function renderProjects(manager, container) {
    container.innerHTML = '';
    manager.projects.forEach(project => {
        const btn = document.createElement('button');
        btn.textContent = project.name;
        btn.classList.add('project-btn');

        if (manager.currentProject && manager.currentProject.name === project.name) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
            manager.setCurrentProject(project.name);
            renderProjects(manager, container);
            renderTodos(manager, document.getElementById('todo-list'));
            saveToLocalStorage(manager);
        });
        container.appendChild(btn);
    });
}

export function renderTodos(manager, container) {
    container.innerHTML = '';
    
    if (!manager.currentProject) {
        container.innerHTML = '<p class="info-msg">Select a project to view todos</p>';
        return;
    }

    if (manager.currentProject.todos.length === 0) {
        container.innerHTML = '<p class="info-msg">No todos in this project.</p>';
        return;
    }

    manager.currentProject.todos.forEach((todo, index) => {
        const todoElement = createTodoElement(manager, todo, index);
        container.appendChild(todoElement);
    });
}

function createTodoElement(manager, todo, index) {
    const wrapper = document.createElement('div');
    wrapper.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    wrapper.style.borderLeft = getPriorityColor(todo.priority);

    let dateInfo = '';
    if (todo.duedate) {
        try {
            const dueDateObj = parseISO(todo.duedate);
            if (!isValid(dueDateObj)) throw new Error('Invalid date format');
            
            const formattedDate = format(dueDateObj, 'MMM dd, yyyy');
            const daysLeft = differenceInDays(dueDateObj, new Date());
            
            let dueMsg = '';
            if (daysLeft > 0) dueMsg = `${daysLeft} day(s) left`;
            else if (daysLeft < 0) dueMsg = `Overdue by ${Math.abs(daysLeft)} day(s)`;
            else dueMsg = 'Due today';

            dateInfo = `Due: ${formattedDate} - ${dueMsg}`;

            if (isBefore(dueDateObj, new Date()) && !todo.completed) {
                wrapper.classList.add('overdue');
            }
        } catch (error) {
            dateInfo = 'Invalid due date';
        }
    } else {
        dateInfo = 'No due date';
    }

    const title = document.createElement('p');
    title.className = 'todo-title';
    title.innerHTML = `<strong>${todo.title}</strong><br><span class="date-info">${dateInfo}</span>`;

    const completeBtn = document.createElement('button');
    completeBtn.className = 'action-btn complete-btn';
    completeBtn.textContent = todo.completed ? 'Undo' : 'Complete';
    completeBtn.addEventListener('click', () => {
        todo.toggleComplete();
        renderTodos(manager, document.getElementById('todo-list'));
        saveToLocalStorage(manager);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
        manager.currentProject.removeTodo(index);
        renderTodos(manager, document.getElementById('todo-list'));
        saveToLocalStorage(manager);
    });

    const expandBtn = document.createElement('button');
    expandBtn.className = 'action-btn details-btn';
    expandBtn.textContent = 'Details';

    const details = document.createElement('div');
    details.className = 'todo-details';
    details.style.display = 'none';
    details.innerHTML = `<p><strong>Description:</strong> ${todo.description || 'None'}</p>`;

    const noteContainer = document.createElement('div');
    noteContainer.className = 'note-container';
    noteContainer.innerHTML = `<label><strong>Notes:</strong></label>`;
    
    const noteInput = document.createElement('textarea');
    noteInput.className = 'note-input';
    noteInput.value = todo.note || '';
    noteInput.placeholder = 'Add your notes here...';
    noteInput.addEventListener('change', () => {
        todo.addNote(noteInput.value);
        saveToLocalStorage(manager);
    });
    
    noteContainer.appendChild(noteInput);
    details.appendChild(noteContainer);

    expandBtn.addEventListener('click', () => {
        const isHidden = details.style.display === 'none';
        details.style.display = isHidden ? 'block' : 'none';
        expandBtn.textContent = isHidden ? 'Hide' : 'Details';
    });

    const btnContainer = document.createElement('div');
    btnContainer.className = 'btn-container';
    btnContainer.append(completeBtn, expandBtn, deleteBtn);

    wrapper.append(title, btnContainer, details);
    return wrapper;
}

function getPriorityColor(priority) {
    const colors = {
        high: '#e53935',
        medium: '#fb8c00',
        low: '#43a047',
        default: '#757575'
    };
    return `4px solid ${colors[priority] || colors.default}`;
}

export function bindForm(manager, form) {
    form.addEventListener('submit', e => {
        e.preventDefault();

        const title = form.title.value.trim();
        const description = form.description.value.trim();
        const dueDate = form.dueDate.value;
        const priority = form.priority.value;

        if (!title) {
            alert('Title is required!');
            return;
        }

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

export function bindProjectForm(manager, form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        const nameInput = form.querySelector('#project-name');
        const name = nameInput.value.trim();

        if (!name) {
            alert('Project name is required!');
            return;
        }

        if (manager.createProject(name)) {
            manager.setCurrentProject(name);
            renderProjects(manager, document.getElementById('projects'));
            renderTodos(manager, document.getElementById('todo-list'));
            nameInput.value = '';
            saveToLocalStorage(manager);
        } else {
            alert('Project name already exists!');
        }
    });
}