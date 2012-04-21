$(function() {
    var container, stats;
    var camera, scene, projector, renderer;

    var mouse = { x: 0, y: 0 }, INTERSECTED;

    init();
    animate();

    function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( 0, 300, 500 );
	scene.add( camera );

	var light = new THREE.DirectionalLight( 0xffffff, 2 );
	light.position.set( 1, 1, 1 ).normalize();
	scene.add( light );

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( -1, -1, -1 ).normalize();
	scene.add( light );

	var geometry = new THREE.SphereGeometry( 10, 16, 16 );

	for ( var i = 0; i < 1000; i ++ ) {

	    var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

	    object.position.x = Math.random() * 800 - 400;
	    object.position.y = Math.random() * 800 - 400;
	    object.position.z = Math.random() * 800 - 400;

	    object.rotation.x = ( Math.random() * 360 ) * Math.PI / 180;
	    object.rotation.y = ( Math.random() * 360 ) * Math.PI / 180;
	    object.rotation.z = ( Math.random() * 360 ) * Math.PI / 180;

/*	    object.scale.x = Math.random() * 2 + 1;
	    object.scale.y = Math.random() * 2 + 1;
	    object.scale.z = Math.random() * 2 + 1;
*/
	    scene.add( object );

	}

	projector = new THREE.Projector();

	renderer = new THREE.WebGLRenderer();
	renderer.sortObjects = false;
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.appendChild(renderer.domElement);

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    }

    function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    }

    //

    function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

    }

    var radius = 100;
    var theta = 0;

    function render() {

	theta += 0.2;

	camera.position.x = radius * Math.sin( theta * Math.PI / 360 );
	camera.position.y = radius * Math.sin( theta * Math.PI / 360 );
	camera.position.z = radius * Math.cos( theta * Math.PI / 360 );

	camera.lookAt( scene.position );

	// find intersections

	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObjects( scene.children );

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

	renderer.render( scene, camera );

    }
});