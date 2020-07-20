var sweetAlert = (function () {
    "use strict";
    var util = {
        /**********************************************************************************
         ** required functions 
         *********************************************************************************/
        featureInfo: {
            name: "sweetAlert",
            info: {
                scriptVersion: "1.5",
                utilVersion: "1.3.4",
                url: "https://github.com/RonnyWeiss",
                license: "MIT"
            }
        },
        isDefinedAndNotNull: function (pInput) {
            if (typeof pInput !== "undefined" && pInput !== null && pInput != "") {
                return true;
            } else {
                return false;
            }
        },
        isAPEX: function () {
            if (typeof (apex) !== 'undefined') {
                return true;
            } else {
                return false;
            }
        },
        varType: function (pObj) {
            if (typeof pObj === "object") {
                var arrayConstructor = [].constructor;
                var objectConstructor = ({}).constructor;
                if (pObj.constructor === arrayConstructor) {
                    return "array";
                }
                if (pObj.constructor === objectConstructor) {
                    return "json";
                }
            } else {
                return typeof pObj;
            }
        },
        debug: {
            info: function () {
                if (util.isAPEX()) {
                    var i = 0;
                    var arr = [];
                    for (var prop in arguments) {
                        arr[i] = arguments[prop];
                        i++;
                    }
                    arr.push(util.featureInfo);
                    apex.debug.info.apply(this, arr);
                }
            },
            error: function () {
                var i = 0;
                var arr = [];
                for (var prop in arguments) {
                    arr[i] = arguments[prop];
                    i++;
                }
                arr.push(util.featureInfo);
                if (util.isAPEX()) {
                    apex.debug.error.apply(this, arr);
                } else {
                    console.error.apply(this, arr);
                }
            }
        },
        /**********************************************************************************
         ** optinal functions 
         *********************************************************************************/
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
            var tmpJSON = {};
            /* try to parse config json when string or just set */
            if (typeof targetConfig === 'string') {
                try {
                    tmpJSON = JSON.parse(targetConfig);
                } catch (e) {
                    util.debug.error({
                        "msg": "Error while try to parse targetConfig. Please check your Config JSON. Standard Config will be used.",
                        "err": e,
                        "targetConfig": targetConfig
                    });
                }
            } else {
                tmpJSON = $.extend(true, {}, targetConfig);
            }
            /* try to merge with standard if any attribute is missing */
            try {
                finalConfig = $.extend(true, {}, srcConfig, tmpJSON);
            } catch (e) {
                finalConfig = $.extend(true, {}, srcConfig);
                util.debug.error({
                    "msg": "Error while try to merge 2 JSONs into standard JSON if any attribute is missing. Please check your Config JSON. Standard Config will be used.",
                    "err": e,
                    "finalConfig": finalConfig
                });
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
                    util.debug.error("Please choose a get item. Because the value could not be get from item(" + itemName + ")");
                }
            } else {
                util.debug.error("Error while try to call apex.item");
            }
        },
        cutString: function (text, textLength) {
            try {
                if (textLength < 0) return text;
                else {
                    return (text.length > textLength) ?
                        text.substring(0, textLength - 3) + "..." :
                        text
                }
            } catch (e) {
                return text;
            }
        },
        copy2Clipboard: function (pElement, pText, pShowSuccessMsg) {
            var $temp = $("<input>");
            $("body").append($temp);
            var str = $(pElement).text() || $(pElement).val();
            $temp.val(str).select();
            document.execCommand("copy");
            $temp.remove();

            if (pShowSuccessMsg && util.isDefinedAndNotNull(str) && util.isAPEX()) {
                apex.message.showPageSuccess(pText.replace("%0", pText));
                setTimeout(function () {
                    apex.message.hidePageSuccess();
                }, 1500);
            }
        }
    };

    return {
        initialize: function (pThis, configItem, udConfigJSON, requiredValue, requiredValueItem, escapeRequired) {

            util.debug.info({
                "pThis": pThis,
                "configItem": configItem,
                "udConfigJSON": udConfigJSON,
                "requiredValue": requiredValue,
                "requiredValueItem": requiredValueItem,
                "escapeRequired": escapeRequired
            });

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

            util.debug.info({
                "module": "initialize",
                "configJSON": configJSON
            });

            var b = $("<b></b>");
            b.addClass("swal2-c-text");
            b.html(configJSON.requiredValueHTML);

            var bStr = $("<div></div>").append(b.clone()).html();

            var span = $("<span></span>");
            span.addClass("t-Region-body");
            span.html(configJSON.text.replace("%0", bStr));

            var htmlStr = $("<div></div>").append(span.clone()).html();
            swal({
                title: configJSON.title,
                html: htmlStr,
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

            $(".swal2-c-text").on("click", function () {
                var mCpSpan = $("<span></span>");
                var cpSpan = $("<span></span>");
                cpSpan.addClass("fa fa-copy");
                mCpSpan.append(cpSpan);
                mCpSpan.append(" " + util.cutString(configJSON.requiredValueHTML, 15));
                util.copy2Clipboard(b, $("<div></div>").append(mCpSpan.clone()).html());
            });
        }
    }
})();
