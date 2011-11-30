// *** CLASSE GAME **//
{
	function Game(canvas) { 
		// Score
		this.distance = 0;
		
		// Status : stopped, started
		this.status = "stopped";
		
		// Param�tres
		this.fps = 30;	// Images par secondes
		this.speed = 3;	// Vitesse (dépend du nombre d'images par secondes)
		this.width = canvas.width;
		this.height = canvas.height;
		
		// Objets du jeu
		this.ship;
		this.rocks = [];
		
		// Moteur de dessin
		this.engine = new Engine(this, canvas);
	}

	Game.prototype = {
	
		start: function(){			
			// Initialise les objets du jeu
			this.distance = 0;
			this.rocks = [];
			this.ship = new Ship(Math.round(this.width/2), 10, this.width);
			
			// Execute un rafraichissement r�guli�rement
			$(this).everyTime(Math.round(1000/this.fps), "execute", this.execute);
			
			// Indique que le jeu est en cours
			this.status = "started";
		},
		
		stop: function(){
			console.log("Game over");
			
			$(this).stopTime();
			
			// Indique que le jeu est en arr�t�
			this.status = "stopped";
			
			// Demande au moteur de dessin de dessiner la page
			this.engine.draw();
		},
		
		execute: function(){
			// Mise à jour des positions des objets du jeu
			this.updateRocks();
			
			// Déplacement du vaisseau
			this.ship.update(this.speed);
			
			// D�tection des collisions entre le vaisseau et les obstacles
			this.detectCollisions();
			
			// Demande au moteur de dessin de dessiner la page
			this.engine.draw();
		},
		
		updateRocks: function(){
			var game = this.game;
			
			// TODO : ajouter les caillou :D
			
			// Pour chaque obstacle, on execute la fonction
			$.each(this.rocks, function() {
				// Ici, this est l'un des obstacles
				this.update(this.speed);
				
				// On efface les obstacles sortis de l'�cran
				if(game.position.y > game.height) game.rocks.remove(this);
			});
		},
		
		// On compare la position du vaisseau, avec les limites des obstacles
		detectCollisions: function(){
			var shipPosition = this.ship.position;
			var collide = false;
			
			$.each(this.rocks, function() {
				// Ici, this est l'un des obstacles
				collide |= this.doesCollide(shipPosition);	// On v�rifie si il y a la moindre collision
			});
		}
	}
}

// *** CLASSE ROCK **//
{
	function Rock(x,y, width, height) { 
		// position
		this.position = new Object();
		this.position.x = x;
		this.position.y = y;
		
		// taille
		this.size = new Object();
		this.size.width = width;
		this.size.height = height;
	}

	Rock.prototype = {
		update: function(speed){
		
		}
	}
}


// *** CLASSE SHIP **//
{
	function Ship(x,y, maxRight) { 
		// position
		this.position = new Object();
		this.position.x = x;
		this.position.y = y;
		
		this.left = false;
		this.right = false;
		
		// Distance maximale � droite
		this.maxRight = maxRight;
		
		this.registerKeys();
	}

	Ship.prototype = {
		registerKeys: function(){
			var ship = this;
			$(window).keydown(function(event){
				if(event.which == 81) ship.goLeft();
				if(event.which == 68) ship.goRight();
			});
			
			$(window).keyup(function(event){
				if(event.which == 81) ship.stopLeft();
				if(event.which == 68) ship.stopRight();
			});
		},
		
		goRight: function(){
			this.right = true;
		},
		
		stopRight: function(){
			this.right = false;
		},
		
		goLeft: function(){
			this.left = true;
		},
		
		stopLeft: function(){
			this.left = false;
		},
		
		update: function(speed){
			var left = this.left ? -1 : 0;
			var right = this.right ? 1 : 0;
                        
			this.position.x += speed*(left + right);
			
			if(this.position.x > this.maxRight) this.position.x = this.maxRight;
			if(this.position.x < 0) this.position.x = 0;
                        
		}
	}
}