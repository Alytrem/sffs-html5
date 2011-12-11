// On récupère le canvas (élément de la page), grace à Jquery
var canvas = $("#screen")[0];

// On créé un nouveau jeu
var game = new Game(canvas);

// On démarre le jeu
game.start();