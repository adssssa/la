/**
 * @typedef {object} AttributionResource
 * @prop {string|null} id
 * @prop {string|null} url (absolute URL)
 * @prop {'page'|'post'|'author'|'tag'|'url'} type
 * @prop {string|null} title
 */

class Attribution {
    #urlTranslator;

    /**
     * @param {object} data
     * @param {string|null} [data.id]
     * @param {string|null} [data.url] Relative to subdirectory
     * @param {'page'|'post'|'author'|'tag'|'url'} [data.type]
     */
    constructor({id, url, type}, {urlTranslator}) {
        this.id = id;
        this.url = url;
        this.type = type;

        /**
         * @private
         */
        this.#urlTranslator = urlTranslator;
    }

    /**
     * Convert the instance to a parsed instance with more information about the resource included.
     * It does:
     * - Fetch the resource and add some information about it to the attribution
     * - If the resource exists and have a new url, it updates the url if possible
     * - Returns an absolute URL instead of a relative one
     * @returns {Promise<AttributionResource>}
     */
    async getResource() {
        if (!this.id || this.type === 'url' || !this.type) {
            return {
                id: null,
                type: 'url',
                url: this.#urlTranslator.relativeToAbsolute(this.url),
                title: this.url
            };
        }

        const resource = await this.#urlTranslator.getResourceById(this.id, this.type, {absolute: true});

        if (resource) {
            return resource;
        }

        return {
            id: null,
            type: 'url',
            url: this.#urlTranslator.relativeToAbsolute(this.url),
            title: this.url
        };
    }
}

/**
 * Convert a UrlHistory to an attribution object
 */
class AttributionBuilder {
    /**
     */
    constructor({urlTranslator}) {
        this.urlTranslator = urlTranslator;
    }

    /**
     * Creates an Attribution object with the dependencies injected
     */
    build({id, url, type}) {
        return new Attribution({
            id,
            url,
            type
        }, {urlTranslator: this.urlTranslator});
    }

    /**
     * Last Post Algorithm™️
     * @param {UrlHistory} history
     * @returns {Attribution}
     */
    getAttribution(history) {
        if (history.length === 0) {
            return this.build({
                id: null,
                url: null,
                type: null
            });
        }

        // Convert history to subdirectory relative (instead of root relative)
        // Note: this is ordered from recent to oldest!
        const subdirectoryRelativeHistory = [];
        for (const item of history) {
            subdirectoryRelativeHistory.push({
                ...item,
                path: this.urlTranslator.stripSubdirectoryFromPath(item.path)
            });
        }

        // TODO: if something is wrong with the attribution script, and it isn't loading
        // we might get out of date URLs
        // so we need to check the time of each item and ignore items that are older than 24u here!

        // Start at the end. Return the first post we find
        for (const item of subdirectoryRelativeHistory) {
            const typeId = this.urlTranslator.getTypeAndId(item.path);

            if (typeId && typeId.type === 'post') {
                return this.build({
                    url: item.path,
                    ...typeId
                });
            }
        }

        // No post found?
        // Try page or tag or author
        for (const item of subdirectoryRelativeHistory) {
            const typeId = this.urlTranslator.getTypeAndId(item.path);

            if (typeId) {
                return this.build({
                    url: item.path,
                    ...typeId
                });
            }
        }

        // Default to last URL
        // In the future we might decide to exclude certain URLs, that can happen here
        return this.build({
            id: null,
            url: subdirectoryRelativeHistory[0].path,
            type: 'url'
        });
    }
}

module.exports = AttributionBuilder;
