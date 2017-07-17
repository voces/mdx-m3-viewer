import TextureHandler from '../../src/texturehandler';

const Blp = {
    get extension() {
        return ".blp";
    },

    get Constructor() {
        return BlpTexture;
    },

    get binaryFormat() {
        return true;
    }
};

require('../../src/common').mix(Blp, TextureHandler);

export default Blp;
