// Permet d'écrire des messages préformatés lors de l'entrée du joueur dans une salle.
function entrer(nomSalle, instructions){
	if(nomSalle.toLowerCase() == "exterieur"){
		ecrire();
	}else{
		if(!prenom) prenom = "";
		var message = "Bienvenue "+prenom+" dans la salle "+nomSalle+" ! "+instructions;

		ecrire(message);
	}
}

// Permet d'écrire un message, en fonction du mode (flash ou webgl)
function ecrire(message){
	// Si on est en webgl, on peut manipuler l'overlay depuis le javascript
	var overlayL1 = engine.getScene().getSceneNodeFromName("OverlayL1");
	var overlayL2 = engine.getScene().getSceneNodeFromName("OverlayL2");
	
	if(webgl && overlayL1 && overlayL2){
		var messagesArray = message.split("\n", 2);
		
		// donc on affiche le message dans l'overlay
		
		if(messagesArray[0]) overlayL1.setText(messagesArray[0]);
		else overlayL1.setText("");
		
		if(messagesArray[1]) overlayL2.setText(messagesArray[1]);
		else overlayL2.setText("");
	}
	// Si on est pas en webgl ou qu'on a pas défini les overlays dans la salle, on ne peut pas
	else{
		// donc on affiche une alerte
		if(message && message != ""){
			alert(message);
		}
	}
}

// Affiche la page donnée en paramètre dans un popup
function popup(page){
	// On défini des options bloquant le déplacement lorsqu'un popup est affiché,
	// et le réactivant à la fermeture
	var cam = engine.getScene().getActiveCamera();
	var NMoptions = {
		callbacks: {
			// Avant l'affichage du fond noir
			beforeShowBg: function(nm) {
				if(webgl && cam){
					var animator = cam.getAnimatorOfType("camerafps");
					if(animator){
						animator.setMayMove(false);
					}
				}
			},
			// Après la disparition du fond noir
			afterHideBg: function(nm) {
				if(webgl && cam){
					var animator = cam.getAnimatorOfType("camerafps");
					if(animator){
						animator.setMayMove(true);
					}
				}
			}
		}
	};
	$.nmManual(page, NMoptions);
}

function afficherModeEmploi(){
	popup("pages/modeEmploi.html");
}