// DECLARATION DES VARIABLES GLOBALES
// SPRITES ET STAGE
var startScreen, fond, heros, tir;
// CONFIG
var taille_ecran, nb_cadrans, taille_cadran, pt_apparition, nb_frames_entre_tirs;
// EVENT
var frames, keyState, ticker, delay, script, started;
// ARRAY DE SPRITES
var items = [], items_added = [], tirs = [];
// COEFF
var coeff_spawn, coeff_nb, verif_spawn, coeff_vitesse;
// SCORING
var score, etoile_count;
// TEXT
var text_score, text_etoile, text_reset;
// FIN DECLARATION

function tirer() {
	if (delay == 0) {
		var new_tir = tir.item.clone();
		var pt = heros.localToGlobal(110, 621);
		new_tir.x = pt.x;
		new_tir.y = pt.y;
		tirs.push(new_tir);
		stage.addChild(new_tir);
		delay = nb_frames_entre_tirs;
		
		new_tir.gotoAndPlay('fire');
		heros.gotoAndPlay('shoot');
	}
}

function initStage() {
	stage.addChild(fond);
	stage.addChild(heros);
	
	// Scoring
	// Ajout de l'interface en haut de l'écran
	stage.addChild(text_score);
	stage.addChild(text_etoile);
	stage.addChild(text_reset);
	// Fin interface
	
	ticker = createjs.Ticker.addEventListener("tick", handleTick);
	createjs.Ticker.setFPS(60);
	
	window.addEventListener('keydown',function(e){
		keyState[e.keyCode || e.which] = true;
	},true);    
	window.addEventListener('keyup',function(e){
		keyState[e.keyCode || e.which] = false;
	},true);
}

// EXECUTER A CHAQUE FRAME
function handleTick(event) {
	try {	
		// TODO: acceleration calcul pour déplacement sur smart phone
		if (createjs.Touch.isSupported()) {
			/*
			navigator.accelerometer.getCurrentAcceleration(function(acceleration) {
				// Rendre la vitesse du heros (2) variable en fonction du degré d'inclinaison (sachant que la limite est 2 pour le moment)
				if (Math.floor(acceleration.x) > 0) {
					heros.x -= event.delta/1000 * 60 * (2 * coeff_vitesse);
				} else if (Math.floor(acceleration.x) < 0) {
					heros.x += event.delta/1000 * 60 * (2 * coeff_vitesse);
				}
			}, function() {
				// Throw une exception
			});
			*/
		} else {
			if (keyState[82]) {
				createjs.Ticker.removeEventListener("tick", ticker);
				reset();
			}
			
			heros.y += event.delta/1000 * 60 * 2;
			
			if (keyState[37]) {
				heros.x -= event.delta/1000 * 60 * 5;
			}    
			if (keyState[39]) {
				heros.x += event.delta/1000 * 60 * 5;
			}
			if (keyState[38]) {
				heros.y -= event.delta/1000 * 60 * 6;
			}    
			if (keyState[40]) {
				heros.y += event.delta/1000 * 60 * 5;
			}
		
			// TIR
			if (keyState[32]) { // espace pour tirer
				tirer();
			}
		}
		if (delay > 0) {
			delay--;
		}
		
		// Limites de l'écran
		if (heros.x <= 0) heros.x = 0;
		if (heros.x >= taille_ecran.width-50) heros.x = taille_ecran.width-50;
		
		// Destruction des asteroides préalablement détruit
		for (var index = 0; index < items_added.length; index++) {
			var item_selected = items_added[index].item;
			if (items_added[index].type == 'asteroide' && item_selected.currentAnimation == 'destroyed') {
				stage.removeChild(item_selected);
				items_added.splice(index, 1);
				index -= 1;
			}
		}
		
		// Calcul de collision (Sans véritable hitbox pour le moment) 
		// OU
		// Suppression des items inutiles
		for (var index = 0; index < items_added.length; index++) {
			var item_selected = items_added[index].item;
			var pts = items_added[index].pts;
			if (item_selected.y <= -100) {
				stage.removeChild(item_selected);
				items_added.splice(index, 1);
			} else {
				var coll = false;

				pts.some(function(pt) {
					var pt_trans = item_selected.localToLocal(pt.x, pt.y, heros); // Dépend de la taille de l'objet
					
					if (heros.hitTest(pt_trans.x, pt_trans.y)) {		// Dépend de la taille de l'objet
						switch(items_added[index].type) {
							case 'etoile':
								etoile_count++;
								text_etoile.text = etoile_count;
								break;
							case 'asteroide':
								// si l'asteroide n'est pas détruit, le héros meurt
								if (item_selected.currentAnimation == null) {
									console.log('Game over !');
								}
								break;
							case 'meteore':
								// si l'asteroide n'est pas détruit, le héros meurt
								console.log('Game over !');
								break;
							// Autres types d'objets
						}
						
						coll = true;
					}
					
					return coll;
				});

				if (coll) {
					stage.removeChild(item_selected);
					items_added.splice(index, 1);
					index -= 1;
				}

				if (!coll && items_added[index].type == 'asteroide' && items_added[index].dest) {
					for(var t = 0 ; t < tirs.length ; t++) {
						var impact = tir.impact;
						var pt_impact = tirs[t].localToLocal(impact.x, impact.y, item_selected);
						
						if (item_selected.currentAnimation == null && item_selected.hitTest(pt_impact.x, pt_impact.y)) {
							items_added[index].dest--;
							if (items_added[index].dest == 0) {
								item_selected.gotoAndPlay('hit');
							}
							
							stage.removeChild(tirs[t]);
							tirs.splice(t, 1);
							t--;
						}
					}
				} else if (!coll && items_added[index].type == 'asteroide' && !items_added[index].dest) {
					for(var t = 0 ; t < tirs.length ; t++) {
						var impact = tir.impact;
						var pt_impact = tirs[t].localToLocal(impact.x, impact.y, item_selected);
						
						if (item_selected.hitTest(pt_impact.x, pt_impact.y)) {
							stage.removeChild(tirs[t]);
							tirs.splice(t, 1);
							t--;
						}
					}
				}
				
			}
		}
		
		// Ajout d'un item aléatoire au stage, à un moment calculé aléatoirement à une position aléatoire
		if (!script && Math.floor(frames * 1/config.coeff['spawn']) > verif_spawn) {
			verif_spawn = Math.floor(frames * 1/config.coeff['spawn']);
			
			var cad_items_proches = [];
			items_added.forEach(function(obj) {
				if (obj.item.y + obj.size.y >= pt_apparition) {
					cad_items_proches.push(obj.cadran);
				}
			});
			
			for (var i = 0; i < Math.floor(config.coeff['nb']); i++) {
				var p = 0; // probabilité cumulé;
				var r = randCentral(); // générer un tableau de r (nombres aléatoires) puis ajouter un item par r (ou non fonction de la probabilité)
				items.forEach(function(obj) { 
					if (r <= p + obj.prob && r >= p) {
						var new_item = obj.item.clone();
						
						
						if (cad_items_proches.length > 0) {
							// filtrer
							var cad_dispo = [0,1,2,3,4,5].filter(function(e) {
								return !(cad_items_proches.indexOf(e) !== -1);
							});
							
							// tire un nombre random
							var pos_rand = randCentral();
							
							// fonction du nombre d'éléments dans l'array filtré, on choisi le cadran aléatoirement 
							if (cad_dispo.length !== 0) {
								for (var c = 1 ; c <= cad_dispo.length ; c++) {
									if (pos_rand < c/cad_dispo.length && pos_rand > (c-1)/cad_dispo.length) new_item.x = cad_dispo[c-1] * taille_cadran;
								}
							}
						} else {
							var x_rand = randCentral() * taille_ecran.width;
							new_item.x = Math.floor(x_rand/taille_cadran) * taille_cadran; 
						}
						
						if (cad_items_proches.length < config.cadran.nb) {
							cad_items_proches.push(Number(new_item.x/taille_cadran));
							items_added.push({item: new_item, type: obj.type, dest: obj.dest, pts: obj.pts, vitesse: obj.vitesse, size: obj.size, cadran: (new_item.x/taille_cadran)});
							stage.addChild(new_item);
						}
					}
					p += obj.prob;
				});
			}
		// Exécution des passages scriptés
		} else if (script) {
			// TODO: lire le script et ajouter les items nécessaires
			// Ajout des items à une frame de spawn donné
			var evenement = script.evenements.filter(function(e) {
				return e.frame == frames;
			})[0];
			
			if (evenement) {
				evenement.items.forEach(function(item) {
					var obj_to_add = null;
					
					switch(item.type) {
						case 'asteroide_noir':
							obj_to_add = items.filter(function(o) {
								return o.type == 'asteroide' && !o.dest;
							})[0];
							break;
						case 'asteroide':
							// Sortir un array des diférents asteroides
							break;
						default:
							obj_to_add = items.filter(function(o) {
								return o.type == item.type;
							})[0];
							break;
					}

					if (obj_to_add) {
						// si nb différent de nb cadrans alors selection d'un cadran au hasard pour chaque item
						if (item.nb > item.cadrans.length) {
							for (var n = 0 ; n < item.nb ; n++) {
								var new_item = obj_to_add.item.clone();
								var pos_rand = randCentral();
								// TODO: Corriger les bugs
								for (var c = 0 ; c < item.cadrans.length ; c++) {
									if (pos_rand < (c+1)/cad_dispo.length) new_item.x = item.cadrans[c] * taille_cadran;
								}
								items_added.push({item: new_item, type: obj_to_add.type, dest: obj_to_add.dest, pts: obj_to_add.pts, vitesse: obj_to_add.vitesse, size: obj_to_add.size, cadran: item.cadrans[n]});
								stage.addChild(new_item);
							}
						} else if (item.nb == item.cadrans.length) {
							for (var n = 0 ; n < item.nb ; n++) {
								var new_item = obj_to_add.item.clone();
								new_item.x = item.cadrans[n] * taille_cadran;
								
								items_added.push({item: new_item, type: obj_to_add.type, dest: obj_to_add.dest, pts: obj_to_add.pts, vitesse: obj_to_add.vitesse, size: obj_to_add.size, cadran: item.cadrans[n]});
								stage.addChild(new_item);
							}
						}
					}
				});
			}
			
			// fin du script : si frames > frame_fin
			if (frames > script.frame_fin) script = null;
		}
		
		// Avancement des items (vitesse variable)
		items_added.forEach(function(obj) { 
			obj.item.y -= event.delta/1000 * 60 * (obj.vitesse * config.coeff['vitesse']); 
		});
		tirs.forEach(function(obj) { 
			if (obj.currentAnimation != 'fire') {
				obj.y += event.delta/1000 * 60 * (tir.vitesse * config.coeff['vitesse']); 
			}
		});
		
		frames++;
		// Calcul du score (toutes les secondes)

		if (frames % 60 == 0) {
			score += 100;
			text_score.text = score;
			
			// Augmentation de la difficulté
			//coeff_spawn += ;
			//coeff_nb += 0.1;
		}
		
		// Recherche de script, s'il n'y a pas de script en cours d'exécution
		if (!script) script = PassageScripte(frames);
		
		stage.update(event);
	} catch(e) {
		console.log(e);
	}
}
// Fin
