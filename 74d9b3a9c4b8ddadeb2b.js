import "./style.css";
import { ProjectManager } from './todo.js';
import { renderProjects, renderTodos, bindForm, bindProjectForm } from './dom.js';

const manager = new ProjectManager();

document.addEventListener('DOMContentLoaded', () => {
    const projectContainer = document.getElementById('projects');
    const todoContainer = document.getElementById('todo-list');
    const projectForm = document.getElementById('project-form');
    const form = document.getElementById('todo-form');

    renderProjects(manager, projectContainer);
    renderTodos(manager, todoContainer);
    bindForm(manager, form);
    bindProjectForm(manager, projectForm);
});
