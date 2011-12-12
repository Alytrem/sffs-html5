window.CategoryView = Backbone.View.extend({

    tagName:  "div",

    template: _.template($('#category-template').html()),
    
    className: "category",

    events: {
        "click button.select-category" : "toogleSelected",
        "click button.delete-category" : "clear"
    },

    initialize: function() {
        this.model.bind('change', this.render, this);
        this.model.bind('destroy', this.remove, this);
    },

    // Re-render the contents of the todo item.
    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        
        var button = this.$(".select-category").button();
        
        if(!this.model.get("mandatory")){
            button.next().button( {
                text: false,
                icons: {
                    primary: "ui-icon-circle-close"
                }
            }).parent().buttonset();
        }
        
        var th = this;
        
        this.$(".select-category").droppable({
            accept: ".todo-list li",
            tolerance: 'pointer',
            hoverClass: "ui-state-hover",
            drop: function(e, ui){
                th.drop(e, ui)
                }
        });
        
        //this.setContent();
        return this;
    },

    // To avoid XSS (not that it would be harmful in this particular app),
    // we use `jQuery.text` to set the contents of the todo item.
    /*
    setContent: function() {
        var content = this.model.get('content');
        var worker = this.model.get('worker');
        var comment = this.model.get('comment');
            
        this.$('.todo-content').text(content);
        this.$('.todo-worker').text(worker);
        this.$('.todo-comment').text(comment);
            
        this.contentInput = this.$('.todo-input-content');
        this.workerInput = this.$('.todo-input-worker');
        this.commentInput = this.$('.todo-input-comment');
            
        this.contentInput.bind('blur', _.bind(this.close, this));
        this.workerInput.bind('blur', _.bind(this.close, this));
        this.commentInput.bind('blur', _.bind(this.close, this));
            
        this.contentInput.bind('focus', _.bind(this.doNotClose, this));
        this.workerInput.bind('focus', _.bind(this.doNotClose, this));
        this.commentInput.bind('focus', _.bind(this.doNotClose, this));
            
        this.contentInput.val(content);
        this.workerInput.val(worker);
        this.commentInput.val(comment);
    },
        */
       
    // Remove this view from the DOM.
    remove: function() {
        $(this.el).remove();
    },

    // Remove the item, destroy the model.
    clear: function() {
        var model = this.model;
        
        Todos.changeCategory(model.get("id"), 0);
        
        if(model.get("selected")){
            this.toogleSelected();
        }
        
        $(this.el).hide("explode", function(){
            model.destroy();
        });
    },
    
    toogleSelected: function(){
        this.model.toogleSelected();
    },
    
    drop: function (event, ui){
        if(ui.draggable.children()[0] != undefined){            
            var order = ui.draggable.children()[0].id.match(/\d/i);
            if(order.length > 0){
                order = order[0];
            }
            
            var todo = Todos.at(order);
            var new_cat = this.model.get('id');
            
            todo.save({
                category: new_cat
            });
        }
    }

});