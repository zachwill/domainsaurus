render = (id, data) ->
  """A simple function to render ICanHaz.js templates."""
  return window.ich[id](data, true)


class Search
  """A class to encapsulate search functionality."""

  constructor: ->
    @form = $('form')
    @input = $('.search-bar')
    @form.submit(@perform_search)
    @input.popover({
      offset: 15,
      placement: 'above',
      trigger: 'manual',
    }).focus().popover('show')
    @tab_click()

  tab_click: =>
    tabs = $('.tabs').children('li').find('a')
    input = @input
    tabs.click( ->
      api = $(this).text().toLowerCase()
      input.focus().data(api: api)
      element = $('#' + api)
      # Set an insanely large scroll_height variable.
      scroll_height = 1000000
      element.animate(scrollTop: scroll_height)
    )

  domainr: (word) ->
    "https://domainr.com/api/json/search?q=#{ word }&client_id={your-mashape-key}"

  wordnik: (word, type='related') ->
    api_key = '114c5c8013a30746b185b088e83026eaebebd4a243890747e'
    word = word.toLowerCase()
    "http://api.wordnik.com/v4/word.json/#{ word }/#{ type }?api_key=#{ api_key }"

  perform_search: (event) =>
    input = @input
    $('.submit').css('background', 'url(/static/img/rotate.gif) no-repeat center center')
    value = input.val()
    if not value
        return false
    if input.data('api') == 'wordnik'
      url = @wordnik(value)
      @definitions = @wordnik(value, 'definitions')
    else
      url = @domainr(value)
    @ajax_call(url)
    input.focus()
    return false

  ajax_call: (url) =>
    input = @input
    definitions = @definitions
    $.ajax({
      url: url,
      dataType: 'jsonp',
    }).then( (data) ->
      api = input.data('api')
      new Results(data, api, definitions)
    )


class Results
  """A class to deal with results returned from API calls."""

  constructor: (data, api, definitions=undefined) ->
    @api = api
    @data = data
    @definitions_url = definitions
    @populate(data)
    $('.submit').css('background', '')

  populate: (data) =>
    if @api == 'wordnik'
      @wordnik_results(data)
    else
      @domainr_results(data)

  domainr_results: (data) =>
    domainr = $('#domainr')
    html = domainr.html()
    results = data.results
    domainr.css('background', '#fff')
    templates = []
    for result in results
      if result.availability == 'available'
        label = "label success"
        symbol = '&#10003;'
      else
        label = "label"
        symbol = 'X'
      domain = result.domain
      template = render('domainr_results', {
        label: label,
        symbol: symbol,
        domain: domain,
      })
      templates.push(template)
    templates = templates.join('')
    div = render('domainr_div', templates: templates)
    domainr.html(html + div)
    height = @calculate_scroll('domainr')
    domainr.animate(scrollTop: height)

  wordnik_results: (data) =>
    @value = $('.search-bar').val()
    deferred_wordnik = @get_wordnik_definition(@value)
    deferred_wordnik.then(@create_wordnik_html)

  get_wordnik_definition: (value) =>
    $.ajax({
      url: @definitions_url,
      dataType: 'jsonp',
    })

  create_wordnik_html: (definition_data) =>
      try
        first_definition = definition_data[0].text
        first_definition = first_definition.split(':')[0]
      catch error
        first_definition = "Apparently this word doesn't have a definition."
      wordnik = $('#wordnik')
      html = wordnik.html()
      wordnik.css('background', '#fff')
      definition = render('wordnik_definition', {
        value: @value,
        first_definition: first_definition,
      })
      sections = []
      for result in @data
        relationship = result.relationshipType
        words = ({synonym: synonym} for synonym in result.words)
        section = render('wordnik_results', {
          relationship: relationship,
          words: words,
        })
        sections.push(section)
      sections = sections.join('')
      wordnik.html(html + "#{ definition } #{ sections } <hr />")
      height = @calculate_scroll('wordnik')
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
    @popover_fade()
    @tab_switch()
    @about_click()
    @input_focus()

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
      non_active = $('.active').siblings().children('a')
      input = $('.search-bar')
      if event.keyCode == 9
        event.preventDefault()
        non_active.click()
        input.focus()
    body.keydown(switch_functionality)

  about_click: ->
    about = $('.secondary-nav').children(':first').find('a')
    about.click( (event) ->
      html = $('html, body')
      input = $('.search-bar')
      event.preventDefault()
      html.animate(scrollTop: 1500)
      input.focus()
    )

  input_focus: ->
      search_focus = (event) ->
          $('.search-bar').focus()
      $('#main').click(search_focus)
      $('.popover').click(search_focus)


class Domains
  """Handle interaction with clicking on domain names and modals."""

  constructor: ->
    @create_modal()
    @click_available()

  create_modal: ->
    modal = $('#register-domain')
    modal.modal(backdrop: true).bind('hide', ->
      input = $('.search-bar')
      input.focus()
    )

  click_available: ->
    links = $('.domain')
    links.live('click', (event) ->
      text = $(this).text()
      modal = $('#register-domain')
      referral = new Referral(text)
      buttons = render('modal_footer', referral)
      modal.find('.modal-footer').html(buttons)
      modal.modal('show')
      return false
    )


class Referral
  """Handle domain referral."""

  constructor: (domain) ->
    @domain = domain
    @tld = domain.split('.')[1]
    return godaddy: @godaddy(), namecheap: @namecheap()

  godaddy: ->
    "http://www.godaddy.com/domains/search.aspx?isc=IAPtdom1&domaintocheck=#{ @domain }&tld=#{ @tld }"

  namecheap: ->
    "http://www.namecheap.com/domains/domain-name-search.aspx?formtype=domain&aff=23610&sld=#{ @domain }"


# CoffeeScript's version of the `main` function.
do ->
  new Search
  new Usability
  new Domains
