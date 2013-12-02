mdx-m3-viewer
=============

A WebGL viewer for MDX and M3 files used by the games Warcraft 3 and Starcraft 2 respectively.

Running compiler.rb creates a standalone minified JavaScript file that can be included to any HTML page.
To minify the GLSL shaders, use [glsl-minifier](https://github.com/flowtsohg/glsl-minifier).
To minify the resulting JavaScript, use the [Google Closure compiler](https://developers.google.com/closure/compiler/).
Both options can be disabled or enabled in compiler.rb.

Note: you must run compiler.rb to get a working file, since there are broken files that must be concatenated to form valid JavaScript files (look at before.js and after.js files to understand what I mean).

A live version can be seen on [Hiveworkshop](http://www.hiveworkshop.com) for which this viewer was made.

Usage: `new Viewer(args)`

args is an Object with the following properties:

    canvas - A <canvas> element
    onprogress - A function callback. Progress messages will be sent to it. Optional.
    onload - A function callback. Called if everything went ok, and the model was loaded successfully. Optional.
    onerror - A function callback. Called if there was an error somewhere.
    MODEL_ID - The model ID. Used by the Hiveworkshop.
    MODEL_PATH - A path to a MDX or M3 file to use.
    MPQ_PATH - A path to a MDX or M3 file in the Warcraft 3 / Starcraft 2 MPQs. Used by the Hiveworkshop.
    DEBUG_MODE - If exists and true, the viewer will log the Parser and Model structures. Optional.
  
One of MODEL_ID / MODEL_PATH / MPQ_PATH has to be defined.
If more than one is defined, the order of preference is MODEL_PATH > MPQ_PATH > MODEL_ID.

The API of the viewer is as follows:

    getCameras() - Returns the cameras the object owns, or an empty array if there are no cameras.
    getCamera() - Returns the index of the currently selected camera, or -1 if there is no selected camera.
    setCamera(index) - Sets the selected camera to index. -1 to have no camera selected.
    resetCamera() - Resets the selected camera to -1 and the rotation, zoom and movement.
    getAnimations() - Returns a list of the model animations, or an empty array if there are no animations.
    playAnimation(index) - Selects the index'th animation to play.
    stopAnimation() - Same as playAnimation(0).
    setAnimationSpeed(speed) - Selects the animation speed. 1 for default, 2 for double, 0.5 for half, and so on.
    setLoopingMode(mode) - Sets the animation looping mode. 0 for default, 1 for never, 2 for always.
    setTeamColor(index) - Sets the team color of the index'th player using Warcraft 3 team colors.
    setWorld(mode) - Sets the world mode. 0 for none, 1 for sky, 2 for ground, 3 for water.
    showLights(mode) - Sets the light mode. Not implemented yet.
    showShapes(mode) - Sets the collision shapes mode. True to show them, false to not.
    resize(x, y) - Resize the context viewport.
    move(x, y) - Move the model around.
    zoom(x) - Zoom by x. 1 does nothing, 2 makes everything twice the size, and so on.
    rotate(y, x) - Rotate by y and x on their respective axes.
