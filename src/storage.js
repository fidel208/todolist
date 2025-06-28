export function saveToLocalStorage(manager) {
    const state = {
        projects: manager.projects.map(project => ({
            name: project.name,
            todos: project.todos.map(todo => ({
                title: todo.title,
                description: todo.description,
                duedate: todo.duedate,
                priority: todo.priority,
                completed: todo.completed,
                note: todo.note
            }))
        })),
        currentProject: manager.currentProject ? manager.currentProject.name : null
    };
    
    localStorage.setItem('todoAppState', JSON.stringify(state));
}

export function loadFromLocalStorage(manager) {
    const savedState = localStorage.getItem('todoAppState');
    if (!savedState) return false;
    
    try {
        const state = JSON.parse(savedState);

        manager.projects = [];

        state.projects.forEach(projectData => {
            const project = new Project(projectData.name);
            projectData.todos.forEach(todoData => {
                const todo = new Todo(
                    todoData.title,
                    todoData.description,
                    todoData.duedate,
                    todoData.priority
                );
                todo.completed = todoData.completed;
                todo.note = todoData.note;
                project.addTodo(todo);
            });
            manager.projects.push(project);
        });

        if (state.currentProject) {
            manager.setCurrentProject(state.currentProject);
        } else if (manager.projects.length > 0) {
            manager.setCurrentProject(manager.projects[0].name);
        }
        
        return true;
    } catch (e) {
        console.error('Failed to load saved state:', e);
        return false;
    }
}