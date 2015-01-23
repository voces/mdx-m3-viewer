/**
 * Creates a new AsyncModel.
 *
 * @class The parent of {@link BaseModel}. Takes care of all the asynchronous aspects of loading models.
 * @name AsyncModel
 * @mixes Async
 * @param {string} source The source url that this model will be loaded from.
 * @param {number} id The id of this model.
 * @param {object} textureMap An object with texture path -> absolute urls mapping.
 */
function AsyncModel(source, id, textureMap, context, onError, onProgress, onLoad) {
    var fileType = fileTypeFromPath(source);
    
    // Some MDX files reference other MDX files with the MDL extension for whatever reason (yet more Blizzard laziness).
    // E.g. Ent.mdx references leaves.mdl
    if (fileType === "mdl") {
        fileType = "mdx";
        source = source.replace(".mdl", ".mdx");
    }
    
    this.ready = false;
    this.fileType = fileType;
    this.isModel = true;
    this.id = id;
    this.source = source;

    // All the instances owned by this model
    this.instances = [];

    Async.call(this);

    this.context = context;

    this.onError = onError || function () {};
    this.onProgress = onProgress || function () {};
    this.onLoad = onLoad || function () {};
    
    getRequest(source, AsyncModel.handlers[this.fileType][1], this.setup.bind(this, textureMap || {}), onError.bind(undefined, this), onProgress.bind(undefined, this));
}

AsyncModel.handlers = {};

AsyncModel.prototype = {
  /**
    * Setup a model once it finishes loading.
    *
    * @memberof AsyncModel
    * @instance
    * @param {object} textureMap An object with texture path -> absolute urls mapping.
    * @param {XMLHttpRequestProgressEvent} e The XHR event.
    */
    setup: function (textureMap, e) {
        var status = e.target.status,
            model;

        if (status === 200) {
            model = new AsyncModel.handlers[this.fileType][0](e.target.response, textureMap, this.context, this.onError.bind(undefined, {isModel: 1, source: this.source, id: this.id}));

            if (this.context.debugMode) {
                console.log(model);
            }

            if (model.ready) {
                this.model = model;
                this.ready = true;

                this.runFunctors();

                this.onLoad(this);
            }
        } else {
            this.onError(this, "" + status);
        }
    },
 
  /**
    * Request a model to setup a model instance.
    *
    * @memberof AsyncModel
    * @instance
    * @param {AsyncModelInstance} instance The requester.
    * @param {object} textureMap The requester's texture map.
    */
    setupInstance: function (instance, textureMap) {
        if (this.ready) {
            this.instances.push(instance);

            instance.setup(this.model, textureMap);
        } else {
            this.addFunctor("setupInstance", arguments);
        }
    },
  
  /**
    * Gets the name of a model.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {string} The model's name.
    */
    getName: function () {
        if (this.ready) {
            return this.model.getName();
        }
    },

  /**
    * Gets the source that a model was loaded from.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {string} The model's source.
    */
    getSource: function () {
        return this.source;
    },
  
  /**
    * Gets a model's attachment.
    *
    * @memberof AsyncModel
    * @instance
    * @param {number} id The id of the attachment.
    * @returns {Node} The attachment.
    */
    getAttachment: function (id) {
        if (this.ready) {
            return this.model.getAttachment(id);
        }
    },
  
  /**
    * Gets a model's camera.
    *
    * @memberof AsyncModel
    * @instance
    * @param {number} id The id of the camera.
    * @returns {Camera} The camera.
    */
    getCamera: function (id) {
        if (this.ready) {
            return this.model.getCamera(id);
        }
    },
  
  /**
    * Overrides a texture used by a model.
    *
    * @memberof AsyncModel
    * @instance
    * @param {string} path The texture path that gets overriden.
    * @paran {string} override The new absolute path that will be used.
    */
    overrideTexture: function (path, override) {
        if (this.ready) {
            this.model.overrideTexture(path, override);
        } else {
            this.addFunctor("overrideTexture", arguments);
        }
    },
  
  /**
    * Gets a model's texture map.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {object} The texture map.
    */
    getTextureMap: function () {
        if (this.ready) {
            return this.model.getTextureMap();
        }
    },
  
  /**
    * Gets a model's sequences list.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {array} The list of sequence names.
    */
    getSequences: function () {
        if (this.ready) {
            return this.model.getSequences();
        }
    },
  
  /**
    * Gets a model's attachments list.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {array} The list of attachment names.
    */
    getAttachments: function () {
        if (this.ready) {
            return this.model.getAttachments();
        }
    },
  
  /**
    * Gets a model's bounding shapes list.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {array} The list of bounding shape names.
    */
    getBoundingShapes: function () {
        if (this.ready) {
            return this.model.getBoundingShapes();
        }
    },
  
  /**
    * Gets a model's cameras list.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {array} The list of camera names.
    */
    getCameras: function () {
        if (this.ready) {
            return this.model.getCameras();
        }
    },
  
  /**
    * Gets a model's number of meshes.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {number} The number of meshes.
    */
    getMeshCount: function () {
        if (this.ready) {
            return this.model.getMeshCount();
        }
    },
  
  /**
    * Gets a list of instances that a model owns.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {array} The instance list.
    */
    getInstances: function () {
        if (this.ready) {
            var instances = this.instances,
                instance,
                ids = [],
                i,
                l;

            for (i = 0, l = instances.length; i < l; i++) {
                instance = instances[i];

                if (instance.ready) {
                    ids.push(instance.id);
                }
            }

            return ids;
        }
    },
  
  /**
    * Gets a model's information. This includes most of the getters.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {object} The model information.
    */
    getInfo: function () {
        if (this.ready) {
            var model = this.model;

            return {
                name: model.getName(),
                source: this.source,
                attachments: model.getAttachments(),
                sequences: model.getSequences(),
                cameras: model.getCameras(),
                textureMap: model.getTextureMap(),
                boundingShapes: model.getBoundingShapes(),
                meshCount: model.getMeshCount(),
                instances: this.getInstances()
            };
        }
    },
  
  /**
    * Gets a model's representation as an object that will be converted to JSON.
    *
    * @memberof AsyncModel
    * @instance
    * @returns {object} The JSON representation.
    */
    toJSON: function () {
        var textureMap = {},
            localTextureMap = this.getTextureMap(),
            keys = Object.keys(localTextureMap),
            key,
            i,
            l;

        // This code avoids saving redundant texture paths.
        // Only textures that have been overriden are saved.
        for (i = 0, l = keys.length; i < l; i++) {
            key = keys[i];

            if (urls.mpqFile(key) !== localTextureMap[key]) {
                textureMap[key] = localTextureMap[key];
            }
        }

        return [
            this.id,
            this.source,
            textureMap
        ];
    },
  
    fromJSON: function (object) {

    }
};

mixin(Async.prototype, AsyncModel.prototype);