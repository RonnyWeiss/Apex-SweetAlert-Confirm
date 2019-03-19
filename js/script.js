var sweetAlert = (function () {
    "use strict";
    var scriptVersion = "1.4";
    var util = {
        version: "1.0.5",
        isAPEX: function () {
            if (typeof (apex) !== 'undefined') {
                return true;
            } else {
                return false;
            }
        },
        debug: {
            info: function (str) {
                if (util.isAPEX()) {
                    apex.debug.info(str);
                }
            },
            error: function (str) {
                if (util.isAPEX()) {
                    apex.debug.error(str);
                } else {
                    console.error(str);
                }
            }
        },
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
            if (util.isAPEX()) {
                return apex.util.escapeHTML(String(str));
            } else {
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
                    console.error("Error while try to parse targetConfig. Please check your Config JSON. Standard Config will be used.");
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
                console.error('Error while try to merge 2 JSONs into standard JSON if any attribute is missing. Please check your Config JSON. Standard Config will be used.');
                console.error(e);
                finalConfig = srcConfig;
                console.error(finalConfig);
            }
            return finalConfig;
        },
        getItemValue: function (itemName) {
            if (!itemName) {
                return "";
            }

            if (util.isAPEX()) {
                if (apex.item(itemName) && apex.item(itemName).node != false) {
                    return apex.item(itemName).getValue();
                } else {
                    console.error('Please choose a get item. Because the value could not be get from item(' + itemName + ')');
                }
            } else {
                console.error("Error while try to call apex.item" + e);
            }
        }
    };

    return {
        initialize: function (pThis, configItem, udConfigJSON, requiredValue, requiredValueItem, escapeRequired) {

            var stdConfigJSON = {
                "type": "warning",
                "title": "Confirm",
                "text": "If you want to continue please enter %0",
                "showCancelButton": true,
                "input": "text",
                "inputAutoTrim": true,
                "inputPlaceholder": "",
                "requiredValue": "12345",
                "requiredValueHTML": "12345",
                "inputRequiredInfo": "Required",
                "inputNotDesiredValue": "Wrong Input",
                "confirmButtonText": "Submit",
                "confirmButtonIcon": "fa-check",
                "cancelButtonText": "Cancel",
                "cancelButtonIcon": "fa-close",
                "confirmButtonClass": "t-Button t-Button--icon t-Button--iconRight t-Button--hot",
                "cancelButtonClass": "t-Button t-Button--icon t-Button--iconRight",
                "reverseButtons": true,
                "buttonsStyling": false,
                "focusCancel": true,
                "readComparisonValuefromClient": false
            };

            var configJSON = {};
            var srcConfigJSON = (configItem) ? util.getItemValue(configItem).toString() : udConfigJSON;
            configJSON = util.jsonSaveExtend(stdConfigJSON, srcConfigJSON);

            if (requiredValue) {
                var val = (configJSON.readComparisonValuefromClient) ? util.getItemValue(requiredValueItem) : requiredValue;
                configJSON.requiredValue = val;
                configJSON.requiredValueHTML = val;
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

            util.debug.info(configJSON);

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
