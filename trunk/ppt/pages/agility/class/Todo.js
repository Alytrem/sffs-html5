window.Todo = Backbone.Model.extend({

    // Default attributes for the todo.
    defaults: {
        content: "tache vide...",
        worker: "Personne",
        comment: "",
        status: 0,
        category: 0, // category by default
        order: 0
    }
});