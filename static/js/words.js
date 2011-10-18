(function() {
  var Results, Search, Usability;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Search = (function() {
    "A class to encapsulate search functionality.";    function Search() {
      this.results = __bind(this.results, this);
      this.ajax_call = __bind(this.ajax_call, this);
      this.perform_search = __bind(this.perform_search, this);
      this.tab_click = __bind(this.tab_click, this);      this.form = $('form');
      this.input = $('.search-bar');
      this.form.submit(this.perform_search);
      this.input.popover({
        offset: 15,
        placement: 'above',
        trigger: 'manual'
      }).focus().popover('show');
      this.tab_click();
      new Usability;
    }
    Search.prototype.tab_click = function() {
      var input, tabs;
      tabs = $('.tabs').children('li').find('a');
      input = this.input;
      return tabs.click(function() {
        var api, element, scroll_height;
        api = $(this).text().toLowerCase();
        input.focus().data({
          api: api
        });
        element = $('#' + api);
        scroll_height = 1000000;
        return element.animate({
          scrollTop: scroll_height
        });
      });
    };
    Search.prototype.domainr = function(word) {
      return "http://domai.nr/api/json/search?q=" + word;
    };
    Search.prototype.wordnik = function(word, type) {
      var api_key;
      if (type == null) {
        type = 'related';
      }
      api_key = '114c5c8013a30746b185b088e83026eaebebd4a243890747e';
      return "http://api.wordnik.com/v4/word.json/" + word + "/" + type + "?api_key=" + api_key;
    };
    Search.prototype.perform_search = function(event) {
      var input, url, value;
      input = this.input;
      value = input.val();
      if (input.data('api') === 'wordnik') {
        url = this.wordnik(value);
        this.definitions = this.wordnik(value, 'definitions');
      } else {
        url = this.domainr(value);
      }
      this.ajax_call(url);
      input.focus();
      return false;
    };
    Search.prototype.ajax_call = function(url) {
      return $.ajax({
        url: url,
        dataType: 'jsonp',
        success: this.results
      });
    };
    Search.prototype.results = function(data) {
      var api, definitions;
      console.log(data);
      api = this.input.data('api');
      definitions = this.definitions;
      return new Results(data, api, definitions);
    };
    return Search;
  })();
  Results = (function() {
    "A class to deal with results returned from API calls.";    function Results(data, api, definitions) {
      if (definitions == null) {
        definitions = void 0;
      }
      this.create_html = __bind(this.create_html, this);
      this.get_wordnik_definition = __bind(this.get_wordnik_definition, this);
      this.wordnik_results = __bind(this.wordnik_results, this);
      this.domainr_results = __bind(this.domainr_results, this);
      this.populate = __bind(this.populate, this);
      this.api = api;
      this.data = data;
      this.definitions_url = definitions;
      this.populate(data);
      this.click_available_domain();
    }
    Results.prototype.populate = function(data) {
      if (this.api === 'wordnik') {
        return this.wordnik_results(data);
      } else {
        return this.domainr_results(data);
      }
    };
    Results.prototype.domainr_results = function(data) {
      var div, domainr, height, html, label, result, results, span, symbol, _i, _len;
      domainr = $('#domainr');
      html = domainr.html();
      results = data.results;
      domainr.css('background', '#fff');
      div = "<div class='row'>";
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        if (result.availability === 'available') {
          label = "label success";
          symbol = '&#10003;';
        } else {
          label = "label";
          symbol = 'X';
        }
        span = "<span class='" + label + "'>" + symbol + "</span>";
        div += "<p class='span4'><a href='#'>" + result.domain + "</a>" + span + "</p>";
      }
      div += "</div><hr />";
      domainr.html(html + div);
      height = this.calculate_scroll('domainr');
      return domainr.animate({
        scrollTop: height
      });
    };
    Results.prototype.wordnik_results = function(data) {
      var deferred_wordnik;
      this.value = $('.search-bar').val();
      deferred_wordnik = this.get_wordnik_definition(this.value);
      return deferred_wordnik.then(this.create_html);
    };
    Results.prototype.get_wordnik_definition = function(value) {
      return $.ajax({
        url: this.definitions_url,
        dataType: 'jsonp'
      });
    };
    Results.prototype.create_html = function(definition_data) {
      var definition, first_definition, height, html, result, section, similar, synonym, word, wordnik, _i, _j, _len, _len2, _ref, _ref2;
      try {
        first_definition = definition_data[0].text;
        first_definition = first_definition.split(':')[0];
      } catch (error) {
        first_definition = "Apparently this word doesn't have a definition.";
      }
      definition = "<div class='row'>\n<h3 class='span3'>" + this.value + "</h3><p class='span5'>" + first_definition + "</p>\n</div>";
      wordnik = $('#wordnik');
      html = wordnik.html();
      wordnik.css('background', '#fff');
      html += definition;
      console.log(this.data);
      _ref = this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        result = _ref[_i];
        section = "<section>";
        word = "<div class='row'><h5 class='span3'>" + result.relationshipType + "</h5>";
        similar = "<div class='span5'>";
        _ref2 = result.words;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          synonym = _ref2[_j];
          similar += "<p>" + synonym + "</p>";
        }
        similar += "</div>";
        section += word + similar + "</section>";
        html += section;
      }
      wordnik.html(html + "<hr />");
      height = this.calculate_scroll('wordnik');
      return wordnik.animate({
        scrollTop: height
      });
    };
    Results.prototype.calculate_scroll = function(element) {
      var height;
      if (element == null) {
        element = 'domainr';
      }
      if (element === 'domainr') {
        height = $('#domainr').children().length * 300;
      } else if (element === 'wordnik') {
        height = $('#wordnik').children().length * 700;
      }
      return height;
    };
    Results.prototype.click_available_domain = function() {
      var links;
      links = $('.tab-content').find('a');
      return links.live('click', function(event) {
        var text;
        text = $(this).text();
        event.preventDefault();
        return console.log(text);
      });
    };
    return Results;
  })();
  Usability = (function() {
    "A class that makes the site more usable.";    function Usability() {
      this.popover_fade();
      this.tab_switch();
      this.about_click();
    }
    Usability.prototype.popover_fade = function() {
      var popover;
      popover = $('.popover');
      return popover.mouseenter(function() {
        return $(this).stop().animate({
          opacity: 1
        });
      }).mouseleave(function() {
        return $(this).stop().animate({
          opacity: .25
        });
      }).animate({
        opacity: .25
      });
    };
    Usability.prototype.tab_switch = function() {
      var body, switch_functionality;
      body = $('body');
      switch_functionality = function(event) {
        var input, non_active;
        non_active = $('.active').siblings().find('a');
        input = $('.search-bar');
        if (event.keyCode === 9) {
          event.preventDefault();
          non_active.click();
          return input.focus();
        }
      };
      return body.keydown(switch_functionality);
    };
    Usability.prototype.about_click = function() {
      var about;
      about = $('.secondary-nav').children(':first').find('a');
      return about.click(function(event) {
        var html;
        html = $('html, body');
        event.preventDefault();
        return html.animate({
          scrollTop: 1500
        });
      });
    };
    return Usability;
  })();
  (function() {
    return new Search;
  })();
}).call(this);
