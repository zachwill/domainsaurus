domainr = (word) ->
  # Return the appropriate Domainr API URL.
  "http://domai.nr/api/json/search?q=#{ word }"

wordnik = (word, type='definitions') ->
  # Return the appropriate Wordnik API URL.
  api_key = '114c5c8013a30746b185b088e83026eaebebd4a243890747e'
  "http://api.wordnik.com/v4/word.json/#{ word }/#{ type }?api_key=#{ api_key }"

search = (event) ->
  # Fire event on word search -- for either Domainr or Wordnik.
  input = $('input')
  if input.data('wordnik')
    url = wordnik(input.val())
  else if input.data('domainr')
    url = domainr(input.val())
  $.ajax({
    url: url
    dataType: 'json'
    success: populate
  })

populate = (data) ->
  # Work with returned JSON data from API calls.
  data

input_check = ->
  # If the input value is a certain length, go ahead and perform a search.
  value = $('input').val()
  if (value.length >= 2)
    window._value = value
    setTimeout(check_value, 50)

check_value = ->
  # A timeout check to see that the input value has stayed the same.
  value = $('input').val()
  if value == window._value
    search
