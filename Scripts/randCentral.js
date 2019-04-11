var randomSeed = Date.now();

function randCentral() {
	randomSeed = (randomSeed * 9301 + 49297) % 233280;
	return randomSeed / 233280.0;
}