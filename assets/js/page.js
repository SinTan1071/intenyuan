/**
 * Shim for "fixing" IE's lack of support (IE < 9) for applying slice
 * on host objects like NamedNodeMap, NodeList, and HTMLCollection
 * (technically, since host objects have been implementation-dependent,
 * at least before ES6, IE hasn't needed to work this way).
 * Also works on strings, fixes IE < 9 to allow an explicit undefined
 * for the 2nd argument (as in Firefox), and prevents errors when
 * called on other DOM objects.
 */
(function () {
    'use strict';
    var _slice = Array.prototype.slice;

    try {
        // Can't be used with DOM elements in IE < 9
        _slice.call(document.documentElement);
    } catch (e) { // Fails in IE < 9
        // This will work for genuine arrays, array-like objects,
        // NamedNodeMap (attributes, entities, notations),
        // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
        // and will not fail on other DOM objects (as do DOM elements in IE < 9)
        Array.prototype.slice = function(begin, end) {
            // IE < 9 gets unhappy with an undefined end argument
            end = (typeof end !== 'undefined') ? end : this.length;

            // For native Array objects, we use the native slice function
            if (Object.prototype.toString.call(this) === '[object Array]'){
                return _slice.call(this, begin, end);
            }

            // For array like object we handle it ourselves.
            var i, cloned = [],
                size, len = this.length;

            // Handle negative value for "begin"
            var start = begin || 0;
            start = (start >= 0) ? start : Math.max(0, len + start);

            // Handle negative value for "end"
            var upTo = (typeof end == 'number') ? Math.min(end, len) : len;
            if (end < 0) {
                upTo = len + end;
            }

            // Actual expected size of the slice
            size = upTo - start;

            if (size > 0) {
                cloned = new Array(size);
                if (this.charAt) {
                    for (i = 0; i < size; i++) {
                        cloned[i] = this.charAt(start + i);
                    }
                } else {
                    for (i = 0; i < size; i++) {
                        cloned[i] = this[start + i];
                    }
                }
            }

            return cloned;
        };
    }
}());

function addClass(el, className) {
    el.className += ' ' + className;
}

var matches = function(el, selector) {
    var _matches = (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector);

    if (_matches) {
        return _matches.call(el, selector);
    } else {
        var nodes = el.parentNode.querySelectorAll(selector);
        for (var i = nodes.length; i--;) {
            if (nodes[i] === el)
                return true;
        }
        return false;
    }
};

function getParentNode(init, options) {
    var parnode = init;
    if (!matches(parnode, options.loadClassName)) {
        return getParentNode(parnode.parentNode, options);
    } else {
        return parnode;
    }
}

function addError(selector, options) {
    var imgdoms = document.querySelectorAll(selector);
    var imgs =  Array.prototype.slice.call(imgdoms);
    var parnode =  {};

    for (var i = 0; i < imgs.length; i++) {
        (function(index) {
            imgs[index].onerror = function() {
                addClass(imgs[index], "error");
                parnode = imgs[index].parentNode;
                addClass(parnode, "error-container");
            };
            if (options && options.loadClassName) {
                var init = imgs[index];
                init.onload = function() {
                    addClass(init, "load");
                    addClass(getParentNode(init, options), "load-container");
                };
            }

            imgs[index].src = imgs[index].getAttribute("data-src");
        })(i);
    }
}
