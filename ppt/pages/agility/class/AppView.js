// The Application
// ---------------

// Our overall **AppView** is the top-level piece of UI.
window.AppView = Backbone.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#todoapp"),

    template: _.template($('#app-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
        "keypress .todo-input":  "createOnEnter",
        "keyup .todo-input":     "showTooltip",
        "click .todo-clear a": "clearCompleted",
        
        "keypress .new-category":  "createCategoryOnEnter",
        "keyup .new-category":     "showCategoryTooltip"
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {
        Todos.bind('add',   this.addOne, this);
        Todos.bind('reset', this.addAll, this);
        Todos.bind('all', this.render, this);
        
        
        Categories.bind('add',   this.addOneCategory, this);
        Categories.bind('reset', this.addAllCategory, this);
        Categories.bind('all', this.render, this);
        
        // Fetch categories first
        Categories.fetch();
        
        Todos.fetch();
    },

    render: function() {
        
        this.$("#content").html(this.template({
            total:      Todos.length,
            done:       Todos.done().length,
            verified:   Todos.checked().length
        }));
            
        // We update slide bars
        $( "#done-progress" ).progressbar({
            value: (Todos.done().length/Todos.length)*100
        });
        $( "#verified-progress" ).progressbar({
            value: (Todos.checked().length/Todos.length)*100
        });
            
        // We update forms
        this.contentInput    = this.$(".new-todo-content");
        this.workerInput    = this.$(".new-todo-worker");
        this.commentInput    = this.$(".new-todo-comment");
        this.categoryInput    = this.$(".new-category");
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(todo) {
        var view = new TodoView({
            model: todo
        });
        
        var el = $(view.render().el);
        $(this.$(".todo-list")).append(el);
        //el.show("blind");
            
            this.$(".todo-list").sortable({
                handle: '.todo-drag',
                start: function(ev, ui){
                    this.old_index = $(".todo-list li").index(ui.item);
                },
                update: function(ev, ui){
                    this.new_index = $(".todo-list li").index(ui.item);
                    Todos.move(this.old_index, this.new_index);
                },
                placeholder: "todo-placeholder",
                revert: true,
                revertDuration: 200
            });
    },

    // Add all items in the **Todos** collection at once.
    addAll: function() {
        Todos.each(this.addOne);
    },
    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOneCategory: function(cat) {
        var view = new CategoryView({
            model: cat
        });
        
        var el = $(view.render().el);
        el.css("opacity",0);
        $(this.$("#select")).append(el);
        el.animate({
            opacity: 1
        }, 1000);
    },

    // Add all items in the **Todos** collection at once.
    addAllCategory: function() {
        Categories.each(this.addOneCategory);
    },
    

    // Generate the attributes for a new Todo item.
    newAttributes: function() {
        return {
            content: this.contentInput.val(),
            worker:  this.workerInput.val(),
            comment:  this.commentInput.val(),
            order:   Todos.nextOrder(),
            done:    false
        };
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    createOnEnter: function(e) {
        if (e.keyCode != 13) return;
            
        if(this.contentInput.val() == '' || this.workerInput.val() == '') return;
            
        Todos.create(this.newAttributes());
            
        this.contentInput.val('');
        this.workerInput.val('');
        this.commentInput.val('');
    },
    
    createCategoryOnEnter: function(e) {
        if (e.keyCode != 13) return;
        
        if(this.categoryInput.val() == '' || this.categoryInput.val() == this.categoryInput.attr('placeholder')) return;
        
        Categories.create({
            name: this.categoryInput.val(),
            id: Categories.nextId(),
            order: Categories.nextOrder()
        });
            
        this.categoryInput.val('');
    },

    // Clear all done todo items, destroying their models.
    clearCompleted: function() {
        _.each(Todos.done(), function(todo){
            todo.destroy();
        });
        return false;
    },

    showTooltip: function(e) {
        var tooltip = this.$(".create-todo .ui-tooltip-top");
        tooltip.fadeOut("fast");
        if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
        if (this.contentInput.val() == '' || this.contentInput.val() == this.contentInput.attr('placeholder')) return;
        if (this.workerInput.val() == '' || this.workerInput.val() == this.workerInput.attr('placeholder')) return;
        var show = function(){
            tooltip.fadeIn("fast");
        };
        this.tooltipTimeout = _.delay(show, 600);
    },
    
    
    showCategoryTooltip: function(e) {
        var tooltip = this.$(".create-category .ui-tooltip-top");
        tooltip.fadeOut("fast");
        if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
        if (this.categoryInput.val() == '' || this.categoryInput.val() == this.categoryInput.attr('placeholder')) return;
        var show = function(){
            tooltip.fadeIn("fast");
        };
        this.tooltipTimeout = _.delay(show, 600);
    }

});