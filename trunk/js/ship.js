// *** CLASSE SHIP **//
{
	function Ship(x,y,size,maxRight,maxBottom) { 
		// position du vaisseau
		this.position = new Object();
		this.position.x = x;
		this.position.y = y;
                
                // taille du vaisseau (largeur = hauteur)
                this.size = size;
		
                // directions activées
		this.left = false;
		this.right = false;
		this.up = false;
		this.down = false;
		
		// Distance maximale à droite
		this.maxRight = maxRight;
                
		// Distance maximale en bas
		this.maxBottom = maxBottom;
		
                // fonction pour activer la capture des touches
		this.registerKeys();
	}

	Ship.prototype = {
		registerKeys: function(){
			var ship = this;
			$(window).keydown(function(event){
				if(event.which == 81) ship.left = true;
				if(event.which == 68) ship.right = true;
				if(event.which == 90) ship.up = true;
				if(event.which == 83) ship.down = true;
			});
			
			$(window).keyup(function(event){
				if(event.which == 81) ship.left = false;
				if(event.which == 68) ship.right = false;
				if(event.which == 90) ship.up = false;
				if(event.which == 83) ship.down = false;
			});
		},
		
		update: function(speed){
                    // (condition ? valeur si vrai : valeur si faux)
                    var left = this.left ? -1 : 0;
                    var right = this.right ? 1 : 0;
                    var up = this.up ? -1 : 0;
                    var down = this.down ? 1 : 0;

                    // ### PARTIE HORIZONTALE ###
                    // on multiplie le mouvement par la vitesse
                    this.position.x += speed*(left + right);

                    // on empèche la sortie du canvas
                    if(this.position.x > this.maxRight) this.position.x = this.maxRight;
                    if(this.position.x < 0) this.position.x = 0;

                    // ### PARTIE VERTICALE ###
                    // on multiplie le mouvement par la vitesse
                    this.position.y += speed*(up + down);
                    
                    // on empèche la sortie du canvas
                    if(this.position.y > this.maxBottom) this.position.y = this.maxBottom;
                    if(this.position.y < 0) this.position.y = 0;
		}
	}
}