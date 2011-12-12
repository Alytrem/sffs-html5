// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){
    
    // Create our global collection of **Todos**.
    window.Todos = new TodoList;
    window.Categories = new CategoryList;
    
    window.App = new AppView;
});