var start = function() {
    
    var hideQuery = "";
    
    if(show != undefined && show != ""){
        hideQuery = "."+show
    }
    if(hide != undefined){
        hide.forEach(function(el){
            hideQuery+=":not(."+el+")";
        });
    }
    
    console.log(hideQuery);
    
    var doc = document;
    var disableBuilds = false;
    var disableNotes = false;

    var ctr = 0;
    var spaces = /\s+/, a1 = [''];

    var toArray = function(list) {
        return Array.prototype.slice.call(list || [], 0);
    };

    var byId = function(id) {
        if (typeof id == 'string') {
            return doc.getElementById(id);
        }
        return id;
    };

    var query = function(query, root) {
        return queryAll(query, root)[0];
    }

    var queryAll = function(query, root) {
        if (!query) {
            return [];
        }
        if (typeof query != 'string') {
            return toArray(query);
        }
        if (typeof root == 'string') {
            root = byId(root);
            if(!root){
                return [];
            }
        }
        
        root = root || document;
        var rootIsDoc = (root.nodeType == 9);
        var doc = rootIsDoc ? root : (root.ownerDocument || document);

        // rewrite the query to be ID rooted
        if (!rootIsDoc || ('>~+'.indexOf(query.charAt(0)) >= 0)) {
            root.id = root.id || ('qUnique' + (ctr++));
            query = '#' + root.id + ' ' + query;
        }
        // don't choke on something like ".yada.yada >"
        if ('>~+'.indexOf(query.slice(-1)) >= 0) {
            query += ' *';
        }
        return toArray(doc.querySelectorAll(query));
    };
    var nbslides = queryAll("article"+hideQuery).length;
    
    // Pour bloquer les executions multiples
    if(queryAll(".prettyprint").length > 0){
        return;
    }

    var strToArray = function(s) {
        if (typeof s == 'string' || s instanceof String) {
            if (s.indexOf(' ') < 0) {
                a1[0] = s;
                return a1;
            } else {
                return s.split(spaces);
            }
        }
        return s;
    };

    // Needed for browsers that don't support String.trim() (e.g. iPad)
    var trim = function(str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };

    var addClass = function(node, classStr) {
        classStr = strToArray(classStr);
        var cls = ' ' + node.className + ' ';
        for (var i = 0, len = classStr.length, c; i < len; ++i) {
            c = classStr[i];
            if (c && cls.indexOf(' ' + c + ' ') < 0) {
                cls += c + ' ';
            }
        }
        node.className = trim(cls);
    };

    var removeClass = function(node, classStr) {
        var cls;
        if (classStr !== undefined) {
            classStr = strToArray(classStr);
            cls = ' ' + node.className + ' ';
            for (var i = 0, len = classStr.length; i < len; ++i) {
                cls = cls.replace(' ' + classStr[i] + ' ', ' ');
            }
            cls = trim(cls);
        } else {
            cls = '';
        }
        if (node.className != cls) {
            node.className = cls;
        }
    };
    
    var isHidden = function(node){
        var hidden = false;
        if(hide){
            hide.forEach(function(el){
                if(node) hidden = hidden || (node.className.indexOf(el) >= 0) ? true : false;
            });
            if(node && show != "") hidden = hidden || (node.className.indexOf(show) >= 0) ? false : true;
        }
        return hidden;
    }

    var toggleClass = function(node, classStr) {
        var cls = ' ' + node.className + ' ';
        if (cls.indexOf(' ' + trim(classStr) + ' ') >= 0) {
            removeClass(node, classStr);
        } else {
            addClass(node, classStr);
        }
    };


    // modernizr lite via https://gist.github.com/598008
    var testStyle = function(style) {

        var elem = document.createElement('div');
        var prefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'];
        var bool;
        var bump = function(all, letter) {
            return letter.toUpperCase();
        };
        var prop;

        bool = style in elem.style;
        prop = style.replace(/^(.)/, bump).replace(/-([a-z])/ig, bump);

        for (var len = prefixes.length; len--; ){
            if (bool) {
                break;
            }
            bool = prefixes[len] + prop in elem.style;
        }

        document.documentElement.className += ' ' + (bool ? '' : 'no-') + style.replace(/-/g, '');
        return bool;
    };

    var canTransition = testStyle('transition');
    
   

    //
    // Slide class
    //
    var Slide = function(node, idx) {
        this._node = node;
        var note = query('.note > section', node);
        this._speakerNote = note ? note.innerHTML : '';
        if (idx >= 0) {
            this._count = idx + 1;
        }
        if (this._node) {
            addClass(this._node, 'slide distant-slide');
        }
        this._makeCounter();
        this._makeBuildList();
    };

    Slide.prototype = {
        _node: null,
        _count: 0,
        _buildList: [],
        _visited: false,
        _currentState: '',
        _states: [ 'distant-slide', 'far-past',
        'past', 'current', 'future',
        'far-future', 'distant-slide' ],
        setState: function(state) {
            if (typeof state != 'string') {
                state = this._states[state];
            }
            if (state == 'current' && !this._visited) {
                this._visited = true;
                this._makeBuildList();
            }
            removeClass(this._node, this._states);
            addClass(this._node, state);
            this._currentState = state;

            // delay first auto run. Really wish this were in CSS.
            /*
      this._runAutos();
      */
            var _t = this;
            setTimeout(function(){
                _t._runAutos();
            } , 400);

            if (state == 'current') {
                this._onLoad();
            } else {
                this._onUnload();
            }
        },
        _onLoad: function() {
            this._fireEvent('onload');
            this._showFrames();
        },
        _onUnload: function() {
            this._fireEvent('onunload');
            this._hideFrames();
        },
        _fireEvent: function(name) {
            var eventSrc = this._node.getAttribute(name);
            if (eventSrc) {
                eventSrc = '(function() { ' + eventSrc + ' })';
                var fn = eval(eventSrc);
                fn.call(this._node);
            }
        },
        _showFrames: function() {
            var frames = queryAll('iframe', this._node);
            function show() {
                frames.forEach(function(el) {
                    var _src = el.getAttribute('_src');
                    if (_src && _src.length) {
                        el.src = _src;
                    }
                });
            }
            setTimeout(show, 0);
        },
        _hideFrames: function() {
            var frames = queryAll('iframe', this._node);
            function hide() {
                frames.forEach(function(el) {
                    var _src = el.getAttribute('_src');
                    if (_src && _src.length) {
                        el.src = '';
                    }
                });
            }
            setTimeout(hide, 250);
        },
        _makeCounter: function() {
            if(!this._count || !this._node) {
                return;
            }
            var c = doc.createElement('span');
            c.textContent = this._count+" / "+nbslides;
            c.className = 'counter';
            this._node.appendChild(c);
        },
        _makeBuildList: function() {
            this._buildList = [];
            if (disableBuilds) {
                return;
            }
            if (this._node) {
                this._buildList = queryAll('[data-build] > *', this._node);
            }
            this._buildList.forEach(function(el) {
                addClass(el, 'to-build');
            });
        },
        _runAutos: function() {
            if (this._currentState != 'current') {
                return;
            }
            // find the next auto, slice it out of the list, and run it
            var idx = -1;
            this._buildList.some(function(n, i) {
                if (n.hasAttribute('data-auto')) {
                    idx = i;
                    return true;
                }
                return false;
            });
            if (idx >= 0) {
                var elem = this._buildList.splice(idx, 1)[0];

                var _t = this;
                if (canTransition) {
                    var l = function(evt) {
                        elem.parentNode.removeEventListener('webkitTransitionEnd', l, false);
                        elem.parentNode.removeEventListener('transitionend', l, false);  // moz
                        elem.parentNode.removeEventListener('oTransitionEnd', l, false);
                        _t._runAutos();
                    };
                    elem.parentNode.addEventListener('webkitTransitionEnd', l, false);
                    elem.parentNode.addEventListener('transitionend', l, false);
                    elem.parentNode.addEventListener('oTransitionEnd', l, false);
                    removeClass(elem, 'to-build');
                } else {
                    setTimeout(function() {
                        removeClass(elem, 'to-build');
                        _t._runAutos();
                    }, 400);
                }
            }
        },
        getSpeakerNote: function() {
            return this._speakerNote;
        },
        buildNext: function() {
            if (!this._buildList.length) {
                return false;
            }
            removeClass(this._buildList.shift(), 'to-build');
            return true;
        }
    };

    //
    // SlideShow class
    //
    
    var SlideShow = function(slides) {
        this._slides = (slides || []).map(function(el, idx) {
            return new Slide(el, idx);
        });
        var h = window.location.hash;
        try {
            this.current = h;
        } catch (e) { /* squeltch */ }
        this.current = (!this.current) ? "landing-slide" : this.current.replace('#', '');
        if (!query('#' + this.current)) {
            // if this happens is very likely that someone is coming from
            // a link with the old permalink format, i.e. #slide24
            this.current = "landing-slide";
        }
        var _t = this;
        doc.addEventListener('keydown',
            function(e) {
                _t.handleKeys(e);
            }, false);
        doc.addEventListener('touchstart',
            function(e) {
                _t.handleTouchStart(e);
            }, false);
        doc.addEventListener('touchend',
            function(e) {
                _t.handleTouchEnd(e);
            }, false);
        window.addEventListener('popstate',
            function(e) {
                if (e.state) {
                    _t.go(e.state, true);
                }
            }, false);
        query('#left-init-key').addEventListener('click',
            function() {
                _t.next();
            }, false);
        this._update();
    };

    SlideShow.prototype = {
        _presentationCounter: query('#presentation-counter'),
        _speakerNote: query('#speaker-note'),
        _slides: [],
        _getCurrentIndex: function() {
            var me = this;
            var slideCount = null;
            queryAll('article'+hideQuery).forEach(function(slide, i) {
                if (slide.id == me.current) {
                    slideCount = i;
                }
            });
            return slideCount + 1;
        },
        _update: function(targetId, dontPush) {
            // in order to delay the time where the counter shows the slide number we check if
            // the slides are already loaded (so we show the loading... instead)
            // the technique to test visibility is taken from here
            // http://stackoverflow.com/questions/704758/how-to-check-if-an-element-is-really-visible-with-javascript
            var currentIndex = this._getCurrentIndex();

            if (targetId) {
                var savedIndex = currentIndex;
                this.current = targetId;
                currentIndex = this._getCurrentIndex();
                if (Math.abs(savedIndex - currentIndex) > 1) {
                    // if the current switch is not "prev" or "next", we need clear
                    // the state setting near the original slide
                    for (var x = savedIndex; x < savedIndex + 7; x++) {
                        if (this._slides[x-4]) {
                            this._slides[x-4].setState(0);
                        }
                    }
                }
            }
            var docElem = document.documentElement;
            var elem = document.elementFromPoint( docElem.clientWidth / 2, docElem.clientHeight / 2);
            if (elem && elem.className != 'presentation') {
                this._presentationCounter.innerHTML = "<p>"+currentIndex+"</p>";
            }
            this._speakerNote.innerHTML = this._slides[currentIndex - 1].getSpeakerNote();
            if (history.pushState) {
                if (!dontPush) {
                    history.replaceState(this.current, 'Slide ' + this.current, '#' + this.current);
                }
            } else {
                window.location.hash = this.current;
            }
            for (x = currentIndex; x < currentIndex + 7; x++) {
                if (this._slides[x-4]) {
                    this._slides[x-4].setState(x-currentIndex);
                }
            }
        },

        current: 0,
        next: function() {
            if (!this._slides[this._getCurrentIndex() - 1].buildNext()) {
                var next;
                var old = this.current;
                while(!(next = query('#' + this.current + ' + article'+hideQuery))){
                    
                    next = query('#' + this.current + ' + article');
                    
                    if(!next) break;
                    else this.current = next.id;
                }
                //this.current = (next) ? next.id : this.current;
                
                if(next == undefined){
                    this.current = old;
                }
                
                this._update((next) ? next.id : this.current);
            }
        },
        prev: function() {
            var i = 1;
            var prev;
            // On zappe les slides masqués
            do{
                var currentIndex = queryAll("article").indexOf(query('#'+this.current))+1;
                prev = query('article:nth-child(' + (currentIndex - i) + ')');
                i++;
                console.log(prev);
                console.log(isHidden(prev));
            }while(isHidden(prev));
            
            //this.current = (prev) ? prev.id : this.current;
            console.log(prev);
            this._update((prev) ? prev.id : this.current);
            
        },
        toggleHightlight: function() {
            var link = query('#prettify-link');
            link.disabled = !(link.disabled);
            sessionStorage['highlightOn'] = !link.disabled;
        },
        go: function(slideId, dontPush) {
            //this.current = slideId;
            this._update(slideId, dontPush);
        },
        handleKeys: function(e) {
            if (/^(input|textarea)$/i.test(e.target.nodeName) || e.target.isContentEditable) {
                return;
            }

            switch (e.keyCode) {
                case 37: // left arrow
                    this.prev();
                    break;
                case 39: // right arrow
                case 32: // space
                    this.next();
                    break;
                case 72: // H
                    this.toggleHightlight();
                    break;
            }
        },
        _touchStartX: 0,
        handleTouchStart: function(e) {
            this._touchStartX = e.touches[0].pageX;
        },
        handleTouchEnd: function(e) {
            var delta = this._touchStartX - e.changedTouches[0].pageX;
            var SWIPE_SIZE = 150;
            if (delta > SWIPE_SIZE) {
                this.next();
            } else if (delta< -SWIPE_SIZE) {
                this.prev();
            }
        }
    };

    // load highlight setting from session storage, if available.
    // session storage can only store strings so we have to assume type coercion
    // for the boolean logic here
    //query('#prettify-link').disabled = !(sessionStorage['highlightOn'] == 'true');

    // disable style theme stylesheets
    var linkEls = queryAll('link.theme');
    var stylesheetPath = /*sessionStorage['theme'] || */'css/default.css';
    linkEls.forEach(function(stylesheet) {
        stylesheet.disabled = !(stylesheet.href.indexOf(stylesheetPath) != -1);
    });

    // Initialize
    var li_array = [];
    var transitionSlides = queryAll('.transitionSlide').forEach(function(el) {
        li_array.push( ['<li>','<a data-hash="', el.id, '">','<span><img src="',
            query('img', el).src.replace(/256/g, '64'), '"/></span>',
            query('h1', el).textContent, '</a>',
            '</li>'].join('')
            );
    });
    
        
    queryAll('.html header').forEach(function(el) {
        var div = doc.createElement('div');
        div.innerHTML = '<img src="img/html.png" alt="html" />';
        addClass(div, "html");
        el.appendChild(div);
    });
    
    queryAll('.css header').forEach(function(el) {
        var div = doc.createElement('div');
        div.innerHTML = '<img src="img/css.png" alt="css" />';
        addClass(div, "css");
        el.appendChild(div);
    });
    
    queryAll('.javascript header').forEach(function(el) {
        var div = doc.createElement('div');
        div.innerHTML = '<img src="img/javascript.png" alt="javascript" />';
        addClass(div, "javascript");
        el.appendChild(div);
    });
    
    // Contient le fil d'ariane'
    var breadcrumb = [];
    // Contient la numérotation
    var numerotation = [];
    // Le dernier slide sommaire parcouru
    var sommaire;
    // Les éléments du slide sommaire
    var elements;
    // Le niveau du sommaire (de 2 à 6)
    var niveau;
    queryAll('article'+hideQuery).forEach(function(el) {
        
        for(i = 1; i <= 6; i++){
            // On prend le titre si c'est un titre de sommaire (non indexé)
            var titre = query('h'+i+".no-index", el);
            // si un titre est défini
            if(titre){
                //Partie sommaire
                if(query("section.sommaire",el)){
                    // Avant de changer de sommaire, il faut écrire l'ancien
                    if(sommaire){
                        var ul = doc.createElement('ul');
                        elements.forEach(function(elem){
                            var li = doc.createElement('li');
                            li.innerHTML = elem;
                            ul.appendChild(li);
                        });
                        sommaire.appendChild(ul);
                    }
                    sommaire = query("section.sommaire",el);
                    niveau = i+1;
                    elements = [];
                }
            }
        }
        
        //Pour chaque niveau de titre
        var hasTitre = false;
        for(i = 1; i <= 6; i++){
            // On prend le titre si c'est un titre de chapitre';
            titre = query('h'+i+":not(.no-index)", el);
            // si un titre est défini
            if(titre){
                hasTitre = true;
                //Partie sommaire
                {
                    if(i == niveau){
                        elements.push("<a data-hash='"+el.id+"'>"+titre.textContent+"</a>");
                    }
                }
                //Partie breadcrumb
                {
                    // On vide tout ce qui est sous le niveau du nouveau titre
                    while(breadcrumb.length >= i){
                        breadcrumb.pop();
                    }
                    // On ajoute le titre au breadcrumb
                    breadcrumb.push("<a data-hash='"+el.id+"'>"+titre.textContent+"</a>");
                }
            
                //Partie numérotation
                {
                    while(numerotation.length < i) numerotation.push(0);
                    while(numerotation.length > i) numerotation.pop();
                    numerotation[i-1]++;
                
                    titre.textContent = numerotation.join('.')+"  -  "+titre.textContent;
                }
            }
        }
        var header = query('header:not(.no-breadcrumb)', el);
        if(header && breadcrumb.length > 1){
            var c = doc.createElement('p');
            addClass(c, "breadcrumb");
            if(hasTitre) var temp = breadcrumb.pop();
            c.innerHTML = " &gt; "+breadcrumb.join(' &gt; ');
            if(hasTitre) breadcrumb.push(temp);
            header.appendChild(c);
        }
    });
    
    // On écrit l'éventuel sommaire restant'
    if(sommaire){
        var ul = doc.createElement('ul');
        elements.forEach(function(elem){
            var li = doc.createElement('li');
            li.innerHTML = elem;
            ul.appendChild(li);
        });
        sommaire.appendChild(ul);
    }

    query('#toc-list').innerHTML = li_array.join('');

    var slideshow = new SlideShow(queryAll('article'+hideQuery));

    

    document.addEventListener('DOMContentLoaded', function() {
        query('.slides').style.display = 'block';
    }, false);

    queryAll('#toc-list li a, .breadcrumb a, .sommaire a').forEach(function(el) {
        el.onclick = function() {
            slideshow.go(el.dataset['hash']);
        };
    });

    queryAll('pre').forEach(function(el) {
        addClass(el, 'prettyprint');
    });
    // on applique le langage par défault
    queryAll('.css pre:not(.html):not(.javascript)').forEach(function(el) {
        addClass(el, 'lang-css');
    });
    queryAll('.html pre:not(.css):not(.javascript)').forEach(function(el) {
        addClass(el, 'lang-html');
    });
    queryAll('.javascript pre:not(.html):not(.css)').forEach(function(el) {
        addClass(el, 'lang-js');
    });
    
    // On cache les éléments à masquer
    if(hide){
        hide.forEach(function(toHide) {
            queryAll("."+toHide).forEach(function(el) {
                el.style.display= "none";
            });
        });   
    }
   
    
    queryAll('div.note').forEach(function(note) {
        var table = doc.createElement('table');
        queryAll('li',note).forEach(function(li) {
            var span = query('span',li);
            if(span){
                var val = span.textContent;
                li.removeChild(span);
            }
            var intitule = li.textContent.split(":");
            intitule[0] = "<p>"+intitule[0]+"</p>";
            
            if(intitule[0].toLowerCase().indexOf("mobile") != -1){
                intitule[0] = "<img src='img/mobile.png' alt='Mobile' />";
            }else if(intitule[0].toLowerCase().indexOf("ie") != -1){
                intitule[0] = "<img src='img/ie.png' alt='Internet Explorer' />";
            }else if(intitule[0].toLowerCase().indexOf("firefox") != -1){
                intitule[0] = "<img src='img/firefox.png' alt='Firefox' />";
            }else if(intitule[0].toLowerCase().indexOf("safari") != -1){
                intitule[0] = "<img src='img/safari.png' alt='Safari' />";
            }else if(intitule[0].toLowerCase().indexOf("chrome") != -1){
                intitule[0] = "<img src='img/chrome.png' alt='Chrome' />";
            }
            var tr = doc.createElement('tr');
            
            tr.innerHTML = '<td>'+intitule[0]+'</td>';
            if(span) tr.innerHTML += '<td><div class="classification"><div class="cover"><img src="img/empty-stars.png" alt="O" /><img src="img/empty-stars.png" alt="O" /><img src="img/empty-stars.png" alt="O" /><img src="img/empty-stars.png" alt="O" /><img src="img/empty-stars.png" alt="O" /></div><div class="progress" style="width: '+val+';"><img src="img/full-stars.png" alt="#" /><img src="img/full-stars.png" alt="#" /><img src="img/full-stars.png" alt="#" /><img src="img/full-stars.png" alt="#" /><img src="img/full-stars.png" alt="#" /></div></div></td><td>'+intitule[1]+'</td>';
            
            table.appendChild(tr);
        });
        note.innerHTML = "";
        note.appendChild(table);
    });
    
    // Affiche les slides
    query('.slides').style.display = 'block';
    
    prettyPrint();
};
