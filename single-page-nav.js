/**
 * SinglePageNav - A throwback to a simpler time
 * An extremely basic 'single page app' navigation framework.
 *
 * @param spec - must contain two properties:
 *      parentElement: the parent element of all page sections
 *      backElement: the element to use as a 'back' button
 */
var singlePageNav = function (spec) {

    var parentElement;
    var backElement;
    var currentView;
    var backHistory;
    var pages;
    var transitionStyle;
    var pageTransitions = {};

    var that = {};


    /**
     * Go back to the previous page in the history
     */
    var goBack = function () {
        var backToView = backHistory.pop();
        hideViewReverse(currentView);
        showViewReverse(backToView);

        // Update currentView
        currentView = backToView;

        // Hide back button if we're at the top
        if (backHistory.length === 0) {
            utils.addClass(backElement, "hidden");
        }
    };
    that.goBack = goBack;


    /**
     * Follow `link` to the given page
     */
    var followLink = function (link) {
        var nextView = getPageById(link);

        backHistory.push(currentView);
        hideView(currentView);
        showView(nextView);

        // Update currentView
        currentView = nextView;

        // Show the back button
        utils.removeClass(backElement, "hidden");
    };
    that.followLink = followLink;


    /**
     * Registers a page transition function
     * @param name: the name for the funciton
     * @param fn: the function to perform the transition
     */
    var registerPageTransition = function(name, fn) {
        pageTransitions[name] = fn;
    }

    var hideView = function (viewElement, _reverse) {
        var direction = _reverse ? "go-right" : "go-left";
        getTransitionFunction()(viewElement, direction, false);
    };

    var showView = function (viewElement, _reverse) {
        var direction = _reverse ? "go-left" : "go-right";
        getTransitionFunction()(viewElement, direction, true);
    };

    var showViewReverse = function(viewElement) {
        showView(viewElement, true);
    };

    var hideViewReverse = function(viewElement) {
        hideView(viewElement, true);
    };

    var getPageById = function(id) {
        return pages[id];
    };

    var getTransitionFunction = function (name) {
        name = name || transitionStyle;

        var func = pageTransitions[name];
        if (!func) {
            return pageTransitions.none;
        }
        return func;
    };


    /*  default page transition functions */

    /**
     * Swipe-based page transiton
     */
    registerPageTransition("swipe", function (viewElement, direction, entering) {
        utils.addClass(viewElement, "slide");
        if (entering) {
            utils.addClass(viewElement, direction);
            document.getElementById("content-wrapper").appendChild(viewElement);
        }

        viewElement.addEventListener("webkitTransitionEnd", finishSlide);
        viewElement.offsetWidth; //force a reflow so transitions work
        if (entering) {
            utils.removeClass(viewElement, direction);
        } else {
            utils.addClass(viewElement, direction);
        }

        function finishSlide () {
            viewElement.removeEventListener("webkitTransitionEnd", finishSlide);
            utils.removeClass(viewElement, "slide");
            utils.removeClass(viewElement, direction);
            if (entering) {
                utils.addClass(viewElement, "current-view");
            } else {
                utils.removeClass(viewElement, "current-view");
                viewElement.parentNode.removeChild(viewElement);
            }
        }
    });

    /**
     * No animation, default page transition
     */
    registerPageTransition("none", function (viewElement, direction, entering) {
        if (entering) {
            document.getElementById("content-wrapper").appendChild(viewElement);
        } else {
            viewElement.parentNode.removeChild(viewElement);
        }
    });


    /**
     * Utilities - helpers for dealing with the DOM in modern browsers
     * Code influenced by http://net.tutsplus.com/tutorials/javascript-ajax/from-jquery-to-javascript-a-reference/
     */
    var utils = {
        addClass: function (el, cl) {
            el.className += ' ' + cl;
        },
        removeClass: function (el, cl) {
            var regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)');
            el.className = el.className.replace(regex, ' ');
        },
        hasClass: function (el, cl) {
            var regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)');
            return !!el.className.match(regex);
        },
        toggleClass: function (el, cl) {
            this.hasClass(el, cl) ? this.removeClass(el, cl) : this.addClass(el, cl);
        },
        getDataHref: function(el) {
            if(el){
                var dataHref = el.getAttribute('data-href');
                if(dataHref && dataHref.length && dataHref!== "#.html"){
                    return dataHref;
                }
                else if(el.nodeName !== 'HTML'){
                    return this.getDataHref(el.parentNode);
                } 
            }
            return null;                                
        },
        /* based on underscore.js _.defaults function */
        applyDefaults: function(obj) {
            for (var i=1; i<arguments.length; ++i) {
                var source = arguments[i];
                if (source) {
                    for (var prop in source) {
                        if (obj[prop] === void 0) obj[prop] = source[prop];
                    }
                }
            }
            return obj;
        }
    };


    var initialize = function (spec) {

        // Construct nav below this object
        parentElement = spec.parentElement;
        backElement = spec.backElement;

        backHistory = [];

        currentView = document.querySelector(".current-view");

        pages = {};

        var foundPages = document.querySelectorAll(".page-wrapper");
        for (var i=0; i<foundPages.length; ++i) {
            var page = foundPages[i];
            if (utils.hasClass(page, "hidden")) {
                utils.removeClass(page, "hidden");
                page.parentNode.removeChild(page);
            }
            pages[page.id] = page;
        }

        // add event listeners to all links
        document.addEventListener('click', function (e) {
            var target = e.target || e.srcElement;
            var dataHref = utils.getDataHref(target);
            if (dataHref) {
                e.preventDefault();
                // Display the next view
                followLink(dataHref);
            }
        }, false);

        // Handle back events
        backElement.addEventListener('click', function (e) {
            var target = e.target || e.srcElement;
            if ( target && target.nodeName === 'A' ) {
                goBack();
            }
        }, false);

        transitionStyle = spec.transitionStyle;
    };

    /**
     * Initialize singlePageNav with spec
     */ 
    spec.transitionStyle = spec.transitionStyle || 'swipe';
    initialize(spec);

    return that;
};