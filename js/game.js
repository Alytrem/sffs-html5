// *** CLASSE GAME **//
{
	function Game(canvas, parameters) {
                parameters = parameters || new Object();
                
		// Score
		this.distance = 0;
		
		// Status : stopped, running, paused
		this.status = "stopped";
		
		// Param�tres
		this.fps = parameters.fps || 100;	// Images par secondes
                
                this.speed = new Object();
		this.speed.ship = parameters.shipSpeed || 3;	// Vitesse en pixel par frame
                this.speed.rock = parameters.rocksSpeed || 3;	// Vitesse en pixel par frame
                
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
			this.ship = new Ship(Math.round(this.width/2), this.height-20, 10, this.width, this.height);
			
			// Execute un rafraichissement r�guli�rement
			$(this).everyTime(Math.round(1000/this.fps), "execute", this.execute);
			
			// Indique que le jeu est en cours
			this.status = "running";
		},
		
		stop: function(){			
			$(this).stopTime();
			
			// Indique que le jeu est en arr�t�
			this.status = "stopped";
			
			// Demande au moteur de dessin de dessiner la page
			this.engine.draw();
		},
                
                resume: function(){
                    if(status == "paused"){
                        $(this).everyTime(Math.round(1000/this.fps), "execute", this.execute);
                        this.status = "running";
                    }
                },
                
                pause: function(){
                    if(status == "running"){
                        $(this).stopTime();
                    }
                },
		
		execute: function(){
                        // MAJ du score
                        this.distance += this.speed.rock;
                        
			// Mise à jour des positions des objets du jeu
			this.updateRocks();
			
			// Déplacement du vaisseau
			this.ship.update(this.speed.ship);
			
			// D�tection des collisions entre le vaisseau et les obstacles
			this.detectCollisions();
			
			// Demande au moteur de dessin de dessiner la page
			this.engine.draw();
		},
		
		updateRocks: function(){
			var game = this;
			
                        // On se rappelle du caillou le plus haut sur le canvas
                        var highestRock = null
			
			// Pour chaque obstacle, on execute la fonction
			$.each(this.rocks, function() {
				// Ici, this est l'un des obstacles
                                if(this != $(window)[0]){
                                    this.update(game.speed.rock);

                                    // On efface les obstacles sortis de l'ecran
                                    if(this.position.y > game.height) game.rocks.shift();

                                    // on oublie pas que le 0,0 est en haut à gauche
                                    if(highestRock == null || highestRock.position.y > this.position.y){
                                        highestRock = this;
                                    }
                                }
			});
                        
                        
			// On calcule la taille d'un hypothetique caillou
                        var width = this.ship.size*3 + Math.floor(Math.random() * (this.width*0.7 - this.ship.size*6));
                        var height = this.ship.size*3;
                        // On calcule la position hypothetique du caillou
                        var x = (highestRock != null ? highestRock.position.x : 0) + Math.floor(Math.random() * (this.width - this.ship.size*3));
                        
                        if(highestRock != null && x + width >= this.width){
                            if(highestRock.position.x > this.width/3)
                                x = 0;
                            else
                                x = this.width - width;
                        } 
                        
                        var y = -height;
                        
                        // On ajoute un caillou si il y a de la place pour l'espace de 2 vaisseaux
                        // Et si on a de la chance
                        if(Math.random() < 0.3 && (highestRock == null || (highestRock.position.y - highestRock.size.height) > (this.ship.size*2 + height))){
//                            console.log("create Rock", new Rock(x,y,width,height));
                            this.rocks.push(new Rock(x,y,width,height));
                        }
		},
		
		// On compare la position du vaisseau, avec les limites des obstacles
		detectCollisions: function(){
			var ship = this.ship;
			var collide = false;
			
			$.each(this.rocks, function() {
				// Ici, this est l'un des obstacles
				collide |= this.doesCollide(ship.position.x, ship.position.y, ship.size, ship.size);	// On v�rifie si il y a la moindre collision
			});
                        
                        if (collide){
                            this.stop();
                        }
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
                    this.position.y += speed;
		},
                doesCollide:function(x,y,width, height){
//                    console.log(x, y, width, x + width > this.position.x, y + height > this.position.y, x < this.position.x + this.size.width, y < this.position.y + this.size.height);
                    return (x + width > this.position.x && y + height > this.position.y && x < this.position.x + this.size.width && y < this.position.y + this.size.height);
                }
	}
}
