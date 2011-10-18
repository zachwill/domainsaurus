class Search
  """A class to encapsulate search functionality."""

  constructor: ->
    @form = $('form')
    @input = $('.search-bar')
    @form.submit(this.perform_search)
    @input.popover({
      offset: 15,
      placement: 'above',
      trigger: 'manual',
    }).focus().popover('show')
    this.tab_click()
    # And, let's make the site more usable...
    new Usability

  tab_click: =>
    tabs = $('.tabs').children('li').find('a')
    input = @input
    tabs.click(->
      api = $(this).text().toLowerCase()
      input.focus().data(api: api)
      element = $('#' + api)
      # Set an insanely large scroll_height variable.
      scroll_height = 1000000
      element.animate(scrollTop: scroll_height)
    )

  domainr: (word) ->
    "http://domai.nr/api/json/search?q=#{ word }"

  wordnik: (word, type='related') ->
    api_key = '114c5c8013a30746b185b088e83026eaebebd4a243890747e'
    "http://api.wordnik.com/v4/word.json/#{ word }/#{ type }?api_key=#{ api_key }"

  perform_search: (event) =>
    input = @input
    value = input.val()
    if input.data('api') == 'wordnik'
      url = this.wordnik(value)
      @definitions = this.wordnik(value, 'definitions')
    else
      url = this.domainr(value)
    this.ajax_call(url)
    input.focus()
    return false

  ajax_call: (url) =>
    $.ajax({
      url: url,
      dataType: 'jsonp',
      success: this.results,
    })

  results: (data) =>
    console.log data
    api = @input.data('api')
    definitions = @definitions
    new Results(data, api, definitions)


class Results
  """A class to deal with results returned from API calls."""

  constructor: (data, api, definitions=undefined) ->
    @api = api
    @data = data
    @definitions_url = definitions
    this.populate(data)

  populate: (data) =>
    if @api == 'wordnik'
      this.wordnik_results(data)
    else
      this.domainr_results(data)

  domainr_results: (data) =>
    domainr = $('#domainr')
    html = domainr.html()
    results = data.results
    div = "<div class='row'>"
    for result in results
      if result.availability == 'available'
        label = "label success"
        symbol = '&#10003;'
      else
        label = "label"
        symbol = 'X'
      span = "<span class='#{ label }'>#{ symbol }</span>"
      div += "<p class='span4'><a href='#'>#{ result.domain }</a>#{ span }</p>"
    div += "</div><hr />"
    domainr.html(html + div)
    height = this.calculate_scroll('domainr')
    domainr.animate(scrollTop: height)

  wordnik_results: (data) =>
    @value = $('.search-bar').val()
    deferred_wordnik = this.get_wordnik_definition(@value)
    deferred_wordnik.then(this.create_html)

  get_wordnik_definition: (value) =>
    $.ajax({
      url: @definitions_url,
      dataType: 'jsonp',
    })

  create_html: (definition_data) =>
      try
        first_definition = definition_data[0].text
        first_definition = first_definition.split(':')[0]
      catch error
        first_definition = "Apparently this word doesn't have a definition."
      definition = """
        <div class='row'>
        <h3 class='span3'>#{ @value }</h3><p class='span6'>#{ first_definition }</p>
        </div>"""
      wordnik = $('#wordnik')
      html = wordnik.html()
      html += definition
      console.log @data
      for result in @data
        section = "<section>"
        word = "<div class='row'><h5 class='span3'>#{ result.relationshipType }</h5>"
        similar = "<div class='span6'>"
        for synonym in result.words
          similar += "<p>#{ synonym }</p>"
        similar += "</div>"
        section += word + similar + "</section>"
        html += section
      wordnik.html(html + "<hr />")
      height = this.calculate_scroll('wordnik')
      wordnik.animate(scrollTop: height)

  calculate_scroll: (element='domainr') ->
    if element == 'domainr'
      height = $('#domainr').children().length * 300
    else if element == 'wordnik'
      height = $('#wordnik').children().length * 700
    return height


class Usability
  """A class that makes the site more usable."""

  constructor: ->
    this.popover_fade()
    this.tab_switch()
    this.about_click()

  popover_fade: ->
    popover = $('.popover')
    popover.mouseenter( ->
      $(this).stop().animate(opacity: 1)
    ).mouseleave( ->
      $(this).stop().animate(opacity: .25)
    ).animate(opacity: .25)

  tab_switch: ->
    body = $('body')
    switch_functionality = (event) ->
      non_active = $('.active').siblings().find('a')
      input = $('.search-bar')
      if event.keyCode == 9
        event.preventDefault()
        non_active.click()
        input.focus()
    body.keydown( switch_functionality )

  about_click: ->
    about = $('.secondary-nav').children(':first').find('a')
    about.click( (event) ->
      html = $('html, body')
      event.preventDefault()
      html.animate(scrollTop: 1500)
    )


# CoffeeScript's version of the `main` function.
do ->
  new Search
