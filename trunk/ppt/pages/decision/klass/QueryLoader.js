// *** QUERY LOADER**//
QueryLoader = $.klass({
    initialize: function(jsonURL, query) {
        this.url = jsonURL;
        this.query = query || new Query();
    },
    // Small utility function to check that something is an int
    isInt: function(input){
        return parseInt(input)==input;
    },
    load: function(){
        var th = this;
                    
        // Get the json file, read it
        // then fill this object in case of success
        $.getJSON(this.url)
        // If an error occurs
        .error(function(er) {
            $.log("JSON read error, code "+er.status+" : "+er.statusText);
            return false;
        })
        // in case of success
        .success(function(data){
            // We check data and stop if there is some errors
            if(!th.checkQuery(data)){
                $.log("please correct errors before going further.")
                return;
            }else{
                $.log("JSON has been checked and is ok !")
            }
                        
            // If everything is ok, we give the data back
            th.fillAndStart(data);
        });
    },
    checkQuery: function(data){
                    
        var errors = [];
                    
        // Check that every attribute is present                    
        if(data.title == undefined)
            errors.push("JSON content error : missing title attribute");
                    
        if(data.submit == undefined)
            errors.push("JSON content error : missing submit attribute");
                    
        if(data.questions == undefined){
            errors.push("JSON content error : missing questions");
        }else{
            errors = errors.concat(this.checkQuestions(data.questions));
        }
                    
        // We display the array of errors if any
        $.each(errors, function(indexInArray, error){
            $.error(error);
        });
                    
        return (errors.length == 0);
    },
    checkQuestions: function(questions){
        var errors = [];
                    
        // Questions' id (to check duplicate id)
        var ids = [];
                    
        var th = this;
                    
        $.each(questions, function(indexInArray, question){
            if(question.id == undefined && th.isInt(question.id)){
                errors.push("JSON content error : missing id attribute in a question");
                return;
            }
                            
            if(!th.isInt(question.id)){
                errors.push("JSON content error : id must be an integer in question "+question.id);
                return;
            }
                        
            ids.push(question.id);
            
            
            if(question.name == undefined)
                errors.push("JSON content error : missing name attribute in question n°"+question.id);
                        
            if(question.text == undefined)
                errors.push("JSON content error : missing text attribute in question n°"+question.id);
            if(!th.checkNext(question.next))
                errors.push("JSON content error : optional attribute next is not like [1, 2, 3] or [1] in question n°"+question.id);
                        
            if(question.type == undefined)
                errors.push("JSON content error : missing type attribute in question n°"+question.id);
            else{
                // REGULAR TYPES
                if(question.type == "checkbox" || question.type == "radio" || question.type == "select"){
                    if(question.answers == undefined)
                        errors.push("JSON content error : missing answers attribute in question n°"+question.id);
                }
                // If it is not another another type of question where answers are not mandatory
                else if(question.type != "slider"){
                    
                    
                    errors.push("JSON content error : type "+question.type+" is not allowed in question n°"+question.id);
                }
                // Si il y a des réponses, on vérifie qu'elles sont correctes
                if(question.answers != undefined){
                    errors = errors.concat(th.checkAnswer(question.answers, question.id, question.type));
                }
            }
        });
                        
        // We check that there is no duplicate question id
        var duplicate = false;
        for(var i = 0; i < ids.length && !duplicate; i++){
            var current = ids.pop();
            for(var j = 0; j < ids.length && !duplicate; j++){
                duplicate |= (current == ids[j]);
            }
        }
        if(duplicate)
            errors.push("JSON content error : duplicate questions id");
                    
        return errors;
    },
    checkAnswer: function(answers, questionid, questiontype){
        var errors = [];
                    
        var th = this;
                    
        $.each(answers, function(indexInArray, answer){
            if(answer.value == undefined)
                errors.push("JSON content error : missing value attribute in one answer of question n°"+questionid);
            if(answer.text == undefined && questiontype != "slider")
                errors.push("JSON content error : missing text attribute in answer "+answer.value+" of question n°"+questionid);
            if(!th.checkNext(answer.next))
                errors.push("JSON content error : optional attribute next is not like [1, 2, 3] or [1] in answer "+answer.value+" of question n°"+question.id);
        });
                    
        return errors;
    },
    checkNext: function(next){
        if(next == undefined) return true;
        // if it is an array, we check it only contains integers
        if (next instanceof Array){
            var isInt = this.isInt;
            $.each(next, function(indexInArray, id){
                if(!isInt(id)) return false;
            });
        }
        return true;
    },
    fillAndStart: function(data){
       var query = this.query;
        // Fill the query
        query.title = data.title;
        query.submitURL = data.submit;
        
        query.questions = [];
        $.each(data.questions, function(indexInArray, question){
            query.questions.push(new Question(question.id, question.text, question.name, question.details, question.next, question.type, question.answers, question.options));
        });
                    
        $.log("Query loaded from URL");
                    
        // We start the query
        query.start();
    }
});