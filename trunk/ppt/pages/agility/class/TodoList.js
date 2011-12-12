window.TodoList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Todo,

    // Save all of the todo items under the `"todos"` namespace.
    localStorage: new Store("todos"),
    
    checked: function(){
        return this.filter(function(todo){
            return (todo.get('status') >= 3);
        });
    },
    
    done: function(){
        return this.filter(function(todo){
            return (todo.get('status') >= 2);
        });
    },

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
        if (!this.length) return 1;
        return this.last().get('order') + 1;
    },

    // Todos are sorted by their order.
    comparator: function(todo) {
        return todo.get('order');
    },
        
    enumerate: function(){
        this.each(function(todo, index){
            todo.save({
                order: index
            });
        });
    },
        
    move: function(old_index, new_index){
        // We get the moving one
        var moving_todo = this.at(old_index);
            
        // We remove the moving one            
        this.remove(moving_todo);
            
        // And put it back in the right place
        this.add(moving_todo, {
            at: new_index, 
            silent: true
        });
            
        // We reset todos numbers
        this.enumerate();
    },
    
    changeCategory: function(old_cat, new_cat){
        this.map(function(todo){
            if(todo.get("category") == old_cat){
                todo.save({
                    category: new_cat
                });
            }
        })
    }
});