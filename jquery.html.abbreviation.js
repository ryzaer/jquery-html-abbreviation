/*
 * JQuery HTML Abbreviation Library Function
 * Source       : https://github.com/ryzaer/jquery-html-abbreviation
 * Author       : Riza TTNT
 * Date Created : 17th, July 2020
 * Last Updated : -
 * License      : MIT
 * Description  : Inspired from 'emmet abbreviations' plugin (emmet.io) which mean,
 *                this function for expanding html abbreviation pharses for jQuery's fans
 *                
 * Example symbols;
 * > sign for newline
 * # (hashtag) for id 
 * . (dot) for class
 * [] for array attribute axcept [class&id], separated by "|" [data=1|style=width:10px;text-align:center|value=submit|....etc]
 * () multiple abbreviation string, separated by "|" sensitive case (only used once & with no newline '>') --this will update soon--
 * {} for universal value including html itself   
 *
 */

(function($){

    /*
    * very start use, call function & string example below
    * args = $.abbr('button#5.btn.btn-danger{Submit}[data-type=submitter;value=process]', false by default for beautifier);
    * $('#your').html(args),
    * console.log(args);
    * 
    * <----------- structure ----------->
    * $.abbr = function(args[],true/false){
    *   <------ this algoritm ----->
    * }
    *
    * this is some common regex pharses 
    */
    
    var parentProp  = /(blockquote|progress|optgroup|textarea|colgroup|section|details|marquee|summary|button|select|option|center|canvas|source|script|footer|strong|style|heder|tbody|thead|table|input|video|label|embed|meter|param|audio|meta|link|form|font|area|html|head|body|main|menu|abbr|span|div|img|col|nav|pre|map|h3|hr|br|h1|h4|ul|ol|li|tr|th|td|h2|h6|h5|u|p|i|a)/g;
    var noEndSpr    = ['source','param','input','embed','meta','link','col','img','br','hr'];
    
    /*
     * function for creating only single base line 
     */
    
    function parseLineBase(string, extra){
        extra = extra ? extra : '' ;
        parent = buildParent(string);
        value = buildValue(string);
    
        parse = new Array;
        parse.push(buildID(string));
        parse.push(buildClass(string));
        parse.push(buildProp(string));
    
        html = '';
        newparse = []
        for(n=0;n<parse.length;n++){
            if(parse[n]){ newparse.push(parse[n]) }
        }
    
        if(newparse.length > 0){
            html = ' ' + newparse.join(" ")
        }
    
        return '<' + parent[0] + html + ((parent[1])? '>'+ (value? saveValues(value,false) : '') + saveValues(extra,false) + '</' + parent[0] + '>' : '>' + (value? saveValues(value,false) : '') + saveValues(extra,false));        
    }
    
    /*
     * function for creating multi lines
     */
    
    function applyMultiLine(strs) {
        var $data = strs.split('>'); 
        var extra = '';
    
        $ndata = [];
        for(m=0;m<$data.length;m++){
            if(m>=1){
                $ndata.push($data[m]);
            }
        }
        var nline = $data[0];
        if($ndata.length > 0){
            nline = $ndata.join('>')
            nparse = $ndata[0].match(/\((.*?)\)/i);
            if(nparse){ 
                extra = checkExtraLineBases(nparse[1])          
            }else{ 
                extra = applyMultiLine(nline);
            }
        }
    
        fparse = $data[0].match(/\((.*?)\)/i);
        if(fparse){
            result = checkExtraLineBases(fparse[1]) 
        }else{
            result = parseLineBase($data[0],extra);
        }
    
        return result;
    }
    
    /*
     * function for checking extra lines 
     */
    
    function checkExtraLineBases(strings){
        /* this function on development */
        extra = '';
        var multi = strings.split('|');
        var args = new Array;
        $.each(multi,function(key,value){  
            args.push(applyMultiLine(value));
        }); 
        if(args.length > 0){
            extra = args.join('');
        }
        return extra;
    }
            
    function buildParent(string){  
        var endtags = true;
        var deft = 'div';     
        var chck = string.trim().replace(/([\[({.#\s].*)/g,' ');   
        var parn = chck.split(' ');   
            chck = parn[0].match(parentProp); 
        
        if(chck){
            $.each(noEndSpr,function(keys,vals){
                if(vals == chck){ deft = vals; endtags = false; }
            })
    
            if(endtags){ deft = chck; }           
        }
    
        return [deft,endtags];
    }
    
    
    function buildValue(string){
        str = string.match(/\{(.*?)\}/i);            
        if(str){ str = str[1].trim(); }
        return str;
    }
    
    function buildID(string){
        str = string.match(/\#(.*)/i);                  
        if(str){ 
            str = 'id="'+ str[1].replace(/([\s\[{.#].*)/g,'') + '"';
        }
    
        return str;
    }
    
    function buildClass(string){
        str = string.match(/\.(.*)/i);                  
        if(str){
            str = 'class="'+ str[1].replace(/\./g,' ').replace(/([\[{#,].*)/g,'') + '"';
        }  
        return str;
    }
    
    function buildProp(string){
        str = string.match(/\[(.*?)\]/i); /* return null or string */
        if(str){
            arrstr = [];
            arrsConsProp = ['class','id'];            
            args = saveValues(str[1],false);  
            args = args.split('|');
            $.each(args,function(key,val){
                if(val){                      
                    newstr = val.trim().split('=');
                    exiest = false;                        
                    for(m=0;m<arrsConsProp.length;m++){
                        values = newstr[0].trim();
                        if(newstr[0] && arrsConsProp[m] !== values){ exiest = true; }
                    }  
                    if(exiest){                                
                        if(newstr.length == 2){
                            props = newstr[0] + '="' + newstr[1] + '"';
                        }else{
                            props = newstr[0];
                        }          
                        arrstr.push(props);
                    }           
                }
            })  
            str = arrstr.join(' ');  
        }
    
        return str;
    }
    
    function saveValues(_str,_encode = true){
        var _str = _str? _str : '';
        if(_str){
            if(_encode){
                _str = _str.replace(/\./g,"*");           
                _str = _str.replace(/\(/g,"~?"); 
                _str = _str.replace(/\)/g,"?~");
                _str = encodeURIComponent(_str);
            }else{
                _str = decodeURIComponent(_str);
                _str = _str.replace(/\*/g,".");           
                _str = _str.replace(/\~\?/g,"(");            
                _str = _str.replace(/\?\~/g,")");
            } 
        }  
        return _str;
    }
    
    function passValues(abbr){        
        var rslts = false;   
        var rslt  = false;  
        if(abbr){
            mtch = abbr.match(/\{(.*?)\}/g);
            if(mtch){        
                for(m=0; m < mtch.length; m++){
                    save = '{' + saveValues(mtch[m].substr(0,(mtch[m].length -1)).substr(1)) + '}';            
                    abbr = abbr.replace(mtch[m], save);            
                }   
                rslt = abbr;     
            }
    
            if(rslt){ rslts = rslt; }
    
            mtch = abbr.match(/\[(.*?)\]/g);            
            if(mtch){
                for(m=0; m < mtch.length; m++){
                    save = '[' + saveValues(mtch[m].substr(0,(mtch[m].length -1)).substr(1)) + ']';            
                    abbr = abbr.replace(mtch[m], save);            
                }   
                rslts = abbr;     
            }
        }
        return rslts;
    }
    
    $.abbr  = function(_args,beauty=false){
        var result = '';    
        if(_args){
            if(_args.length == 2){
    
                val1 = _args[0]
                pass1 = passValues(_args[0]); 
                if(pass1){ val1 = pass1; }
    
                val2 = _args[1]
                pass2 = passValues(_args[1]); 
                if(pass2){ val2 = pass2; } 
    
                result = parseLineBase(val1,val2);
    
            }else{
    
                pass = passValues(_args); 
                if(pass){ _args = pass; }             
                result = applyMultiLine(_args);
    
            }
        }
        return beauty? beautifyTags(result) : result;
    }
    
    /*
     * here beautifier function for html 
     * $.htmlBeautify = function(_string){
     *     return beautifyTags(_string)   
     * }                                  
     */                                         
    
    function beautifyTags(html,tab = 0) {
        return parses(html.replace(/(\r\n|\n|\r)/gm," ").replace(/ +(?= )/g,''));
    }
    
    function parses(html, tab=0) {
        var tab;
        var html = $.parseHTML(html);
        var formatHtml = new String();   
    
        function setTabs() {
            var tabs = new String();
            for (i=0; i < tab; i++){ tabs += '\t'; }
            return tabs;    
        };
    
    
        $.each( html, function( i, el ) {
            if (el.nodeName == '#text') {
                if (($(el).text().trim()).length) {
                    formatHtml += setTabs() + $(el).text().trim() + '\n';
                }    
            } else {
                var innerHTML = $(el).html().trim();
                $(el).html(innerHTML.replace('\n', '').replace(/ +(?= )/g, ''));
    
                if ($(el).children().length) {
                    $(el).html('\n' + parses(innerHTML, (tab + 1)) + setTabs());
                    var outerHTML = $(el).prop('outerHTML').trim();
                    formatHtml += setTabs() + outerHTML + '\n'; 
    
                } else {
                    outerHTML = $(el).prop('outerHTML').trim();
                    formatHtml += setTabs() + outerHTML + '\n';
                }      
            }
        });
    
        return formatHtml;
    }
    
})(jQuery);
