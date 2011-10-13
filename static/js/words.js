(function() {
  var check_value, domainr, input_check, populate, search, wordnik;
  domainr = function(word) {
    return "http://domai.nr/api/json/search?q=" + word;
  };
  wordnik = function(word, type) {
    var api_key;
    if (type == null) {
      type = 'definitions';
    }
    api_key = '114c5c8013a30746b185b088e83026eaebebd4a243890747e';
    return "http://api.wordnik.com/v4/word.json/" + word + "/" + type + "?api_key=" + api_key;
  };
  search = function(event) {
    var input, url;
    input = $('input');
    if (input.data('wordnik')) {
      url = wordnik(input.val());
    } else if (input.data('domainr')) {
      url = domainr(input.val());
    }
    return $.ajax({
      url: url,
      dataType: 'json',
      success: populate
    });
  };
  populate = function(data) {
    var api, input;
    input = $('input');
    if (input.data('wordnik')) {
      api = 'wordnik';
    } else if (input.data('domainr')) {
      api = 'domainr';
    }
    return data;
  };
  input_check = function() {
    var value;
    value = $('input').val();
    if (value.length >= 2) {
      window._value = value;
      return setTimeout(check_value, 50);
    }
  };
  check_value = function() {
    var value;
    value = $('input').val();
    if (value === window._value) {
      return search;
    }
  };
}).call(this);
