function loadAutoCompleteScript(){
    var searching = new autoComplete({
        selector: '#search-box',
        minChars: 1,
        source: function(term, suggest){
            term = term.toLowerCase();
            var choices = getSearchChoices();
            var suggestions = [];
            for (var i = 0; i < choices.length; i++)
                if (~choices[i].toLowerCase().indexOf(term)) suggestions.push(choices[i]);
            suggest(suggestions);
        }
    });
}