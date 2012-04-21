$(function() {
    // Various vars used for the gameplay
    // universe
    var container, stats;
    var camera, scene, projector, renderer, objects;

    // animation
    var isAnimated = true;

    // light
    var light, lightObject;

    // mouse move and down
    var mouse = { x: 0, y: 0 }, INTERSECTED, isUserInteracting = false;

    // keyboard
    var keyboard = new THREEkb.KeyboardState(), shown = false;

    // game
    var turn = 0
    , psizes = {"tiny":0,"small":1.4,"medium":1.6,"large":1.9,"huge":2.3}
    , cplanet = {"name":"","size":0,"population":0,"belief":0};

    // modals
    var $pregameModal = $('#pregameModal')
    , $planetModal = $('#planetModal');

    begin();

    /*********
     * MODALS
     *********/
    $pregameModal.find(".btn-primary").click(function(e){
	$pregameModal.modal("hide");
	init();
	animate();
	e.preventDefault();
    });
    $planetModal.find(".nothing").click(function(e){
	$planetModal.modal("hide");
	e.preventDefault();
    }).end().find(".btn-primary").click(function(e){
	$planetModal.modal("hide");
	e.preventDefault();
    });

    /*******
     * Initialization Functions
     *******/
    function begin() {
	$pregameModal.modal();
    }
    function init() {
	// event listeners
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );

	container = document.createElement('div');
	document.body.appendChild(container);

	// scene size and camera attributes
	var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight,
	VIEW_ANGLE = 45,
	ASPECT = WIDTH / HEIGHT,
	NEAR = 1,
	FAR = 10000;

	// scene and camera
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE,ASPECT,NEAR,FAR);
	camera.position.set(0, 300, 900);
	scene.add(camera);

	// projector
	projector = new THREE.Projector();

	// WebGL renderer
	renderer = new THREE.WebGLRenderer();
	renderer.sortObjects = false;
	renderer.setSize(WIDTH, HEIGHT);
	container.appendChild( renderer.domElement );

	// objects (X worlds)
	objects = [];
	// create a new mesh with sphere geometry
	// set up the sphere vars
	var radius = 10, segments = 16, rings = 16;
	var geometry = new THREE.SphereGeometry(radius, segments, rings);
	for (var i=0; i < 10; i++) {
	    var object = new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff}));
	    object.name = {"name":"object"+i,"population":i+1,"belief":1}
	    object.position.set(-i*65-100,0,Math.random()*i*150)
	    var scale = Math.random() * 1.5 + 1
	    object.scale.set(scale,scale,scale);
	    scene.add(object);
	    objects.push(object);
	}

	// light
	lightObject = new THREE.Mesh(new THREE.SphereGeometry(60,32,32),
				     new THREE.MeshBasicMaterial({color: 0xffffff}));
	lightObject.position.set(0,0,0)
	scene.add(lightObject);
	light = new THREE.PointLight( 0xffffff, 1 );
	scene.add(light);

	// stats
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild(stats.domElement);
    }

    /******
     * animate
     ******/
    function animate() {
	requestAnimationFrame( animate );
	render();
	keyboardActions();
	stats.update();
    }

    /******
     * render (draw) everything
     ******/
    function render() {
	var timer = 0.0001 * Date.now();

	// rotate each planet itself
	for ( var i = 0, l = objects.length; i < l; i ++ ) {
	    var object = objects[i];
	    object.rotation.x += 0.01;
	    object.rotation.y += 0.005;
	}

	// poor man's rotation... 
	// TODO: make this rotate the actual planets and not the camera
	camera.position.x = Math.cos(timer) * 1000;
	camera.position.z = Math.sin(timer) * 1000;
	camera.lookAt( scene.position );

	// find intersections for mouse over
	/*
	  var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	  projector.unprojectVector( vector, camera );
	  var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
	  var intersects = ray.intersectObjects( objects );
	  if ( intersects.length > 0 ) {
	  if ( INTERSECTED != intersects[ 0 ].object ) {
	  if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
	  INTERSECTED = intersects[ 0 ].object;
	  INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
	  INTERSECTED.material.color.setHex( 0xff0000 );
	  }
	  } else {
	  if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
	  INTERSECTED = null;
	  }
	*/
	// Move light to ensure all objects are properly lit
	light.position.x = lightObject.position.x;
	light.position.y = lightObject.position.y;
	light.position.z = lightObject.position.z;
	// Render!
	renderer.render( scene, camera );
    }

    /******
     * Mouse functionality
     ******/
    function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    function onDocumentMouseDown( event ) {
	event.preventDefault();
	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );
	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
	var intersects = ray.intersectObjects( objects );
	if ( intersects.length > 0 ) {
	    var obj = intersects[0].object;
	    planetModal(obj);
	}
    }

    /******
     * Keyboard functionality
     *****/
    function keyboardActions() {
	if(keyboard.pressed("shift+H")) {
	    if (shown == false) {
		alert('test');
		shown = true;
	    }
	}
    }

    /******
     * Planet data
     ******/
    function setPlanetData(planet) {
	cplanet.name = planet.name.name;
	cplanet.size = planetSize(planet.scale.x);
	cplanet.population = planet.name.population;
	cplanet.belief = planet.name.belief;
	$planetModal.find('.planet-name').text(cplanet.name)
	$planetModal.find('.planet-size').text(cplanet.size)
	$planetModal.find('.planet-population').text(cplanet.population)
	$planetModal.find('.planet-belief').text(cplanet.belief)
    }

    function planetModal(planet) {
	setPlanetData(planet);
	$('#planetModal').modal()
    }

    function planetSize(size) {
	if (size < psizes.small) {
	    return "tiny";
	} else if (size < psizes.medium) {
	    return "small";
	} else if (size < psizes.large) {
	    return "medium";
	} else if (size < psizes.huge) {
	    return "large";
	} else if (size >= psizes.huge) {
	    return "huge";
	}
    }

});
