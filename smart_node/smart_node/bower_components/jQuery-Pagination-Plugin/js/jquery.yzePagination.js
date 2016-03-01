/**
 * jQuery pagination plugin v1.3.2
 * https://github.com/youngdze/jQuery-Pagination-Plugin
 *
 * Copyright (c) 2014 Justin Young
 * Licensed under the MIT License.
 * 
 */
;
(function($, window, document, undefined) {

    "use strict";

    // generate pagination quene
    var Pagination = function(total, currentPage) {
        this.total = total;
        this.currentPage = currentPage;
    };

    Pagination.prototype.generate = function() {

        // validate if both are positive integers
        function isInteger(data) {
            var exgInt = /^\+?(0|[1-9])\d*$/;
            return exgInt.test(data);
        }

        try {
            if (!(isInteger(this.total) || isInteger(this.currentPage))) {
                throw "positive integers required";
            }

            if (this.currentPage > this.total) {
                throw "current index of page cannot bigger than the total number of pages";
            }

            var pageButton = [];

            // The first situation
            if (this.currentPage < 6) {
                for (var i = 1; i <= this.total; i++) {
                    if (i <= (this.currentPage + 2)) {
                        pageButton.push(i);
                    } else if (Math.abs(((this.currentPage + 2) - this.total)) < 2) {
                        pageButton.push(i);
                        if (i === this.total) {
                            break;
                        }
                    } else if (i === this.total) {
                        pageButton.push('...');
                        pageButton.push(this.total);
                    } else {
                        continue;
                    }
                }
            }

            // The second situation
            else if (this.currentPage >= 6 && this.currentPage <= (this.total - 5)) {
                for (var i = 1; i <= this.total; i++) {
                    if (i === 1) {
                        pageButton.push(1);
                        pageButton.push('...');
                    } else if (i < (this.currentPage - 2)) {
                        continue;
                    } else if (i >= (this.currentPage - 2) && i <= (this.currentPage + 2)) {
                        pageButton.push(i);
                    } else if (i > (this.currentPage + 2) && i < this.total) {
                        continue;
                    } else if (i === this.total) {
                        pageButton.push('...');
                        pageButton.push(i);
                    }
                }
            }

            // The third situation
            else if (this.currentPage > (this.total - 5)) {
                for (var i = 1; i <= this.total; i++) {
                    if (i === 1) {
                        pageButton.push(1);
                        pageButton.push('...');
                    } else if (i < (this.currentPage - 2)) {
                        continue;
                    } else {
                        pageButton.push(i);
                    }
                }
            }

            if (this.currentPage === 1) {
                if (this.total !== 1) {
                    pageButton.push('Next');
                }
            } else if (this.currentPage === this.total) {
                pageButton.splice(0, 0, 'Pre');
            } else {
                pageButton.splice(0, 0, 'Pre');
                pageButton.push('Next');
            }

            return pageButton;

        } catch (err) {
            console.error('Error: ' + err + ".");
        }
    };


    // generate normal element
    var Element = function(nodeName, text) {
        this.nodeName = nodeName;
        this.text = text;
    }

    Element.prototype.generate = function() {
        var newElement = document.createElement(this.nodeName);
        var newContent = document.createTextNode(this.text);
        newElement.appendChild(newContent);

        return newElement;
    }


    var renderPage = function(totalPage, currentPage) {

        var hash = parseInt(location.hash.substring(6), 10);

        var page = new Pagination(totalPage, currentPage);
        var pageQuene = page.generate();

        var ul_element = new Element('ul', '');
        var ul = ul_element.generate();
        ul.setAttribute('class', 'pagination');

        for (var i = 0; i < pageQuene.length; i++) {
            var li_element = new Element('li', '');
            var a_element = new Element('a', pageQuene[i]);
            var li = li_element.generate();
            var a = a_element.generate();

            if (pageQuene[i] === 'Pre' || pageQuene[i] === 'Next' || pageQuene[i] === '...') {
                a.setAttribute('href', 'javascript:void(0)');

                if (pageQuene[i] === 'Pre') {
                    li.setAttribute('class', 'pagePre');
                } else if (pageQuene[i] === 'Next') {
                    li.setAttribute('class', 'pageNext');
                } else {
                    li.setAttribute('class', 'disabled');
                }

            } else {
                a.setAttribute('href', '#page=' + pageQuene[i]);
            }

            if (!hash && pageQuene[i] === 1) {
                li.setAttribute('class', 'active');
            } else if (pageQuene[i] === hash) {
                li.setAttribute('class', 'active');
            }

            li.appendChild(a);
            ul.appendChild(li);
        }

        return ul;
    }

    $.fn.pagination = function(setting) {

        var $this = $(this),
            defaults = {
                totalPage: 20,
                callback: null
            };

        var config = $.extend({}, defaults, setting),
            pageNow = parseInt(location.hash.substring(6), 10) || 1;

        $this.html(renderPage(config.totalPage, pageNow));

        (function selectPage() {
            if (parseFloat($.fn.jquery, 1) < 1.7) {
                $(document).delegate('.pagination li', 'click', select_page_fn);
            } else {
                $(document).on('click', '.pagination li', select_page_fn);
            }
        })();

        function select_page_fn() {
            var $li = $(this);
            if ($li.hasClass('pagePre')) {
                pageNow--;
                location.hash = "#page=" + pageNow;
                $this.html(renderPage(config.totalPage, pageNow));

                // callback
                if (typeof config.callback === 'function') {
                    config.callback(pageNow);
                }
            } else if ($li.hasClass('pageNext')) {
                pageNow++;
                location.hash = "#page=" + pageNow;
                $this.html(renderPage(config.totalPage, pageNow));
                // callback
                if (typeof config.callback === 'function') {
                    config.callback(pageNow);
                }
            } else if ($li.text() === '...') {

            } else {
                pageNow = parseInt($li.find('a').attr('href').substring(6), 10);
                location.hash = "#page=" + pageNow;
                $this.html(renderPage(config.totalPage, pageNow));
                // callback
                if (typeof config.callback === 'function') {
                    config.callback(pageNow);
                }
            }
        }
    }

})(jQuery, window, document);