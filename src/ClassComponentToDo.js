// These are the typical imports you'll need for a React component, among others
/* eslint no-unused-vars: [0], no-console: [0] */ // this is necessary for React
import React, {
  Component
} from 'react';
// import Rtable from './ToDoObjectComponent';
// import tryParse from 'json-try-parse';
import JSON5 from 'json5';
import './index.css';
import ToDoList from './ToDoList';
import StateList from './StatesList';

//import  {data} from './ReactTable'
// Pretty typical Class declaration, except React components always extend the base React Component class
class ClassComponentToDo extends Component {
  // Just like with all other class declarations, we need a constructor and a call to super so that this
  // component can inherit some useful methods from its parent `Component` class
  constructor() {
    super();
    let done = false;
    const minToDos = 0;
    let itemIndex = minToDos;
    const states = [];
    //window.localStorage.clear();
    while (!done) {
      try {
        // console.log('trying itemIndex:', itemIndex);
        const ls = localStorage.getItem(itemIndex.toString());
        // console.log('ls:', ls);
        if (ls === null) {
          done = true;
          // console.log('null itemIndex:', itemIndex);
          continue;
        }
        // console.log('to parse ls:', ls);
        states.push((ls === '') ? {toDos: [], lastChangeToDo: null} : JSON5.parse(ls));
        itemIndex++;
      } catch (e) {
        done = true;
        //console.log('catch itemIndex:', itemIndex);
      }
    }
    if (states.length) {
      //console.log('states[states.length - 1]', states[states.length - 1]);
      let stateIndex = localStorage.getItem('stateIndex');
      if (stateIndex === null) {
        stateIndex = -1;
      }
      const index = ((stateIndex == -1) ? states.length - 1 : stateIndex);
      // console.log(`stateIndex:${stateIndex} index:${index} state.length:${states.length}  states[index]:${states[index]}`);
      let toDos = states[index].toDos.slice(0);
      this.state = {
        toDos,
        lastChangeToDo: states[index].lastChangeToDo
      };
    } else {
      let toDos = [];
      /*     
      localStorage.setItem('0', JSON5.stringify(toDos));
      states.push(toDos.slice(0));      
      toDos.push(
        {
          text: 'C#',
          completed: true
        }
      );
      localStorage.setItem('1', JSON5.stringify(toDos));
      states.push(toDos.slice(0));
      toDos.push({
        text: 'Asp.Net',
        completed: false
      });
      localStorage.setItem('2', JSON5.stringify(toDos));
      states.push(toDos.slice(0));        
      toDos.push({
        text: 'React',
        completed: false
      });
      localStorage.setItem('3', JSON5.stringify(toDos));
      states.push(toDos.slice(0));  
      */
      this.state = {
        toDos,
        lastChangeToDo: null
      };
    }
    this.state = {
      toDos: this.state.toDos,
      newToDo: '',
      errors: [],
      states,
      lastChangeToDo: this.state.lastChangeToDo
    };
    this.stepNumber = itemIndex;
    // console.log('states.length', this.state.states.length);
  }
  copyToDos = (toDos) => {
    return toDos.map(toDo => {
      return {
        text: toDo.text,
        completed: toDo.completed
      };
    });
  }
  updateLocalStorgePlusStates = (deletedToDo = null) => {
    localStorage.setItem(
      this.stepNumber,
      JSON5.stringify({toDos: this.state.toDos, lastChangeToDo:this.state.lastChangeToDo,
        deletedToDo: deletedToDo })
    );
    const states = this.state.states;
    states.push({toDos: this.copyToDos(this.state.toDos), lastChangeToDo: this.state.lastChangeToDo,
      deletedToDo: (deletedToDo !== null) ? {text: deletedToDo.text, completed: deletedToDo.completed} : null});
    this.setState({
      states
    }, () => this.stepNumber++);
    localStorage.setItem('stateIndex', -1);
  }
  // A method on this class that adds a new toDo to our toDos array
  // Note how `this.setState` is used here to update the state object
  // You should NEVER by updating the state object directly; always use `this.setState` for that purpose
  addToDo = event => {
    // this.printName();
    // This `preventDefault` call here is just to prevent the default behavior of an HTML form upon submission
    if (event != null) {
      event.preventDefault();
    }
    // We create a copy of our dogNames array in state, then push a new dog name onto our copy
    const toDos = this.state.toDos;
    let o = null;
    let errors = [];
    try {
      o = JSON5.parse(this.state.newToDo);
      if (o['text'] === undefined) {
        errors.push(
          `>>>${this.state.newToDo}<<<< doesn't have "text" property`
        );
      }
      if (o['completed'] === undefined) {
        errors.push(
          `>>>${this.state.newToDo}<<<< doesn't have "completed" property`
        );
      }
    } catch (e) {
      errors.push(`>>>${this.state.newToDo}<<<< is not an object`);
    }
    if (errors.length) {
      this.setState({
        errors
      });
      return;
    }
    toDos.push(o);
    // Now we update `this.state.toDos` with the newer copy of our toDos array
    // We also clear the value of the newToO field so that it is ready to accept new input after a submission has been made
    this.setState({
      newToDo: '',
      toDos,
      errors,
      lastChangeToDo: null
    }, () => {
      if (!this.state.states.length) {
        localStorage.setItem(
          '0',
          ''
        );
        this.stepNumber = 1;
        this.setState({
          states: [
            {toDos: [], lastChangeToDo: null}
          ]
        }, () => {
          this.updateLocalStorgePlusStates();
        });
        // console.log('item[\'0\']:', localStorage.getItem('0'));
      } else {
        this.updateLocalStorgePlusStates();
      }
    });

  };
  toggleCompleted = (i) => {
    const toDos = this.state.toDos;
    toDos[i].completed = !toDos[i].completed;
    this.setState({
      toDos,
      lastChangeToDo: {text: toDos[i].text, completed: toDos[i].completed}
    }, () => {
      this.updateLocalStorgePlusStates();
    });
  };

  handleNewToDoValueInput = event => {
    this.setState({
      newToDo: event.target.value
    });
  };
  jumpTo = i => {
    let sToDos = this.state.states[i].toDos;
    if (sToDos.length > 0) {
      const toDos = this.copyToDos(sToDos);
      //console.log(`i:${i} toDos:${toDos.}`);
      let lastChangeToDo = (this.state.states[i].lastChangeToDo === null) ?
        {text: toDos[toDos.length - 1].text, completed: (toDos[toDos.length - 1].completed ? true : false)}  : 
        this.state.states[i].lastChangeToDo;
      if (this.state.states[i].deletedToDo != null) {
        lastChangeToDo = this.state.states[i].deletedToDo; 
      }
      this.setState({
        toDos,
        lastChangeToDo,
        newToDo: (lastChangeToDo !== null) ? JSON5.stringify(lastChangeToDo) : ''
      });        
    }
    else {
      this.setState({
        toDos: sToDos,
        lastChangeToDo: null,
        newToDo: ''
      });
    }

    localStorage.setItem('stateIndex', i);
  };
  deleteStorage = () => {
    localStorage.clear();
    window.location.reload();
  }
  deleteToDo = (i) => {
    const toDos = this.state.toDos;
    const del = toDos.splice(i,1)[0];
    this.setState({
      toDos : toDos
    },() => {
      localStorage.setItem('stateIndex', -1);
      let deletedToDo = {};
      deletedToDo.text = del.text;
      deletedToDo.completed = del.completed;  
      this.updateLocalStorgePlusStates(deletedToDo);
    });
  }
  // Every React component needs to call the `render` method, which is inherited from the base React Component class
  render() {
    // Every React component needs to call the `render` method, which is inherited from the base React Component class

    const toDos = this.copyToDos(this.state.toDos);     
    return (
      <div>
        {/* The render method can only return a single HTML element, meaning whatever we want to render
         must be wrapped inside a single base parent HTML element */}
        {/* We can write and execute plain-old JavaScript inside of JSX */}
        <ToDoList toDos={toDos} toggleCompleted={this.toggleCompleted} deleteToDo={this.deleteToDo} />
        {/* A form to add more toDos to our list of toDos */}
        {/* Upon submission, our form invokes our `addToDo` method */}
        <form onSubmit={this.addToDo}>
          {/* Each time our input detects a change, it invokes our `handleNewDogNameInput`
         method */}
          {/* The newToDo field on our state object will get updated as input is typed in,
          so we set the valu of this form to be `this.state.newDog` */}
          <input
            type="text"
            onChange={this.handleNewToDoValueInput}
            placeholder="Add a new to do! example: {text: 'JavaScript',completed: false}"
            value={this.state.newToDo}
            size="60"
          />
          {this.state.errors.map((error, i) => (
            <div key={i} className="error">
              {error}
            </div>
          ))}
        </form>
        <StateList states={this.state.states} jumpTo={this.jumpTo} />
        <button onClick={this.deleteStorage}>Reset and Delete localStorage</button>
      </div>
    );
  }
}
// Lastly, we need to export our component so that it can be imported in other parts of our React app
export default ClassComponentToDo;

// react-table Cannot read property 'name' of undefined