import EmbeddedRelationAdapter from 'ghost/adapters/embedded-relation-adapter';

export default EmbeddedRelationAdapter.extend({

    shouldBackgroundReloadRecord: function () {
        return false;
    }

 });
