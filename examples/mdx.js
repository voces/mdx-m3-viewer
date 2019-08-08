
/* global ModelViewer, setupCamera, handlers */

// Don't forget to check common.js for the library exports!

const canvas = document.getElementById( "canvas" );

canvas.width = 800;
canvas.height = 600;

// Create the viewer!
const viewer = new ModelViewer.viewer.ModelViewer( canvas );

// Create a new scene. Each scene has its own camera, and a list of things to render.
const scene = viewer.addScene();

// Check camera.js!
setupCamera( scene );

// Events.
viewer.on( "loadstart", target => console.log( target ) );
viewer.on( "load", target => console.log( target ) );
viewer.on( "loadend", target => console.log( target ) );
viewer.on( "error", ( target, error, reason ) => console.log( target, error, reason ) );

// Add the MDX handler.
viewer.addHandler( handlers.mdx );

// A path solver is used for every load call.
// The purpose of a path solver is to transform local paths to either of 1) A server fetch, or 2) A local load.
// A path solver must return the resource source, file extension, and whether it's a server fetch.
// The above are served as an array of [src, extension, serverFetch]
// This pathsolver returns the path prepended by 'resources/', to make the paths you supply to load calls shorter.
// It returns the extension of the path directly (assuming it's an actual file path!).
// Lastly, it says that this path is a server fetch.
// If the solver returns anything false-like for the third element, there will be no server fetch, and src will be directly sent to the implementation.
// This can be used if you want in-memory loads (e.g. see the W3x handler's path solver, which handles both server fetches and local loads for Warcraft 3 maps).
function pathSolver( path ) {

	return [ "resources/" + path, path.substr( path.lastIndexOf( "." ) ), true ];

}

// Load our MDX model!
const model = viewer.load( "SmileyGW_004.mdx", pathSolver );

// Create an instance of this model.
const instance = model.addInstance();

// Set the instance's scene.
// Equivalent to scene.addInstance(instance)
instance.setScene( scene );

// Want to run the first animation.
// -1 for static mode.
instance.setSequence( 1 );

// Tell the instance to loop animations forever.
// This overrides the setting in the model itself.
instance.setSequenceLoopMode( 2 );

// Let's create another instance and do other stuff with it.
const instance2 = model.addInstance();
instance2.setScene( scene );
instance2.setSequence( 0 );
instance2.setSequenceLoopMode( 2 );
instance2.move( [ 100, 100, 0 ] );
instance2.uniformScale( 0.5 );

// And a third one.
const instance3 = model.addInstance();
instance3.setScene( scene );
instance3.setSequence( 2 );
instance3.setSequenceLoopMode( 2 );
instance3.move( [ - 100, - 100, 0 ] );

// The viewer has the update(), startFrame(), render(), and updateAndRender() functions.
// Generally speaking, you will want a simple never ending loop like the one that follows, but who knows. The control is in your hands.
( function step() {

	requestAnimationFrame( step );

	viewer.updateAndRender();

}() );
