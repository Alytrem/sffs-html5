// *** CLASSE Engine **//
{
	function Engine(game, canvas) { 
		// Moteur du jeu
		this.game = game;
		
		// Canvas : zone de dessin
		this.canvas = canvas;
                
                // Context : objet d'interaction pour dessiner
                this.context = this.canvas.getContext("2d");
	}

	Engine.prototype = {
            draw: function(){
                this.reset();
                this.drawShip();
                this.drawRocks();
            },
            reset: function(){
                this.canvas.width = this.canvas.width;
            },
            drawShip: function(){
                this.context.beginPath();
                var rayon = this.game.ship.size;
                this.context.arc(this.game.ship.position.x, this.game.ship.position.y, rayon, 0, Math.PI * 2, false);
                this.context.closePath();
                this.context.stroke();
            },
            drawRocks: function(){
                var engine = this;
                $.each(this.game.rocks, function() {
                    // Ici, this est l'un des obstacles
                    engine.drawRock(this.position.x, this.position.y, this.size.width, this.size.height);

                    // On efface les obstacles sortis de l'�cran
                    if(this.position.y > game.height) game.rocks.remove(this);
                });
            },
            drawRock: function(x,y, width, height){
                this.context.strokeRect(x, y, width, height);
            }
	}
}

/*
 * Exercice 1 : faire l'engine
 * Exercice 2 : faire la class Ship avec gestion sur 1 axe
 * Exercice 3 : passer sur une gestion du vaisseau sur 2 axes
 * Exercice 4 : améliorer l'engine en dessinant une image pour le vaisseau
 * Exercice 5 : afficher le score + gérer le start/stop/resume (game.status)
 * Exercice 6 : utiliser la souris plutôt que le clavier
 * Exercice 7 (facultatif) : rendre la vitesse du vaisseau et des caillous réglable dans le menu
 * Exercice 8 (facultatif) : rendre l'état du jeu persistant via l'API local storage + sauvegarder et afficher les meilleurs scores
 */
 
 
 /*
  * A FAIRE :
  * - tester le TP
  * - modifier le PPT pour adapter
  * - ajouter plus de trucs sur canvas
  * - faire le sujet de TP (Quentin)
  */