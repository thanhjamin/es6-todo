// ---------------------------------------------------------------
// List classes / your own written libraries here
// ---------------------------------------------------------------

class ToDoApp {

  constructor() {
    this.addListButton = document.getElementById('create-list');
    this.addListButton.addEventListener('click', () => this.createTodoList());

    this.listNum = 0;

    for(let key in localStorage) {
      this.listNum++;
      this.buildList(key);
    }
  }

  createTodoList() {
    this.listNum++;
    this.listId = `list-${this.listNum}`;
    localStorage.setItem(this.listId, []);
    this.buildList(this.listId);
  }

  deleteTodoList(element) {
    let section = element.parentNode;
    section.remove();
    localStorage.removeItem(section.id);
  }

  buildList(listId) {
    if(listId) {
      const container = document.querySelector('.container');

      const list = new ToDoList({
        type: 'section',
        attributes: { id: listId },
        parent: container
      });
      const storedTitle = localStorage.getItem(listId);
      const header = new ToDoList ({
        type: 'input',
        classes: ['list-header'],
        val: storedTitle ? JSON.parse(storedTitle)[0] : "Untitled",
        attributes: {disabled: true},
        eventListener: [{ type: 'keydown', action: (e) => { this.editItem(listId, header.element) } }],
        parent: list.element
      });
      const editBtn = new ToDoList ({
        type: 'button',
        classes: ["edit-btn", "fa", "fa-pencil"],
        content: " Edit",
        eventListener: [{ type: 'click', action: () => this.toggleEdit(listId)}],
        parent: list.element
      });
      const addIcon = new ToDoList({
        type: 'i',
        classes: ['fa','fa-plus'],
        parent: list.element
      });
      const input = new ToDoList({
        type: 'input',
        attributes: {type: 'text', placeholder: 'What needs to be done?'},
        classes: ['new-todo'],
        eventListener: [{ 
          type: 'keypress', 
          action: (e) => {
            if(e.keyCode === 13) {
              this.addItem(listId);
              this.updateLocalStorage(listId, input.element);
              input.element.value = "";
            }
          }
        }],
        parent: list.element
      });
      const deleteBtn = new ToDoList({
        type: 'button',
        classes: ['bottom-Btn', 'delete-Btn'],
        content: 'Delete List',
        eventListener: [{ type: 'click', action: () => this.deleteTodoList(deleteBtn.element)}],
        parent: list.element
      });
      const completeBtn = new ToDoList({
        type: 'button',
        classes: ['bottom-Btn', 'show-complete'],
        content: 'Show Completed',
        eventListener: [{ type: 'click', action: () => this.toggleComplete(listId, completeBtn.element)}],
        parent: list.element
      });  
    
      if (localStorage.length > 0 && localStorage[listId]) {
        let items = JSON.parse(localStorage[listId]); 
        for (let i = 0; i < items.length; i++) {
          if(Object.prototype.toString.call(items[i]) === "[object Object]") {
            this.addItem(listId, items[i].content);  
          }
        }
      }
    }
  }

  addItem(key, value) {
    let list =  document.getElementById(key);
    let thisInput = document.querySelector(`#${key} .new-todo`);
    let listText = value || thisInput.value;

    if(listText) {
      const itemWrapper = new ToDoList({
        type: 'div',
        classes: ['todo-item-wrapper'],
        parent: list
      });
      const deleteItemBtn = new ToDoList({
        type: 'i',
        classes: ['delete-item-btn', 'fa', 'fa-minus-circle'],
        eventListener: [{ type: 'click', action: () => this.deleteListItem(deleteItemBtn.element, key)}],
        parent: itemWrapper.element
      });
      const checkbox = new ToDoList({
        type: 'input',
        attributes: { type: 'checkbox' },
        eventListener: [{ type: 'change', action: () => this.boxChecked(checkbox.element)}],
        parent: itemWrapper.element
      });
      const listItem = new ToDoList({
        type: 'input',
        attributes: { type: 'text', disabled: true },
        val: listText,
        classes: ['list-item'],
        eventListener: [{ 
          type: 'keydown', 
          action: () => { this.editItem(key, listItem.element)}
        }],
        parent: itemWrapper.element
      }); 
    }
  }

  boxChecked(element) {
    let listItem = element.parentNode;
    let checkIcon = listItem.querySelector('.list-item');
    checkIcon.classList.toggle('completed');  
  }

  updateLocalStorage(key, element) {
    let heading = document.querySelector(`#${key} .list-header`).value
    let listText = element.value;
    let listData;

    if(localStorage.getItem(key)) {
      listData = JSON.parse(localStorage.getItem(key)) 
    } else {
      listData = [heading];
    }

    listData.push({content: listText})
    localStorage.setItem(key, JSON.stringify(listData));   
  }

  toggleEdit(key) {
    let list =  document.getElementById(key);
    let editBtn = list.querySelector('.edit-btn');
    let iconInput = list.querySelector(`#${key} i`);

    let allChecks = list.querySelectorAll(`#${key} input[type="checkbox"]`);
    let allDeleteBtns = list.querySelectorAll(`#${key} .delete-item-btn`);
    let allListItem = list.querySelectorAll(`#${key} .todo-item-wrapper input[type="text"]`)
    
    
    if(list.classList[0] === 'edit-mode') {
      list.classList.remove('edit-mode');

      for(let i = 0; i < allChecks.length; i++) {
        allListItem[i].disabled = true;
      }

      editBtn.innerHTML = " Edit";
      editBtn.classList.add('fa-pencil');
      iconInput.classList.add('fa-plus');
      iconInput.classList.remove('fa-lock');
      list.querySelector('.new-todo').disabled = false;
      list.querySelector('.list-header').disabled = true;

    } else {
      list.classList.add('edit-mode')
   
      for(let i = 0; i < allChecks.length; i++) {
        allListItem[i].disabled = false;
      }

      editBtn.classList.remove('fa-pencil');
      iconInput.classList.remove('fa-plus');
      iconInput.classList.add('fa-lock');
      editBtn.innerHTML = "Done";
      list.querySelector('.new-todo').disabled = true;
      list.querySelector('.list-header').disabled = false;
    }
  }

  deleteListItem(element, key) {
    let listItem = element.parentNode;
    let listContent = listItem.querySelector('.list-item').value;
    let item = JSON.parse(localStorage[key])
    for(let i = 0; i < item.length; i++) {
      console.log(listContent);
      console.log(item[i].content);
      if(item[i].content === listContent) {
        item.splice(i,1);
        localStorage[key] = JSON.stringify(item);
      }
    }
    listItem.remove();
  }

  editItem(key, element) {
    const list =  document.getElementById(key);
    const elementClass = element.classList[0];
    const allElements = list.querySelectorAll(`.${elementClass}`);

    if(list.classList[0] === "edit-mode") {
      let index;

      for(let i = 0; i < allElements.length; i++) {
        if(allElements[i] === element) {
          index = i;
        }
      }

      let item = JSON.parse(localStorage[key])
      elementClass === "list-header" ? item.splice(0, 1, element.value) : item.splice(index, 1, {content: element.value});
      localStorage[key] = JSON.stringify(item);  
      
    }
  }

  toggleComplete(key, element) {
    let list =  document.getElementById(key);
    let allChecks = document.querySelectorAll(`#${key} input[type="checkbox"]`);
    let allItems = document.querySelectorAll(`#${key} .list-item`);

    if(element.classList.contains("show-complete")) {
      for(let i = 0; i < allChecks.length; i++) {
        if(!allChecks[i].checked) {
          allChecks[i].classList.add('hide');
          allItems[i].classList.add('hide');
        } 
      }
      element.classList.toggle("show-complete");  
      element.innerHTML = "Hide Complete";
    } else {
      for(let i = 0; i < allChecks.length; i++) {
        allChecks[i].classList.remove('hide');
        allItems[i].classList.remove('hide');
      } 
      element.classList.toggle("show-complete"); 
      element.innerHTML = "Show Complete"; 
    }
  }
}

class ToDoList {
  constructor(obj) {
    const element = document.createElement(obj.type);

    if (obj.attributes) {
      for(let [key, value] of Object.entries(obj.attributes)) {
        element[key] = value; 
      }
    }

    if (obj.classes) {
      element.classList.add(...obj.classes);
    }
    
    obj.content ? element.innerHTML = obj.content : "";

    obj.val ? element.value = obj.val : "";
    
    if (obj.eventListener) {
      for(let i = 0; i < obj.eventListener.length; i++) {
        element.addEventListener(obj.eventListener[i].type, obj.eventListener[i].action);
      }
    } 
    
    obj.parent ? obj.parent.appendChild(element) : "";

    this.element = element;
  }
}
// ---------------------------------------------------------------
// Instantiate and run main app here
// ---------------------------------------------------------------

const todo = new ToDoApp();
