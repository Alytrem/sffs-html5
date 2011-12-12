// *** QUESTION **//
Question = $.klass({
    initialize: function(id, text, name, details, next, type, answers, options) {
        // unique id for this question
        this.id = id;
        
        // Question name
        this.name = name;
                    
        // Question text (what to ask ?)
        this.text = text;
        
        // Details (to help the user)
        this.details = details || "";
                    
        // Array of next questions id
        this.next = next;
                    
        // Question type
        this.type = type;
                    
        // Array of answers
        this.answers = answers;
        
        // Other fields
        this.options = options || new Object;
        
        // Results
        this.results = [];
        
    },
    ask: function(dom){
        $.log("Asking question n°"+this.id+" : "+this.name);
        this.writeTitle(dom);
        this.writeDetails(dom);
        this.writeAnswers(dom);
    },
    writeTitle: function(dom){
        if(dom.title == undefined){
            var temp = $("<div class='title'></div>");
            var title = $("<p></p>");
            temp.append(title);
            dom.title = title;
            dom.append(temp);
        }
        dom.title.text(this.text);
    },
    writeDetails: function(dom){
        if(this.details.length > 0){
            if(dom.details == undefined){
                var details = $("<div class='details'></div>");
                dom.details = details;
                dom.append(details);
            }
            dom.details.html(this.details);
        }
    },
    writeAnswers: function(dom){
        if(dom.answers == undefined){
            var answers = $("<div class='answers "+this.type+"'></div>");
            dom.answers = answers;
            dom.append(answers);
        }
            
        var type = this.type;
        var answer;
        
        //CHECKBOX
        if(type == "checkbox" || type == "radio"){
            var oneChecked = false;
            for(i = 0; i < this.answers.length; i++){
                answer = this.answers[i];
                // We must check at least 1 option for radios.
                var mustCheck = (answer.checked) || ((i == (this.answers.length -1)) && !oneChecked && type == "radio");
                oneChecked |= mustCheck;
                dom.answers.append($('<input type="'+type+'" class="'+this.name+'" id="'+this.name+'-'+answer.value+'" name="question" '+((mustCheck) ? "checked" : "")+'/><label for="'+this.name+'-'+answer.value+'">'+answer.text+'</label>'));
            }
            
            if(type == "checkbox") dom.answers.append($("<p style='font-size: 10pt'>Vous pouvez sélectionner plus d'une réponse.</p>"))
            
            if(this.answers.length <= 3){
                dom.answers.buttonset();
            }else{
                dom.answers.buttonsetv();
            }
            
            
        // SLIDER
        } else if(type == "slider"){
            this.options.min = this.options.min || 0;
            this.options.max = this.options.max || 100;
            this.options.step = this.options.step || 1;
            this.options.value = this.options.value || this.options.min;
            
            dom.answers.append($('<div id="'+this.name+'" name="question"></div><p id="'+this.name+'-value" class="slider-value">'+this.options.min+'</p>'));
            
            var name = this.name;
            $( "#"+name ).slider({
                range: "min",
                value: this.options.value,
                min: this.options.min,
                max: this.options.max,
                step: this.options.step,
                slide: function( event, ui ) {
                    $( "#"+name+"-value" ).text(ui.value);
                }
            });
            
            
        // SELECT
        }else if(type == "select"){
            var select =$('<select name="'+this.name+'" id="'+this.name+'"></select>');

            for(i = 0; i < this.answers.length; i++){
                answer = this.answers[i];
                select.append($('<option value="'+answer.value+'" '+((answer.checked) ? "selected='selected'" : "")+'>'+answer.text+'</option>'));
            }
            
            dom.answers.append(select);
        }
    },
    submit: function(dom){
        var next = [];
        var answer, value, checked;
        
        // RADIO & CHECKBOX
        if(this.type == "radio" || this.type == "checkbox"){
            checked = $("."+this.name+":checked",dom.answers);
            
            for(var i = 0; i < checked.length; i++){
                checkedId = checked[i].id;
                
                for(j = 0; j < this.answers.length; j++){
                    answer = this.answers[j];
                    
                    if(this.name+"-"+answer.value.toString() == checkedId.toString())
                    {
                        this.results.push(answer.value);
                        if($.isArray(answer.next))
                            next = next.concat(answer.next);
                    }
                }
            }
            
        // SLIDER
        }else if(this.type == "slider"){
            value = parseInt($( "#"+this.name+"-value" ).text());
            this.results.push(value);
            
            var previous = parseInt(this.options.min);
            for(j = 0; this.answers != undefined && j < this.answers.length; j++){
                answer = this.answers[j];
                var current = parseInt(answer.value);
                    
                if(value >= previous && value <= current)
                {
                    if($.isArray(answer.next))
                        next = next.concat(answer.next);
                }
                    
                previous = current;
            }
        }
        
        // SELECT
        else if(this.type == "select"){
            value = $("select").val();
            for(i = 0; i < this.answers.length; i++){
                answer = this.answers[i];
                if(answer.value.toString() == value.toString())
                {
                    this.results.push(answer.value);
                    if($.isArray(answer.next))
                        next = next.concat(answer.next);
                }
            }
        }
        
        if(next.length == 0)
            next = this.next;
        
        $.log("Question n°"+this.id+"'s answer saved : "+this.results);
        
        return next;
        
    }
});