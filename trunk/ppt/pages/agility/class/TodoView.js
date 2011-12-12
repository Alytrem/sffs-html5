window.TodoView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
        "click button.pending"              : "setPending",
        "click button.inprogress"          : "setInProgress",
        "click button.done"          : "setDone",
        "click button.checked"          : "setChecked",
            
        "dblclick .todo-content" : "editContent",
        "dblclick .todo-worker" : "editWorker",
        "dblclick .todo-comment" : "editComment",
            
        "click span.todo-destroy"   : "clear",
        "keypress .todo-input"      : "updateOnEnter"
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
        this.model.bind('change', this.render, this);
        this.model.bind('destroy', this.remove, this);
        
        this.updateCategory();
        
    },
    
    updateCategory: function(){
        // no changes
        if(this.category != undefined && this.category.get("id") == this.model.get("category")) return;
        
        var my_cat = Categories.getById(this.model.get("category"));
        
        if(my_cat.length >= 1){
            if(this.category != undefined)
                this.category.unbind("change:selected", this.updateVisibility);
            this.category = my_cat[0];
            this.category.bind("change:selected", this.updateVisibility, this);
        }else{
            return;
        }
    },

    // Re-render the contents of the todo item.
    render: function() {
        this.updateCategory();
        
        $(this.el).html(this.template(this.model.toJSON()));
       
        this.updateVisibility(0);
        
        this.setContent();
            
        this.$("button.pending").button(
        {
            icons: {
                primary: "ui-icon-clock"
            }, 
            text: false
        });
        this.$("button.inprogress").button(
        {
            icons: {
                primary: "ui-icon-play"
            }, 
            text: false
        });
        this.$("button.done").button(
        {
            icons: {
                primary: "ui-icon-check"
            }, 
            text: false
        });
        this.$("button.checked").button(
        {
            icons: {
                primary: "ui-icon-circle-check"
            }, 
            text: false
        });
        
        return this;
    },

    // To avoid XSS (not that it would be harmful in this particular app),
    // we use `jQuery.text` to set the contents of the todo item.
    setContent: function() {
        var content = this.model.get('content');
        var worker = this.model.get('worker');
        var comment = this.model.get('comment');
        
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
        
    setPending: function() {
        this.model.save({
            status: 0
        });
    },
        
    setInProgress: function() {
        this.model.save({
            status: 1
        });
    },
        
    setDone: function() {
        this.model.save({
            status: 2
        });
    },

    setChecked: function() {
        this.model.save({
            status: 3
        });
    },

        
    // Switch this view into `"editing"` mode, displaying the input field.
    editWorker: function() {
        $(this.el).addClass("editing");
        this.workerInput.focus();
    },
        
    // Switch this view into `"editing"` mode, displaying the input field.
    editContent: function() {
        $(this.el).addClass("editing");
        this.contentInput.focus();
    },
        
    // Switch this view into `"editing"` mode, displaying the input field.
    editComment: function() {
        $(this.el).addClass("editing");
        this.commentInput.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    close: function() {
        if(this.workerInput.val() == '' && this.contentInput.val() == '') return;
            
        this.model.save({
            content: this.contentInput.val(),
            worker: this.workerInput.val(),
            comment: this.commentInput.val()
        });
            
        $(this.el).removeClass("editing");
    },
        
    doNotClose: function() {
        $(this.el).addClass("editing");
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
        if (e.keyCode == 13) this.close();
    },

    // Remove this view from the DOM.
    remove: function() {
        $(this.el).remove();
    },

    // Remove the item, destroy the model.
    clear: function() {
        var model = this.model;
        $(this.el).hide("blind", function(){
            model.destroy();
        });
    },
    
    updateVisibility: function(time){        
        if(time == undefined) time = "slow";
        
        if(this.category != undefined){
            if(this.category.get("selected")){
                if(!$(this.el).is(":visible"))
                    $(this.el).show("blind", time);
            }else{
                    $(this.el).hide("blind", time);
            }
        }else{
            console.log(this,"undefined");
        }
    }

});