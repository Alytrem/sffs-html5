Comparator = $.klass({
    initialize: function(dom) {
        // URL to submit values in filters
        this.submitURL = "";
        
        // Characteristics array
        this.characteristics = [];
        
        // Products array
        this.products = [];
        
        // Filters array : filter ~= question
        this.filters = [];
        
        // DOM elements
        this.dom = new Object();
        this.dom.main = (dom != undefined) ? (dom.main || dom) : $("body");
        this.dom.products = this.dom.products || null;
        this.dom.filters = this.dom.filters || null;
    },
    
    display: function(){
        this.displayFilters();
        this.displayProducts();
    },
    
    displayFilters: function(){
        if(this.dom.filters == null){
            this.dom.filters = $("<div id='filters'></div>");
            this.dom.main.append(this.dom.filters);
        }else{
            this.dom.filters.empty();
        }
        
        var th = this;
        // We will get maxwidths to harmonize the rendering
        var maxAnswerWidth = 0;
        var maxTitleWidth = 0;
        
        $.each(this.filters, function(index, filter){
            var dom = $("<div class='filter'></div>");
            th.dom.filters.append(dom);
            filter.ask(dom);
            maxAnswerWidth = Math.max(maxAnswerWidth, $(".answers", dom).width());
            maxTitleWidth = Math.max(maxTitleWidth, $(".title", dom).width());
        });
        // We force width
        $(".title").css("width",maxTitleWidth+"px");
        $(".answers").css("width",maxAnswerWidth+"px");
        
        var submit = $("<div class='filter'></div>");
        var button = $("<button id='submit-filters' class='submit'>Appliquer les filtres</button>");
        button.button();
        // We make the button taking the whole space available
        button.css("width",(maxTitleWidth+maxAnswerWidth+20)+"px");
        
        var th = this;
        button.click(function(event){
            th.submit();
        });
        
        submit.append(button);
        this.dom.filters.append(submit);
    },
    displayProducts: function(){
        if(this.dom.products == null){
            this.dom.products = $("<div id='products'></div>");
            this.dom.main.append(this.dom.products);
        }else{
            this.dom.products.empty();
        }
        
        // We display everything in a table
        // 1. We create a table
        var table = $("<table class='comparator'></table>");
        var thead = $("<thead class='ui-widget-header'></thead>");
        var tbody = $("<tbody class='ui-widget-content'></tbody>");
        table.append(thead);
        table.append(tbody);
        
        var th = this;
        
        // 2. We write headers
        var headers = $("<tr><th class='empty'></th></tr>");
        $.each(th.products, function(index, prod){
            var header = $("<th></th>");
            header.append($("<p>"+prod.name+"</p>"));
            if(prod.imageURL != undefined) header.append($("<img src='"+prod.imageURL+"' alt='"+prod.name+"' width='80px' />"));
            headers.append(header);
        });
        thead.append(headers);
        
        // We fill the table with values
        // For each characteristic
        $.each(th.characteristics, function(index, charac){
            // We create a new line
            var line = $("<tr class='"+charac.name+"'></tr>");
            console.log(charac.text);
            // Which starts with a header (characteristic text)
            var header = $("<th></th>");
            header.append($("<p>"+charac.text+"</p>"));
            line.append(header);
            
            // And continues with values
            
            $.each(th.products, function(index, product){
                var value = $("<td></td>");
                if($(product.characteristics).attr(charac.name) != undefined){
                    value.append($("<p>"+$(product.characteristics).attr(charac.name)+"</p>"));
                }
                line.append(value);
            });
            
            tbody.append(line);
        });
        
        this.dom.products.append(table);
    },
    
    submit: function(){
        console.log("Update requested by user");
        
        var th = this;
        
        // We agregate filters values
        var responses = [];
        
        $.each(this.filters, function(index, filter){
            filter.submit(th.dom.filters);
            if(filter.results.length > 0){
                var response = new Object();
                response.name = filter.name;
                response.values = filter.results;
                filter.results = [];
                responses.push(response);
            }
        });
        
        // We convert the array to JSON
        var json = $.toJSON(responses);
        
        console.log("Sending JSON : "+json);
        
        // We send the JSON to the submit URL and get Data back
        $.getJSON(this.submitURL, json)
        // If an error occurs
        .error(function(er) {
            $.log("JSON read error, code "+er.status+" : "+er.statusText);
            th.dom.main.append($("<p class='ui-state-error'>Echec de la connexion au serveur</p>"));
            return false;
        })
        // in case of success
        .success(function(data){
            // We create a comprator with dom elements and give data to the ComparatorLoader
            var loader = new ComparatorLoader(data, this);
            // We load everything
            var comparator = loader.load();
        });
    },
    
    update: function(){
        var loader = new ComparatorLoader(this);
        loader.load();
        
        this.display();
    }
});

