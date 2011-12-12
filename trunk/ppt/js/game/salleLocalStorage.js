// Affiche le contenu du mémo dans l'overlay
function readMemo(){
	if(!Modernizr.localstorage){
		ecrire("Impossible de lire le mémo, votre navigateur ne supporte pas le stockage local");
	}else if(!localStorage["memo.memo"]){
		ecrire("Vous n'avez pas encore écrit de mémo");
	}else{
		memo = localStorage["memo.memo"];
		date = localStorage["memo.date"];
		heure = localStorage["memo.heure"];
		ecrire("Le "+date+" à "+heure+",\npenser à "+memo);
	}
}

// Ouvre un overlay HTML pour écrire un nouveau mémo.
function writeMemo(){
	popup("pages/formulaireMemo.html");
}

// Ouvre un overlay HTML avec des informations sur la salle
function infoSalleLocalStorage(){
	popup("pages/info-LocalStorage.html");
}
