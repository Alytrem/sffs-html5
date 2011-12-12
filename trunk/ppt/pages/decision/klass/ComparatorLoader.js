ComparatorLoader = $.klass({
    initialize: function(data, comparator) {
        this.data = data;
        this.comparator = comparator || new Comparator();
        this.characteristics = [];
    },
    // Small utility function to check that something is an int
    isInt: function(input){
        return parseInt(input)==input;
    },
    load: function(){
        if(!this.checkComparator()){
            $.log("please correct errors before going further.")
            return;
        }else{
            $.log("data response has been checked and is ok !")
        }
        
        this.fillAndStart();
    },
    checkComparator: function(){
                    
        var errors = [];
                    
        // Check that every attribute is present                    
        if(this.data.submit == undefined)
            errors.push("JSON content error : missing submit attribute");
                    
        if(this.data.filters == undefined)
            errors.push("JSON content error : missing filters attribute");
        else{
            errors = errors.concat(this.checkFilters(this.data.filters));
        }
        if(this.data.characteristics == undefined){
            errors.push("JSON content error : missing products attribute");
        }else{
            errors = errors.concat(this.checkCharacteristics(this.data.characteristics));
        }         
        if(this.data.products == undefined){
            errors.push("JSON content error : missing products attribute");
        }else{
            errors = errors.concat(this.checkProducts(this.data.products));
        }
                    
        // We display the array of errors if any
        $.each(errors, function(indexInArray, error){
            $.error(error);
        });
                    
        return (errors.length == 0);
    },
    checkCharacteristics: function(characteristics){
        var errors = [];
               
        var th = this;
        $.each(characteristics, function(indexInArray, charac){
            if(charac.name == undefined){
                errors.push("JSON content error : missing name attribute in characteristic n°"+indexInArray);
                return;
            }
            if(charac.text == undefined){
                errors.push("JSON content error : missing text attribute in characteristic n°"+indexInArray);
                return;
            }
                        
            th.characteristics.push(charac.name);
        });

        return errors;
    },
    checkProducts: function(products){
        var errors = [];
               
        var th = this;
                    
        $.each(products, function(indexInArray, product){
            if(product.name == undefined){
                errors.push("JSON content error : missing name attribute in a product");
                return;
            }
                        
            if(product.characteristics == undefined)
                errors.push("JSON content error : missing characteristics attribute in product n°"+product.name);
            else{
                // We check every characteristic
                $.each(th.characteristics, function(indexInArray, charac){
                    if($(product.characteristics).attr(charac) == undefined){
                        errors.push("JSON content error : missing characteristic "+charac+" in product "+product.name+"'s characteristics");
                    }
                });
            }
        });

        return errors;
    },
    checkFilters: function(filters){
        var errors = [];
        
        var th = this;
                    
        $.each(filters, function(indexInArray, filter){
                            
            if(filter.name == undefined){
                errors.push("JSON content error : missing name attribute in a filter");
                return;
            }
                        
            if(filter.text == undefined)
                errors.push("JSON content error : missing text attribute in filter "+filter.name);

            if(filter.type == undefined)
                errors.push("JSON content error : missing name attribute in filter "+filter.name);
            else{
                // REGULAR TYPES
                if(filter.type == "checkbox" || filter.type == "radio" || filter.type == "select"){
                    if(filter.answers == undefined)
                        errors.push("JSON content error : missing answers attribute in filter n°"+filter.name);
                }
                // If it is not another another type of filter where filters are not mandatory
                else if(filter.type != "slider"){
                    errors.push("JSON content error : type "+filter.type+" is not allowed in filter n°"+filter.name);
                }
                // Si il y a des réponses, on vérifie qu'elles sont correctes
                if(filter.answers != undefined){
                    errors = errors.concat(th.checkAnswers(filter.answers, filter.name, filter.type));
                }
            }
        });
                    
        return errors;
    },
    checkAnswers: function(answers, filterName, filterType){
        var errors = [];
        
        $.each(answers, function(indexInArray, filter){
            if(filter.value == undefined)
                errors.push("JSON content error : missing value attribute in one answer of filter "+filterName);
            if(filter.selected != undefined && !(typeof filter.selected == "boolean"))
                errors.push("JSON content error : selected attribute in answer "+filter.value+" of filter "+filterName+" must be a boolean");
            if(filter.text == undefined && filtertype != "slider")
                errors.push("JSON content error : missing text attribute in answer "+filter.value+" of filter "+filterName);
        });
                    
        return errors;
    },
    
    fillAndStart: function(){
        var comparator = this.comparator;
        
        // Fill the comparator
        comparator.submitURL = this.data.submit;
        
        comparator.filters = [];
        $.each(this.data.filters, function(indexInArray, filter){
            comparator.filters.push(new Question(0, filter.text, filter.name, "", [], filter.type, filter.answers, filter.options));
        });
        
        comparator.products = this.data.products;
        comparator.characteristics = this.data.characteristics;
        
        $.log("Comparator loaded from data");
                    
        // We display the comparator
        comparator.display();
    }
});