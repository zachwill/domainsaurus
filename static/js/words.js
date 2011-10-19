(function() {
  var Domains, Referral, Results, Search, Usability, render;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  render = function(id, data) {
    "A simple function to render ICanHaz.js templates.";    return window.ich[id](data, true);
  };
  Search = (function() {
    "A class to encapsulate search functionality.";    function Search() {
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
      word = word.toLowerCase();
      return "http://api.wordnik.com/v4/word.json/" + word + "/" + type + "?api_key=" + api_key;
    };
    Search.prototype.perform_search = function(event) {
      var input, url, value;
      input = this.input;
      value = input.val();
      if (!value) {
        return false;
      }
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
      var definitions, input;
      input = this.input;
      definitions = this.definitions;
      return $.ajax({
        url: url,
        dataType: 'jsonp'
      }).then(function(data) {
        var api;
        api = input.data('api');
        return new Results(data, api, definitions);
      });
    };
    return Search;
  })();
  Results = (function() {
    "A class to deal with results returned from API calls.";    function Results(data, api, definitions) {
      if (definitions == null) {
        definitions = void 0;
      }
      this.create_wordnik_html = __bind(this.create_wordnik_html, this);
      this.get_wordnik_definition = __bind(this.get_wordnik_definition, this);
      this.wordnik_results = __bind(this.wordnik_results, this);
      this.domainr_results = __bind(this.domainr_results, this);
      this.populate = __bind(this.populate, this);
      this.api = api;
      this.data = data;
      this.definitions_url = definitions;
      this.populate(data);
    }
    Results.prototype.populate = function(data) {
      if (this.api === 'wordnik') {
        return this.wordnik_results(data);
      } else {
        return this.domainr_results(data);
      }
    };
    Results.prototype.domainr_results = function(data) {
      var div, domain, domainr, height, html, label, result, results, symbol, template, templates, _i, _len;
      domainr = $('#domainr');
      html = domainr.html();
      results = data.results;
      domainr.css('background', '#fff');
      templates = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        if (result.availability === 'available') {
          label = "label success";
          symbol = '&#10003;';
        } else {
          label = "label";
          symbol = 'X';
        }
        domain = result.domain;
        template = render('domainr_results', {
          label: label,
          symbol: symbol,
          domain: domain
        });
        templates.push(template);
      }
      templates = templates.join('');
      div = render('domainr_div', {
        templates: templates
      });
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
      return deferred_wordnik.then(this.create_wordnik_html);
    };
    Results.prototype.get_wordnik_definition = function(value) {
      return $.ajax({
        url: this.definitions_url,
        dataType: 'jsonp'
      });
    };
    Results.prototype.create_wordnik_html = function(definition_data) {
      var definition, first_definition, height, html, relationship, result, section, sections, synonym, wordnik, words, _i, _len, _ref;
      try {
        first_definition = definition_data[0].text;
        first_definition = first_definition.split(':')[0];
      } catch (error) {
        first_definition = "Apparently this word doesn't have a definition.";
      }
      wordnik = $('#wordnik');
      html = wordnik.html();
      wordnik.css('background', '#fff');
      definition = render('wordnik_definition', {
        value: this.value,
        first_definition: first_definition
      });
      sections = [];
      _ref = this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        result = _ref[_i];
        relationship = result.relationshipType;
        words = (function() {
          var _j, _len2, _ref2, _results;
          _ref2 = result.words;
          _results = [];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            synonym = _ref2[_j];
            _results.push({
              synonym: synonym
            });
          }
          return _results;
        })();
        section = render('wordnik_results', {
          relationship: relationship,
          words: words
        });
        sections.push(section);
      }
      sections = sections.join('');
      wordnik.html(html + ("" + definition + " " + sections + " <hr />"));
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
    return Results;
  })();
  Usability = (function() {
    "A class that makes the site more usable.";    function Usability() {
      this.popover_fade();
      this.tab_switch();
      this.about_click();
      this.input_focus();
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
        non_active = $('.active').siblings().children('a');
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
        var html, input;
        html = $('html, body');
        input = $('.search-bar');
        event.preventDefault();
        html.animate({
          scrollTop: 1500
        });
        return input.focus();
      });
    };
    Usability.prototype.input_focus = function() {
      var search_focus;
      search_focus = function(event) {
        return $('.search-bar').focus();
      };
      $('#main').click(search_focus);
      return $('.popover').click(search_focus);
    };
    return Usability;
  })();
  Domains = (function() {
    "Handle interaction with clicking on domain names and modals.";    function Domains() {
      this.create_modal();
      this.click_available();
    }
    Domains.prototype.create_modal = function() {
      var modal;
      modal = $('#register-domain');
      return modal.modal({
        backdrop: true
      }).bind('hide', function() {
        var input;
        input = $('.search-bar');
        return input.focus();
      });
    };
    Domains.prototype.click_available = function() {
      var links;
      links = $('.domain');
      return links.live('click', function(event) {
        var modal, text;
        text = $(this).text();
        modal = $('#register-domain');
        console.log(text);
        console.log(new Referral(text));
        modal.modal('show');
        return false;
      });
    };
    return Domains;
  })();
  Referral = (function() {
    "Handle domain referral.";    function Referral(domain) {
      this.domain = domain;
      this.tld = domain.split('.')[1];
      return {
        godaddy: this.godaddy(),
        namecheap: this.namecheap()
      };
    }
    Referral.prototype.godaddy = function() {
      return "http://www.godaddy.com/domains/search.aspx?isc=IAPtdom1&domaintocheck=" + this.domain + "&tld=" + this.tld;
    };
    Referral.prototype.namecheap = function() {
      return "http://www.namecheap.com/domains/domain-name-search.aspx?formtype=domain&aff=23610&sld=" + this.domain;
    };
    return Referral;
  })();
  (function() {
    new Search;
    new Usability;
    return new Domains;
  })();
}).call(this);
