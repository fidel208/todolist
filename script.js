class todo {
    constructor(title, description, duedate, priority) {
        this.title = title;
        this.description = description;
        this.duedate = duedate;
        this.priority = priority;
        this.completed = true;
        this.note = "";
    }

    toggleComplete() {
        this.completed = !this.completed;
    }

    addNote(note) {
        this.note = note;
    }
}

const task = new todo("Travel", "Going to campus, from kwale to kisii", "28/08/2025", "high");
task.toggleComplete();
task.addNote("Don't miss and dont forget any of your school items");
console.log(task); 