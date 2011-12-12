window.CategoryList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Category,
    
    localStorage: new Store("categories"),
    
    initialize: function() {
        if(this.getByName("defaut").length == 0){
            this.create({
                name: "defaut",
                mandatory: true,
                id: 0,
                order: this.nextOrder(),
                selected: true
            });
        }
    },
    
    getByName: function(name){
        return (name != undefined) && this.select(function(cat){ return cat.get("name").toLowerCase() == name.toLowerCase(); });
    },
    
    getById: function(id){
        if(id == undefined) return [];
        return this.select(function(cat){return cat.get("id") == id; });
    },
    
    
    nextOrder: function() {
        if (!this.length) return 1;
        return this.last().get('order') + 1;
    },
    
    nextId: function() {
        return this.reduce(function(max, cat){ return Math.max(max,cat.get("id")); }, 0) + 1;
    },

    // Todos are sorted by their order.
    comparator: function(cat) {
        return cat.get('order');
    },
        
    enumerate: function(){
        this.each(function(cat, index){
            cat.save({
                order: index
            });
        });
    }
        /*
    ,move: function(old_index, new_index){
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
    }*/
});