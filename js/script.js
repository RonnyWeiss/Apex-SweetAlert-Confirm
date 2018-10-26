var sweetAlert = (function () {
    /*
    https://sweetalert2.github.io/#input-select
    */
    "use strict";
    var scriptVersion = "1.2.2";
    var util = {
        version: "1.0.1",
        escapeHTML: function (str) {
            if (str === null) {
                return null;
            }
            if (typeof str === "undefined") {
                return;
            }
            if (typeof str === "object") {
                try {
                    str = JSON.stringify(str);
                } catch (e) {
                    /*do nothing */
                }
            }
            try {
                return apex.util.escapeHTML(String(str));
            } catch (e) {
                str = String(str);
                return str
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#x27;")
                    .replace(/\//g, "&#x2F;");
            }
        },
        jsonSaveExtend: function (srcConfig, targetConfig) {
            var finalConfig = {};
            /* try to parse config json when string or just set */
            if (typeof targetConfig === 'string') {
                try {
                    targetConfig = JSON.parse(targetConfig);
                } catch (e) {
                    console.error("Error while try to parse udConfigJSON. Please check your Config JSON. Standard Config will be used.");
                    console.error(e);
                    console.error(targetConfig);
                }
            } else {
                finalConfig = targetConfig;
            }
            /* try to merge with standard if any attribute is missing */
            try {
                finalConfig = $.extend(true, srcConfig, targetConfig);
            } catch (e) {
                console.error('Error while try to merge udConfigJSON into Standard JSON if any attribute is missing. Please check your Config JSON. Standard Config will be used.');
                console.error(e);
                finalConfig = srcConfig;
                console.error(finalConfig);
            }
            return finalConfig;
        }
    };

    return {
        initialize: function (pThis, udConfigJSON, requiredValue, escapeRequired) {
            var stdConfigJSON = {
                type: "warning",
                title: "Confirm",
                text: "If you want to continue please enter",
                showCancelButton: true,
                input: "text",
                inputAutoTrim: true,
                inputPlaceholder: "",
                requiredValue: "12345",
                inputRequiredInfo: "Required",
                inputNotDesiredValue: "Wrong Input",
                confirmButtonText: "Submit",
                confirmButtonIcon: "fa-check",
                cancelButtonText: "Cancel",
                cancelButtonIcon: "fa-close",
                confirmButtonClass: "t-Button t-Button--icon t-Button--iconRight t-Button--hot",
                cancelButtonClass: "t-Button t-Button--icon t-Button--iconRight",
                reverseButtons: true,
                buttonsStyling: false,
                focusCancel: true
            };
            var configJSON = {};
            configJSON = util.jsonSaveExtend(stdConfigJSON, udConfigJSON);

            if (requiredValue) {
                configJSON.requiredValue = requiredValue;
                configJSON.requiredValueHTML = requiredValue;
            }

            if (escapeRequired !== false) {
                configJSON.requiredValueHTML = util.escapeHTML(configJSON.requiredValueHTML);
                configJSON.title = util.escapeHTML(configJSON.title);
                configJSON.text = util.escapeHTML(configJSON.text);
                configJSON.inputRequiredInfo = util.escapeHTML(configJSON.inputRequiredInfo);
                configJSON.inputNotDesiredValue = util.escapeHTML(configJSON.inputNotDesiredValue);
                configJSON.confirmButtonText = util.escapeHTML(configJSON.confirmButtonText);
                configJSON.confirmButtonIcon = util.escapeHTML(configJSON.confirmButtonIcon);
                configJSON.cancelButtonText = util.escapeHTML(configJSON.cancelButtonText);
                configJSON.cancelButtonIcon = util.escapeHTML(configJSON.cancelButtonIcon);
            }

            swal({
                title: configJSON.title,
                html: '<span class="t-Region-body">' + configJSON.text.replace("%0", ' <b style="font-weight: bold;">' + configJSON.requiredValueHTML + '</b>') + '</span>',
                type: configJSON.type,
                confirmButtonText: configJSON.confirmButtonText + ' <i class="fa ' + configJSON.confirmButtonIcon + '"></i>',
                cancelButtonText: configJSON.cancelButtonText + ' <i class="fa ' + configJSON.cancelButtonIcon + '"></i>',
                showCancelButton: configJSON.showCancelButton,
                input: configJSON.input,
                inputAutoTrim: configJSON.inputAutoTrim,
                inputPlaceholder: configJSON.inputPlaceholder,
                confirmButtonClass: configJSON.confirmButtonClass,
                cancelButtonClass: configJSON.cancelButtonClass,
                reverseButtons: configJSON.reverseButtons,
                focusCancel: configJSON.focusCancel,
                buttonsStyling: configJSON.buttonsStyling,
                inputValidator: function (value) {
                    return new Promise(function (resolve) {
                        if (value === configJSON.requiredValue) {
                            resolve()
                        } else if (value.length === 0) {
                            resolve(configJSON.inputRequiredInfo)
                        } else {
                            resolve(configJSON.inputNotDesiredValue)
                        }
                    })
                }
            }).then(function (result) {
                if (result.value && result.value === configJSON.requiredValue) {
                    if (apex) {
                        apex.da.resume(pThis.resumeCallback, false);
                    }
                } else {
                    if (apex) {
                        apex.da.resume(pThis.resumeCallback, true);
                    }
                }
            });

        }
    }
})();
