function createSprite(name) {
	var data = config.sprites[name];
	
	var imgs = [];
	var img_sizes = [];
	data.images.forEach(function(img) {
		var html_img = preload.getResult(img);
		if (!data.width || !data.height) {data.width = html_img.width; data.height = html_img.height; }
		img_sizes.push({'width': html_img.width, 'height': html_img.height}); 
		imgs.push(html_img);
	});
	
	var spritesheet = new createjs.SpriteSheet({
		frames: {'width': data.width, 'height': data.height},
		animations: data.animations,
		images: imgs,
		framerate: data.framerate
	})
	var sprite = new createjs.Sprite(spritesheet);
	sprite.setTransform(0, pt_apparition, (taille_ecran.width * data.size.w)/data.width, (taille_ecran.height * data.size.h)/data.height);
	
	return sprite;
}