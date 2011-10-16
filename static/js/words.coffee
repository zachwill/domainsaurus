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
    )

  domainr: (word) ->
    "http://domai.nr/api/json/search?q=#{ word }"

  wordnik: (word, type='related') ->
    api_key = '114c5c8013a30746b185b088e83026eaebebd4a243890747e'
    "http://api.wordnik.com/v4/word.json/#{ word }/#{ type }?api_key=#{ api_key }"

  perform_search: (event) =>
    value = @input.val()
    if @input.data('api') == 'wordnik'
      url = this.wordnik(value)
    else
      url = this.domainr(value)
    this.ajax_call(url)
    return false

  ajax_call: (url) =>
    $.ajax({
      url: url,
      dataType: 'jsonp',
      success: this.results,
    })

  results: (data) =>
    api = @input.data('api')
    new Results(data, api)

  input_check: =>
    value = @input.val()
    if value.length >= 2
      window._value = value
      setTimeout(this.check_value, 50)

  check_value: =>
    value = @input.val()
    if value == window._value
      this.perform_search()


class Results
  """A class to deal with results returned from API calls."""

  constructor: (data, api) ->
    @api = api
    @data = data
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
      span = "<span class='#{ results.availability }'></span>"
      html += "<p class='span4'>#{ result.domain } #{ span }</p>"
    div += "</div><hr />"
    domainr.html(html + div)
    height = this.calculate_scroll(domainr)
    domainr.animate(scrollTop: height)
    console.log(results)

  wordnik_results: (data) =>
    console.log(data)

  calculate_scroll: (element) ->
    height = 0
    element.children().each( ->
      height += $(this).height()
    )
    return height


class Usability
  """A class that makes the site more usable."""

  constructor: ->
    this.popover_fade()

  popover_fade: ->
    fade = ->
      popover = $('.popover')
      popover.mouseenter( ->
        $(this).stop().animate(opacity: 1)
      ).mouseleave( ->
        $(this).stop().animate(opacity: 0.3)
      ).animate(opacity: 0.3)
    setTimeout(fade, 1500)


# CoffeeScript's version of the `main` function.
do ->
  new Search
