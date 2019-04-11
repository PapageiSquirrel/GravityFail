var scripts = [{ 
	nom: 'derniere chance',
	description: 'etoile face à une ligne de meteorite incassable',
	frame_debut: 600,
	frame_fin: 800,
	evenements: [{
		frame: 700, 
		items: [
			{type: 'etoile', nb: 1, cadrans: [3]}
		]
	},{
		frame: 750, 
		items: [
			{type: 'asteroide_noir', nb: 6, cadrans: [0,1,2,3,4,5]}
		]
	}]
}];

function PassageScripte(nb_frames) {
	var script = scripts.filter(function(s) {
		return s.frame_debut == nb_frames;
	})[0];
	return script;
}