(function () {
    var ghostdown = function () {
        return [
            // ![] image syntax
            {
                type: 'lang',
                filter: function (text) {
                    var defRegex = /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/gim,
                        match,
                        defUrls = {};

                    while ((match = defRegex.exec(text)) !== null) {
                        defUrls[match[1]] = match;
                    }

                    return text.replace(/^!(?:\[([^\n\]]*)\])(?:\[([^\n\]]*)\]|\(([^\n\]]*)\))?$/gim, function (match, alt, id, src) {
                        var result = "";

                        /* regex from isURL in node-validator. Yum! */
                        if (src && src.match(/^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i)) {
                            result = '<img class="js-upload-target" src="' + src + '"/>';
                        } else if (id && defUrls.hasOwnProperty(id)) {
                            result = '<img class="js-upload-target" src="' + defUrls[id][2] + '"/>';
                        }
                        return '<section  class="js-drop-zone image-uploader">' + result +
                               '<div class="description">Add image of <strong>' + alt + '</strong></div>' +
                               '<input data-url="upload" class="js-fileupload main fileupload" type="file" name="uploadimage">' +
                               '</section>';
                    });
                }
            }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) {
        window.Showdown.extensions.ghostdown = ghostdown;
    }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = ghostdown;
}());