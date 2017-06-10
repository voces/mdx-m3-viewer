// Load a model and create an instance.
UnitTester.addTest("m3-load", (viewer, scene) => {
    let camera = scene.camera;

    camera.resetTransformation();
    camera.move([0, -30, -90]);

    let model = viewer.load("Assets/Units/Zerg/Baneling/Baneling.m3", sc2Solver),
        instance = model.addInstance();

    scene.addInstance(instance);
});

// Get to a specific frame of animation in a sequence.
UnitTester.addTest("m3-sequence", (viewer, scene) => {
    let camera = scene.camera;

    camera.resetTransformation();
    camera.move([0, -30, -90]);

    let model = viewer.load("Assets/Units/Zerg/Baneling/Baneling.m3", sc2Solver),
        instance = model.addInstance();

    scene.addInstance(instance);

    instance.setSequence(0);
    instance.frame = 800;
});

// Change team colors.
UnitTester.addTest("m3-team-color", (viewer, scene) => {
    let camera = scene.camera;

    camera.resetTransformation();
    camera.move([0, -30, -90]);

    let model = viewer.load("Assets/Units/Zerg/Baneling/Baneling.m3", sc2Solver),
        instance = model.addInstance();

    scene.addInstance(instance);

    instance.setTeamColor(1);
});

// Change tint colors.
UnitTester.addTest("m3-tint-color", (viewer, scene) => {
    let camera = scene.camera;

    camera.resetTransformation();
    camera.move([0, -30, -90]);

    let model = viewer.load("Assets/Units/Zerg/Baneling/Baneling.m3", sc2Solver),
        instance = model.addInstance();

    scene.addInstance(instance);

    instance.setTintColor([255, 0, 0]);
});
