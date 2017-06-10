/**
 * @class
 * @classdesc This class holds all of the model instances.
 *            It is used to possibly give multiple "views" of the same model.
 *            That is, use the same base model, but have some variations on a per-view basis, hence giving multiple versions of the model.
 *            Mostly used for texture overriding, to allow having multiple instances with different textures.
 * @param {Model} model The model that this view belongs to.
 */
function ModelView(model) {
    /** @member {Model} */
    this.model = model;
    /** @member {ModelInstance[]} */
    this.instances = [];
    /** @member {Bucket[]} */
    this.buckets = [];
    /** @member {map.<Scene, Bucket[]>} */
    this.sceneToBucket = new Map();
}

ModelView.prototype = {
    /** @member {string} */
    get objectType() {
        return "modelview";
    },

    // Get a shallow copy of this view
    getShallowCopy() {

    },

    // Given a shallow copy, copy its contents to this view
    applyShallowCopy(view) {

    },

    // Given another view or shallow view, determine whether they have equal values or not
    equals(view) {
        return true;
    },

    addInstance(instance) {
        // If the instance is already in another view, remove it first.
        // This is always true, except when the instance is created and added to its first view.
        let modelView = instance.modelView;
        if (modelView) {
            modelView.removeInstance(instance);
        }

        // Add the instance
        this.instances.push(instance);
        instance.modelView = this;

        // If it should be rendered, add it to a bucket
        if (instance.rendered && instance.loaded) {
            this.setVisibility(instance, true);
        }
    },

    removeInstance(instance) {
        // If the instance has a bucket, remove it from it.
        if (instance.bucket) {
            this.setVisibility(instance, false);
        }

        instance.modelView = null;

        let instances = this.instances;

        instances.splice(instances.indexOf(instance), 1);

        // If the view now has no instances, ask the model to remove.
        if (instances.length === 0) {
            this.model.removeView(this);
        }
    },

    clear() {
        let instances = this.instances;

        for (let i = 0, l = instances.length; i < l; i++) {
            this.removeInstance(instances[i]);
        }
    },

    detach() {
        if (this.model) {
            this.model.removeView(this);
            this.model = null;

            return true;
        }

        return false;
    },

    // Find a bucket that isn't full. If no bucket is found, add a new bucket and return it.
    getAvailableBucket(scene) {
        let sceneToBucket = this.sceneToBucket;

        if (!sceneToBucket.has(scene)) {
            sceneToBucket.set(scene, []);
        }

        let buckets = sceneToBucket.get(scene);

        for (let i = 0, l = buckets.length; i < l; i++) {
            let bucket = buckets[i];

            if (!bucket.isFull()) {
                return bucket;
            }
        }

        let bucket = new this.model.Handler.Bucket(this);

        buckets.push(bucket);

        this.buckets.push(bucket);

        return bucket;
    },

    sceneChanged(instance, scene) {
        if (instance.scene !== scene) {
            let loaded = this.model.loaded;

            // Remove the instance from its current bucket
            if (instance.scene && loaded) {
                this.setVisibility(instance, false);
            }

            // Set the scene
            instance.scene = scene;

            // If the instance should be rendered, add it to a bucket
            if (instance.rendered && scene && loaded) {
                this.setVisibility(instance, true);
            }
        }
    },

    // Note: this should only be called if the instance has a bucket and a scene
    setVisibility(instance, shouldRender) {
        if (shouldRender) {
            let bucket = this.getAvailableBucket(instance.scene);

            instance.bucket = bucket;
            instance.setSharedData(bucket.addInstance(instance));

            instance.scene.addBucket(bucket);

            return true;
        } else {
            let bucket = instance.bucket;

            bucket.removeInstance(instance);

            // Invalidate whatever shared data this instance used, because it doesn't belong to it anymore.
            instance.bucket = null;
            instance.invalidateSharedData();

            instance.scene.removeBucket(bucket);

            return false;
        } 
    }
};
