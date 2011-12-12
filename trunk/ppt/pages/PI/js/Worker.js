importScripts('jquery.hive.pollen.js'); 

$(function (val) { 
    run(val);
});

function run(val){
    var n,N,PI,I;
	
    n=1;
    N=1;
                
    function compte() 
    {
        n=n+2;
        N=N-(1/n);
        n=n+2;
        N=N+(1/n);
        PI=4*N;
    }
                
    i = 1;
    I=val.message;
    while (i < I) 
    { 
        compte() 
        i = i + 4;
    }
                
    $.send(PI);
}