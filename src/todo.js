export class Todo {
    constructor(title, description, duedate, priority) {
        this.title = title;
        this.description = description;
        this.duedate = duedate;
        this.priority = priority;
        this.completed = false;
        this.note = "";
    }

    toggleComplete() {
        this.completed = !this.completed;
    }

    addNote(note) {
        this.note = note;
    }
}

export class Project {
    constructor(name) {
        this.name = name;
        this.todos = [];
    }

    addTodo(todo) {
        this.todos.push(todo);
    }

    removeTodo(index) {
        this.todos.splice(index, 1);
    }
}

export class ProjectManager {
    constructor() {
        this.projects = [];
        this.currentProject = null;
    }
    
    createProject(name) {
        if (!this.getProject(name)) {
            this.projects.push(new Project(name));
            return true;
        }
        return false;
    }

    getProject(name) {
        return this.projects.find(project => project.name === name);
    }

    setCurrentProject(name) {
        const project = this.getProject(name);
        if (project) {
            this.currentProject = project;
        }
    }

    addTodoToCurrentProject(todo) {
        if (this.currentProject) {
            this.currentProject.addTodo(todo);
            return true;
        }
        return false;
    }
}