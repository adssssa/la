const Promise = require('bluebird');
const common = require('../common');
const fs = require('fs-extra');

/**
 * @NOTE: Sharp cannot operate on the same image path, that's why we have to use in & out paths.
 *
 * We currently can't enable compression or having more config options, because of
 * https://github.com/lovell/sharp/issues/1360.
 */

const unsafeProcess = (options = {}) => {
    return fs.readFile(options.in)
        .catch()
        .then((data) => {
            return unsafeResizeImage(data, {
                width: options.width
            });
        })
        .then((data) => {
            return fs.writeFile(options.out, data);
        });
};

const unsafeResizeImage = (originalBuffer, {width, height} = {}) => {
    const sharp = require('sharp');
    return sharp(originalBuffer)
        .resize(width, height, {
            // CASE: dont make the image bigger than it was
            withoutEnlargement: true
        })
        // CASE: Automatically remove metadata and rotate based on the orientation.
        .rotate()
        .toBuffer()
        .then((resizedBuffer) => {
            return resizedBuffer.length < originalBuffer.length ? resizedBuffer : originalBuffer;
        });
};

const makeSafe = fn => (...args) => {
    try {
        require('sharp');
    } catch (err) {
        return Promise.reject(new common.errors.InternalServerError({
            message: 'Sharp wasn\'t installed',
            code: 'SHARP_INSTALLATION',
            err: err
        }));
    }
    return fn(...args).catch((err) => {
        throw new common.errors.InternalServerError({
            message: 'Unable to manipulate image.',
            err: err,
            code: 'IMAGE_PROCESSING'
        });
    });
};

module.exports.process = makeSafe(unsafeProcess);
module.exports.resizeImage = makeSafe(unsafeResizeImage);
