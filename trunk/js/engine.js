// *** CLASSE Engine **//
{
	function Engine(game, canvas) { 
		// Moteur du jeu
		this.game = game;
		
		// Canvas : zone de dessin
		this.canvas = canvas;
	}

	Engine.prototype = {
            draw: function(){
                console.log(game.ship.position.x);
            }
	}
}