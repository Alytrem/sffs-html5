// TODO : json & images
// *** QUERY **//
Query = $.klass({
    initialize: function(dom) {
        // Query name (for identification)
        this.name;
                    
        // Query title (to display to end user)
        this.title;
                    
        // URL to send the answers back to
        this.submitURL;
                    
        // Array of questions to ask
        this.questions;
                    
        // DOM elements
        this.dom = new Object();
        this.dom.main = dom || $("body");
        this.dom.title = null;
        this.dom.details = null;
        this.dom.answers = null;
        
        // Array of questions
        this.questionsList = [];
        
        // Where we are in the questions list
        // Questions before the index have already been asked
        this.questionsAsked = 0;
        
        // The current question
        this.currentQuestion = null;
    },
    start: function(){
        // Create query dom element
        var query = $("\
            <div id='query'>\
                <div id='header'><h1>"+this.title+"</h1></div>\
                <div id='content'>\
                    <div id='answers'>\n\
                        <h2 id='title'></h2>\
                        <div id='answers-content'></div>\
                    </div>\
                    <div id='details' style=''></div>\
                </div>\
                <div id='footer'><button id='submit' class='submit'>Suivant</button></div>\
            </div>");
        
        this.dom.main.append(query);
        
        // To give a nice style to submit button
        $("button").button();
        
        this.dom.title = $("#title");
        this.dom.details = $("#details");
        this.dom.answers = $("#answers-content");
       
        
        // Link button click event to submit
        var th = this;
        $("#submit").click(function(event){
            th.submit();
        });
        
        $.log("Query dom element created");
        
        //----------------------------------------------
        
        if(this.questions.length == 0) return;
                    
        // Find the first question
        var id = this.questions[0].id;
        for(var i = 1; i < this.questions.length; i++){
            id = Math.min(id, this.questions[i].id);
        }
                    
        $.log("Start with question n°"+id);
        
        this.addNext(id);
        
        //----------------------------------------------
        
        // ask the next question
        this.next();
    },
    addNext: function(next){
        // small utility very useful :
        // Add to array (questionsList) if value does not exists
        var addIfNotExists = function(value, array){
            if($.inArray(value, array) == -1){
                array.push(value);
            }
        }
        
        // Add every array element if it's an array or just the element otherwise
        if (next instanceof Array){
            for(var i = 0; i < next.length; i++){
                addIfNotExists(next[i], this.questionsList);
            }
        }else{
            addIfNotExists(next, this.questionsList);
        }
    },
    next: function(){
        // If we asked every single question that was in the list: it's over
        if(this.questionsAsked >= this.questionsList.length){
            this.end();
            return;
        }
    
        // We get the next question id
        var questionId = this.questionsList[this.questionsAsked];
            
        // We get this question
        for(var i = 0; i < this.questions.length; i++){
            if(this.questions[i].id == questionId)
                this.currentQuestion = this.questions[i];
        }
            
        // if the question has not been found, we try the next one
        if(this.currentQuestion == null){
            $.error("Error: question with id n°"+questionId+" does not exists");
            this.questionsAsked++;
            this.next();
            return;
        }
            
        // We stop if questionDom has not been defined (defined by query.start)
        if(this.dom.title == null || this.dom.details == undefined || this.dom.answers == undefined){
            $.error("Error: unable to ask question n°"+questionId+". Query may not have been started (dom undefined)");
            this.end();
            return;
        }
                
        this.currentQuestion.ask(this.dom);
    },
    clear: function(){
        this.dom.details.html("");
        this.dom.title.html("");
        this.dom.answers.html("");
    },
    submit: function(){
        $.log("Answers of question n°"+this.currentQuestion.id+" submited");
        this.addNext(this.currentQuestion.submit(this.dom));
        
        this.clear();
        this.currentQuestion = null;
        this.questionsAsked++;
        
        this.next();
    },
    end: function(){
        $.log("Query ended");
        
        // We erase the window
        this.dom.main.html("");
        
        // We agregate responses
        var responses = [];
        
        $.each(this.questions, function(index, question){
            if(question.results.length > 0){
                var response = new Object();
                response.name = question.name;
                response.values = question.results;
                responses.push(response);
            }
        });
        
        // We convert the array to JSON
        var json = $.toJSON(responses);
        
        console.log("Sending JSON : "+json);
        
        var th = this;
        
        // We send the JSON to the submit URL and get Data back
        $.getJSON(this.submitURL, json)
            // If an error occurs
            .error(function(er) {
                $.log("JSON read error, code "+er.status+" : "+er.statusText);
                th.dom.main.append($("<div class='ui-state-error'><p>Echec de la connexion au serveur</p></div>"));
                return false;
            })
            // in case of success
            .success(function(data){
                // We create a comprator with dom elements and give data to the ComparatorLoader
                var loader = new ComparatorLoader(data, new Comparator(this.dom));
                // We load everything
                var comparator = loader.load();
            });
        
        
    }
});