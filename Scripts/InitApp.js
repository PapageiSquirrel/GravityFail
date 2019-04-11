var stage, config, preload;

function init() {
	stage = new createjs.Stage("ZoneJeu");
	
	loadFiles();
}

function reset() {
	stage.removeAllChildren();
	stage.update();	
	
	initGame();
}

// PRELOAD
function loadFiles() {
	//url = cordova.file.applicationDirectory + "www/img/";
	
	preload = new createjs.LoadQueue(false);
	preload.loadFile({id: "config", src: "config.json"});
	preload.loadManifest({ 
		"path": "img/",
		"manifest": [
			{"id": "fondTitre", "src": "FondTitre.jpg"}, 
			{"id": "fondJeu", "src": "Fond.gif"}, 
			{"id": "astro", "src": "astro.png"},
			{"id": "astroTir", "src": "astroshoot.png"}, 
			{"id": "etoile", "src": "etoile.png"}, 
			{"id": "asteroideA1", "src": "asteroideA1.png"}, 
			{"id": "asteroideA2", "src": "asteroideA2.png"}, 
			{"id": "asteroideA3", "src": "asteroideA3.png"}, 
			{"id": "asteroideA4", "src": "asteroideA4.png"},
			{"id": "asteroideB1", "src": "asteroideB1.png"}, 
			{"id": "asteroideB2", "src": "asteroideB2.png"}, 
			{"id": "asteroideB3", "src": "asteroideB3.png"},
			{"id": "asteroideNOIR1", "src": "asteroideNOIR1.png"}, 
			{"id": "meteore", "src": "meteore.png"}, 
			{"id": "tir1", "src": "tir.png"},
			{"id": "tir2", "src": "tir2.png"}
		]
	});

	preload.on("complete", initGame, this);
}

function initGame() {
	config = preload.getResult("config");
	
	var canvas = document.getElementById("ZoneJeu");
	var w = (window.innerWidth < 300 ? window.innerWidth : 300);
	var h = (window.innerHeight < 600 ? window.innerHeight : 600);
	// TODO: normaliser la proportion width / height (ie: 0.5)
	
	canvas.width  = w;
	canvas.height = h;
	
	taille_ecran = {width: w, height: h}
	nb_cadrans = 6;
	taille_cadran = taille_ecran.width / config.cadran.nb;
	pt_apparition = taille_ecran.height * 1.1;
	nb_frames_entre_tirs = 10;
	
	keyState = {};
	items.splice(0, items.length);
	items_added.splice(0, items_added.length);
	
	// TODO: CONFIG
	verif_spawn = 0;
	
	frames = 0;
	score = 0;
	etoile_count = 0;
	delay = 0;
	started = false;
	script = null;
	
	var ss_startScreen = new createjs.SpriteSheet({
		frames: { width: 874, height: 1404},
		images: [preload.getResult("fondTitre")]
	});
	startScreen = new createjs.Sprite(ss_startScreen);
	startScreen.setTransform(0, 0, taille_ecran.width/874, taille_ecran.height/1404);
	stage.addChild(startScreen);
	
	var text_start = new createjs.Text("Press 'S' to start a new game", "20px Arial", "#000000");
	text_start.x = 150
	text_start.y = 350
	text_start.textAlign = "center";
	text_start.lineWidth = 150;
	stage.addChild(text_start);
	
	stage.update();	
	
	var ss_fond = new createjs.SpriteSheet({
		frames: { width: 874, height: 1404},
		images: [preload.getResult("fondJeu")]
	});
	fond = new createjs.Sprite(ss_fond);
	fond.setTransform(0, 0, taille_ecran.width/874, taille_ecran.height/1404);
	
	var ss_heros = new createjs.SpriteSheet({
		frames: {width: 266, height: 621},
		animations: {stand: {frames: 0}, shoot: {frames: 1, next: 'stand'}},
		images: [preload.getResult("astro"), preload.getResult("astroTir")],
		framerate: 3
	});
	heros = new createjs.Sprite(ss_heros);
	heros.setTransform((taille_ecran.width-50)/2, (taille_ecran.height-100)/2, 50/266, 100/621);
	
	config.item_list.forEach(function(name) {
		items.push({
			size: {x: (taille_ecran.width * config.sprites[name].size.w), y: (taille_ecran.height * config.sprites[name].size.h)},
			item: createSprite(name), 
			type: config.sprites[name].type, 
			dest: config.sprites[name].dest, 
			pts: config.sprites[name].pts, 
			vitesse: config.sprites[name].vitesse, 
			prob: config.sprites[name].prob, 
			lim: config.sprites[name].lim
		});
	});

	// TIR
	var ss_tir = new createjs.SpriteSheet({
		//frames: [{width: 57, height: 141}, {width: 42, height: 91, imageIndex: 1}],
		frames: [[0, 0, 57, 141], [0, 0, 42, 91, 1]],
		animations: {fire: {frames: 0, next: 'travel'}, travel: {frames: 1}},
		images: [preload.getResult("tir1"), preload.getResult("tir2")],
		framerate: 10
	});
	var s_tir = new createjs.Sprite(ss_tir);
	s_tir.setTransform(0, 350, 15/42, 30/91);
	tir = {
		item: s_tir, 
		type: 'tir', 
		vitesse: 1.5,
		impact: {x: 21, y: 80}
	};
	// FIN CREATION SPRITES
	
	text_score = new createjs.Text(score, "20px Arial", "#ffffff");
	text_score.x = 280
	text_score.y = 15
	text_score.textAlign = "right";
	
	text_etoile = new createjs.Text(etoile_count, "20px Arial", "#ffffff");
	text_etoile.x = 60
	text_etoile.y = 15
	text_etoile.textAlign = "right";
	
	text_reset = new createjs.Text("Press 'R' to reset", "20px Arial", "#ffffff");
	text_reset.x = 280
	text_reset.y = 580
	text_reset.textAlign = "right";
	
	if (createjs.Touch.isSupported()) {
		console.log("Supporté !");
		
		createjs.Touch.enable(stage);
		
		stage.addEventListener('click', function(e) {
			if (!started) {
				started = true;
				stage.removeAllChildren();
				stage.update();
				
				initStage();
			} else {
				tirer();
			}
		});
	} else {
		window.addEventListener('keydown', function(e) {
			if (e.keyCode == 83) {
				if (!started) {
					started = true;
					stage.removeAllChildren();
					stage.update();
				
					initStage();
				}
			}
		});
	}
}