import { Todo } from './todo.js';

export function renderProjects(manager, container) {
    container.innerHTML = '';
    manager.projects.forEach(project => {
        const btn = document.createElement('button');
        btn.textContent = project.name;

        if (manager.currentProject && manager.currentProject.name === project.name) {
            btn.classList.add('active');
        }

        btn.onclick = () => {
            manager.setCurrentProject(project.name);
            renderProjects(manager, container);
            renderTodos(manager, document.getElementById('todo-list'));
        };
        container.appendChild(btn);
    });
}
export function renderTodos(manager, container) {
    const project = manager.currentProject;
    container.innerHTML = '';
    if (!project) return;

    if (project.todos.length === 0) {
        container.innerHTML = '<p>No todos in this project.</p>';
        return;
    }

    project.todos.forEach((todo, index) => {
        const todoDiv = createTodoElement(manager, todo, index);
        container.appendChild(todoDiv);
    });
}

function createTodoElement(manager, todo, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'todo-item';
    wrapper.style.borderLeft = getPriorityColor(todo.priority);

    const title = document.createElement('p');
    title.innerHTML = `<strong>${todo.title}</strong> (Due: ${todo.duedate})`;

    const completeBtn = document.createElement('button');
    completeBtn.textContent = todo.completed ? 'Undo' : 'Complete';
    completeBtn.onclick = () => {
        todo.toggleComplete();
        renderTodos(manager, document.getElementById('todo-list'));
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
        manager.currentProject.removeTodo(index);
        renderTodos(manager, document.getElementById('todo-list'));
    };

    const expandBtn = document.createElement('button');
    expandBtn.textContent = 'Details';

    const details = document.createElement('div');
    details.style.display = 'none';
    details.innerHTML = `
        <p><strong>Description:</strong> ${todo.description}</p>
        <p><strong>Note:</strong> ${todo.note || 'None'}</p>
    `;

    const noteInput = document.createElement('input');
    noteInput.placeholder = 'Add/edit note';
    noteInput.value = todo.note;
    noteInput.onchange = () => {
        todo.addNote(noteInput.value);
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
        manager.addTodoToCurrentProject(todo);

        renderTodos(manager, document.getElementById('todo-list'));
        form.reset();
    });
}

export function bindProjectForm(manager, form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        const nameInput = form.querySelector('#project-name');
        const name = nameInput.value.trim();

        if (name) {
            manager.createProject(name);
            manager.setCurrentProject(name);
            renderProjects(manager, document.getElementById('projects'));
            nameInput.value = '';
        }
    });
}