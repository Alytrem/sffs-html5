window.Category = Backbone.Model.extend({
    defaults: {
        id: 0,
        name: "Defaut",
        order: 1,
        selected: false,
        mandatory: false
    },
    
    toogleSelected: function(){
        this.set({
            selected: !this.get("selected")
        });
    }
});