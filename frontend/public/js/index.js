// ---------------------------------------------------------------
// List classes / your own written libraries here
// ---------------------------------------------------------------
class ToDoApp {
  constructor() {
    this.addListButton = document.getElementById('create-list');
    this.addListButton.addEventListener('click', () => this.createTodoList());

    this.listNum = 0;

    for(let prop in localStorage) {
      this.listNum++;
      this.buildToDoList(prop);
    }
  }

  createTodoList() {
    this.listNum++;
    localStorage.setItem(`list-${this.listNum}`, JSON.stringify([{title: "Untitled"}]));
    this.buildToDoList(`list-${this.listNum}`);
  }

  buildToDoList(listId) {
    const container = document.querySelector('.container');
    let storedData = JSON.parse(localStorage[listId]);

    const list = new ToDoElement({
      type: 'section',
      attributes: { id: listId },
      parent: container
    });
    const header = new ToDoElement ({
      type: 'input',
      classes: ['list-header'],
      val: storedData[0].title ? storedData[0].title : "Untitled",
      attributes: {disabled: true},
      eventListener: [{ type: 'keydown', action: (e) => { this.editHeader(header.element) } }],
      parent: list.element
    });
    const editBtn = new ToDoElement ({
      type: 'button',
      classes: ["edit-btn", "fa", "fa-pencil"],
      content: " Edit",
      eventListener: [{ type: 'click', action: () => this.toggleEdit(listId)}],
      parent: list.element
    });
    const addIcon = new ToDoElement({
      type: 'i',
      classes: ['fa','fa-plus'],
      parent: list.element
    });
    const input = new ToDoElement({
      type: 'input',
      attributes: {type: 'text', placeholder: 'Enter New Task'},
      classes: ['new-todo'],
      eventListener: [{ 
        type: 'keypress', 
        action: (e) => {
          if(e.keyCode === 13) {
            let newTask = new ToDoTask({
              listId: listId
            });
            newTask.buildToDoTask();
            storedData.push({content: input.element.value, completed: false});
            localStorage.setItem(listId, JSON.stringify(storedData));   
            input.element.value = "";
          }
        }
      }],
      parent: list.element
    });
    const deleteBtn = new ToDoElement({
      type: 'button',
      classes: ['bottom-btn', 'delete-btn'],
      content: 'Delete List',
      eventListener: [{ type: 'click', action: () => this.deleteTodoList(deleteBtn.element)}],
      parent: list.element
    });
    const completeBtn = new ToDoElement({
      type: 'button',
      classes: ['bottom-btn'],
      content: 'Show Completed',
      eventListener: [{ type: 'click', action: () => this.toggleComplete(completeBtn.element)}],
      parent: list.element
    });  
  
    if (localStorage.length > 0 && localStorage[listId]) {
      let items = JSON.parse(localStorage[listId]); 
      for (let i = 1; i < items.length; i++) {
        const newTask = new ToDoTask({
          listId: listId,
          taskContent: items[i].content,
          taskCompleted: items[i].completed
        });
        newTask.buildToDoTask();
      }
    }
  }

  deleteTodoList(element) {
    let section = element.parentNode;
    localStorage.removeItem(section.id);
    section.remove();
  }

  editHeader(element) {
    let storedList = JSON.parse(localStorage[`list-${this.listNum}`]);
    storedList.splice(0, 1, {title: element.value})
    localStorage.setItem(`list-${this.listNum}`, JSON.stringify(storedList));  
  }

  toggleEdit(listId) {
    const currentList = document.getElementById(listId);
    const editBtn = currentList.querySelector('.edit-btn');
    const iconInput = currentList.querySelector('i');
    const listHeader = currentList.querySelector('.list-header');
    const allListItems = currentList.querySelectorAll('.todo-task-wrapper .task-item');
    const taskInput = currentList.querySelector('.new-todo');

    currentList.classList.toggle('edit-mode');
    editBtn.classList.toggle('fa-pencil');
    
    if(currentList.classList[0] === 'edit-mode') {
      editBtn.innerHTML = "Done";
      iconInput.classList.remove('fa-plus');
      iconInput.classList.add('fa-lock');
      taskInput.disabled = true;
      listHeader.disabled = false;
      for (let task of allListItems) {
        task.disabled = false;
      }
    } else {
      editBtn.innerHTML = " Edit";
      iconInput.classList.add('fa-plus');
      iconInput.classList.remove('fa-lock');
      taskInput.disabled = false;
      listHeader.disabled = true;
      for (let task of allListItems) {
        task.disabled = true;
      }
    }
  }

  toggleComplete(element) {
    let allCheckBoxes = element.parentNode.querySelectorAll('input[type="checkbox"]');
    element.classList.toggle("show-complete");  

    if(element.classList.contains("show-complete")) {
      for(let i = 0; i < allCheckBoxes.length; i++) {
        if(!allCheckBoxes[i].checked)
          allCheckBoxes[i].parentNode.classList.add('hide');
      }
      element.innerHTML = "Show All";
    } else {
      for(let i = 0; i < allCheckBoxes.length; i++) {
        allCheckBoxes[i].parentNode.classList.remove('hide');
      }
      element.innerHTML = "Show Completed"; 
    }
  }
}

class ToDoTask {
  constructor(obj) {
    this.taskListId = obj.listId;
    this.taskContent = obj.taskContent;
    this.taskCompleted = obj.taskCompleted;
    this.taskList =  document.getElementById(this.taskListId);
    this.allDeleteBtns = this.taskList.querySelectorAll('.delete-item-btn');
    this.taskText = this.taskContent || this.taskList.querySelector('.new-todo').value;
    this.index;
  }

  buildToDoTask() {
    const taskWrapper = new ToDoElement({
      type: 'div',
      classes: ['todo-task-wrapper'],
      parent: this.taskList
    });
    const deleteTaskBtn = new ToDoElement({
      type: 'i',
      classes: ['delete-task-btn', 'fa', 'fa-minus-circle'],
      eventListener: [{ type: 'click', action: () => this.updateTaskItem(deleteTaskBtn.element)}],
      parent: taskWrapper.element
    });
    const checkbox = new ToDoElement({
      type: 'input',
      attributes: { type: 'checkbox' },
      classes: ['task-checkbox'],
      checked: this.taskCompleted,
      eventListener: [{ 
        type: 'change', 
        action: () => {
          let listItem = checkbox.element.parentNode.querySelector('.task-item').classList.toggle('completed');
          this.updateTaskItem(checkbox.element);
        }
      }],
      parent: taskWrapper.element
    });
    const taskItem = new ToDoElement({
      type: 'input',
      attributes: { type: 'text', disabled: true },
      val: this.taskText,
      classes: this.taskCompleted ? ['task-item', "completed"] : ['task-item'],
      eventListener: [{ 
        type: 'keydown', 
        action: () => { this.updateTaskItem(taskItem.element)}
      }],
      parent: taskWrapper.element
    }); 
  }

  updateTaskItem(element) {
    const storedTask = JSON.parse(localStorage[this.taskListId]);
    const elementClass = element.classList[0];
    const allElements = this.taskList.querySelectorAll(`.${elementClass}`);

    for(let i = 0; i < storedTask.length; i++) {
      if(allElements[i] === element) 
        this.index = i+1;  
    }

    if(elementClass === "task-item" || elementClass === "task-checkbox") {
      if(elementClass === "task-checkbox")
        element = element.parentNode.querySelector('.task-item');

      element.classList.contains("completed") ? storedTask.splice(this.index, 1, {content: element.value, completed: true}) :  storedTask.splice(this.index, 1, {content: element.value, completed: false});
    } else if (elementClass === "delete-task-btn") {
      storedTask.splice(this.index, 1);
      element.parentNode.remove();
    }

    localStorage.setItem(this.taskListId, JSON.stringify(storedTask));  
  }
}
  
class ToDoElement {
  constructor(obj) {
    const element = document.createElement(obj.type);

    obj.classes ? element.classList.add(...obj.classes) : "";
    obj.checked ? element.checked = true : element.checked = false;
    obj.content ? element.innerHTML = obj.content : "";
    obj.val ? element.value = obj.val : "";
    obj.parent ? obj.parent.appendChild(element) : "";
    
    if(obj.attributes) 
      for(let [key, value] of Object.entries(obj.attributes)) {
        element[key] = value; 
      }

    if(obj.eventListener) {
      for(let i = 0; i < obj.eventListener.length; i++) {
        element.addEventListener(obj.eventListener[i].type, obj.eventListener[i].action);
      }

    this.element = element;
  }
}
// ---------------------------------------------------------------
// Instantiate and run main app here
// ---------------------------------------------------------------
const todo = new ToDoApp();