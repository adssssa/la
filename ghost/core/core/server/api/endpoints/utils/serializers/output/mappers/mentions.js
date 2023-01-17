module.exports = (model) => {
    const json = model.toJSON();

    return {
        id: json.id,
        source: json.source,
        target: json.target,
        timestamp: json.timestamp,
        payload: json.payload,
        resource_id: json.resourceId,
        source_title: json.sourceTitle,
        source_excerpt: json.sourceExcerpt,
        source_favicon: json.sourceFavicon,
        source_featured_image: json.sourceFeauredImage
    };
};
