Todos = new Mongo.Collection('todos');

if (Meteor.isClient) {

  Meteor.subscribe('todos');

  //Template helpers 
  Template.main.helpers({
    todos: function() {
      return Todos.find({}, {sort:{createAt: -1}}); // make the latest on top
    }
  });

  Template.main.events({
    "submit .new-todo":function(events){
      var text = event.target.text.value;
      console.log(text);

      /*Todos.insert({
        text: text,
        createAt: new Date(),
        userId: Meteor.userId(),
        username: Meteor.user().username
      });*/
    Meteor.call('addTodo', text);

    //Clear form
    event.target.text.value='';

      //Prevent Submit
      return false;
    },
    "click .toggle-checked": function(){
      // Todos.update(this._id, {$set:{checked: ! this.checked}})
      Meteor.call('setChecked', this._id, !this.checked);
    },

    "click .delete-todo": function(){
      if(confirm('Are you sure?')){
        // Todos.remove(this._id);
        Meteor.call('deleteTodo', this._id);

      }
    }

  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

//Meteor methods   
Meteor.methods({
  //have to take text field, can't be anything
  addTodo: function(text) {
    if(!Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }
    Todos.insert({
        text: text,
        createAt: new Date(),
        userId: Meteor.userId(),
        username: Meteor.user().username
      });
  },

  deleteTodo: function(todoId) {
    Todos.remove(todoId);
  },
  setChecked: function(todoId, setChecked) {
    var todo = Todos.findOne(todoId);
    if(todo.owner !== Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }
    Todos.update(todoId, {$set:{checked: setChecked}})
  }
})

if (Meteor.isServer) {
 Meteor.publish('todos', function(){ 
  
  if(!this.userId) {
    return Todos.find();
  } else {
    return Todos.find({userId: this.userId});
  }
 });
}
