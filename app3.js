$(function() {
    // Universe
    var container
    , stats
    , camera
    , scene
    , projector
    , renderer;
    // Particles
    var particles = []
    , geometry
    , colors = []
    , materials = [];

    // Interactions
    // Mouse
    var mouse = {x:0,y:0};
    // Keyboard
    var keyboard = new THREEkb.KeyboardState()
    , shown = false;

    // Display
    var radius = 100
    , theta = 0;

    // Game
    var clock = new THREE.Clock()
    , tg = {"time":5
	    ,"destroyed":0
	    ,"highscore":0}
    , selectedTime = 5;

    // Modals
    var $gameoverModal = $('#gameoverModal')
    , $helpModal = $('#helpModal')
    , $pregameModal = $('#pregameModal');
    var btnPrimary = ".btn-primary";

    /*********
     * MODALS
     *********/
    $gameoverModal.find(btnPrimary).click(function(e){
	selectedTime = $(this).attr('data-time');
	$gameoverModal.modal("hide");
	eventListeners();
	init();
	e.preventDefault();
    });
    $helpModal.find(btnPrimary).click(function(e){
	$helpModal.modal("hide");
	e.preventDefault();
    });
    $pregameModal.find(btnPrimary).click(function(e){
	selectedTime = $(this).attr('data-time');
	$pregameModal.modal("hide");
	init();
	animate();
	e.preventDefault();
    });

    /********
     * START IT
     ********/
    function begin() {
	$pregameModal.modal({keyboard:false});
	$("#play-btn5").focus();
    }

    begin();

    function resetGame() {
	tg.time = selectedTime;
	tg.destroyed = 0;
    }

    function eventListeners() {
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('mousedown', onDocumentMouseDown, false);
    }

    function init() {
	// reset game
	resetGame();

	// event listeners
	eventListeners();

	// container
	var $contents = $('#contents');
	if ($contents.length > 0)
	    $contents.remove();
	container = document.createElement('div');
	container.id = "contents";
	document.body.appendChild(container);

	// scene and camera
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.set(0, 300, 500);
	scene.add(camera);

	// let there be light
	var light = new THREE.DirectionalLight(0xffffff, 2);
	light.position.set(1, 1, 1).normalize();
	scene.add(light);
	var light = new THREE.DirectionalLight(0xffffff);
	light.position.set(-1, -1, -1).normalize();
	scene.add(light);

	// 1000 worlds to destroy
	geometry = new THREE.SphereGeometry(10, 16, 16);
	for (var i = 0; i < 1000; i ++) {
	    var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff}));
	    object.name = i;
	    // translation = position
	    object.position.x = Math.random() * 800 - 400;
	    object.position.y = Math.random() * 800 - 400;
	    object.position.z = Math.random() * 800 - 400;
/*
	    object.rotation.x = (Math.random() * 360) * Math.PI / 180;
	    object.rotation.y = (Math.random() * 360) * Math.PI / 180;
	    object.rotation.z = (Math.random() * 360) * Math.PI / 180;
*/
	    var scale = Math.random() * 2 + 1;
	    object.scale.set(scale,scale,scale);
	    scene.add(object);
	}

	// projector
	projector = new THREE.Projector();

	// renderer
	renderer = new THREE.WebGLRenderer();
	renderer.sortObjects = false;
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	// stats
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild(stats.domElement);
    }

    /******
     * Mouse functionality
     ******/
    function onDocumentMouseMove(event) {
	event.preventDefault();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
	$('#debug-mouse').text(mouse.x + " " + mouse.y);
    }

    function onDocumentMouseDown(event) {
	event.preventDefault();
	var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	projector.unprojectVector(vector, camera);
	var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());
	var intersects = ray.intersectObjects(scene.children);
	if (intersects.length > 0) {
	    particleExplosion(intersects[0]);
	    scene.remove(intersects[0].object);
	    tg.destroyed++;
	}
    }

    /******
     * Keyboard functionality
     *****/
    function keyboardActions() {
	if(keyboard.pressed("h")) {
	    $helpModal.modal("show");
	}
    }

    /******
     * particles
     ******/
    function particleExplosion(obj) {
	// particles
	geometry = new THREE.Geometry();
	lifetimes = [];
	startPositions = [];
	endPositions = [];
	for (i = 0; i < 500; i++) {
	    lifetimes.push(Math.random());
	    startPositions.push((Math.random() * 0.25) - 0.125);
	    startPositions.push((Math.random() * 0.25) - 0.125);
	    startPositions.push((Math.random() * 0.25) - 0.125);
	    endPositions.push((Math.random() * 2) - 1);
	    endPositions.push((Math.random() * 2) - 1);
	    endPositions.push((Math.random() * 2) - 1);

	    var vertex = new THREE.Vector3();
	    $('#debug-obj').text(obj.object.position.x + " " + obj.object.position.y + " " + obj.object.position.z);
	    vertex.x = Math.random() * obj.object.position.x;
	    vertex.y = Math.random() * obj.object.position.y;
	    vertex.z = Math.random() * obj.object.position.z;
	    geometry.vertices.push(vertex);
	}
	parameters = [[0.90, 1, 1], 3];
	size  = parameters[0][1];
	color = parameters[0][0];
	materials[i] = new THREE.ParticleBasicMaterial({size: size});
	materials[i].color.setHSV(color[0], color[1], color[2]);
	particles = new THREE.ParticleSystem(geometry, materials[i]);
	particles.rotation.x = Math.random() * 6;
	particles.rotation.y = Math.random() * 6;
	particles.rotation.z = Math.random() * 6;
	scene.add(particles);

    }

    /******
     * animate
     ******/
    function animate() {
	requestAnimationFrame(animate);
	render();
	keyboardActions();
	stats.update();
    }

    function render() {
//	theta += 0.2;
	camera.position.x = radius * Math.sin(theta * Math.PI / 360);
	camera.position.y = radius * Math.sin(theta * Math.PI / 360);
	camera.position.z = radius * Math.cos(theta * Math.PI / 360);
	camera.lookAt(scene.position);
	for (i = 0; i < scene.children.length; i ++) {
	    var object = scene.children[i];
	    if (object instanceof THREE.ParticleSystem) {
		$('#debug-other').text(object.rotation.y);
		object.rotation.y += 0.01;
	    }
	}
	var pCount = 500;
	if (particles.length > 0) {
	while(pCount--) {
	    // get the particle
	    var particle = particles.vertices[pCount];
	    
	    // check if we need to reset
	    if(particle.position.y < -200) {
		particle.position.y = 200;
		particle.velocity.y = 0;
	    }
	    
	    // update the velocity
	    particle.velocity.y -= Math.random() * .1;
	    
	    // and the position
	    particle.position.addSelf(particle.velocity);
	}
	particleSystem.geometry.__dirtyVertices = true;
	}
	updateScore();
	renderer.render(scene, camera);
    }

    /******
     * Game housekeeping
     ******/
    function updateScore() {
	tg.time -= clock.getDelta();
	// game over
	if (tg.time < 0) {
	    document.removeEventListener('mousemove', onDocumentMouseMove, false);
	    document.removeEventListener('mousedown', onDocumentMouseDown, false);
	    $('.tg-game-end-destroyed').text(tg.destroyed);
	    $("#play-again-btn" + selectedTime).focus();
	    $gameoverModal.modal("show");
	}
	else {
	    // game on
	    var tm = Math.round(tg.time*100)/100;
	    $('#tg-time').text(tm);
	    $('#tg-destroyed').text(tg.destroyed);
	    if (tg.destroyed > tg.highscore) tg.highscore = tg.destroyed;
	    $('#tg-highscore').text(tg.highscore);
	}
    }
});
