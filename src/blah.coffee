class TrelloThing
  constructor: ->
    $(document).ready =>
      Trello.deauthorize()
      $('#login a').click =>
        Trello.authorize(
          type: 'popup'
          success: this.loadBoards
          expiration: '1hour'
          scope:
            read: true
            write: true
        )

      self = this
      $('#boards a').live 'click', ->
        self.board = $(this).data('board')
        $('#boards').slideUp()
        self.loadCards(self.board.id)

      $('#cards a').live 'click', ->
        self.card = $(this).data('card')
        $('#cards').slideUp()
        self.loadChecklists(self.card.id)

      $('#checklists a').live 'click', ->
        self.checklist = $(this).data('checklist')
        $('#checklists').slideUp()
        self.showChecklist(self.checklist)

      $('#checklist button#create_card').live 'click', (event) ->
        event.preventDefault()
        self.makeCard()

      $('#checklist button#cancel').live 'click', (event) ->
        event.preventDefault()
        self.loadBoards()

  loadChecklists: (card_id) ->
    Trello.get "cards/#{card_id}/checklists", (checklists) ->
      list = $('#checklists')
      $.each checklists, (index, checklist) ->
        list.append $('<li></li>').append( $('<a></a>').data('checklist', checklist).attr('href', 'javascript:void(0)').text(checklist.name))

      list.show()

  showChecklist: (checklist) ->
    base = $('#checklist')
    base.append($('<h3></h3>').text("#{checklist.name} on card '#{this.card.name}' on board '#{this.board.name}'"))
    list = $('<ol></ol')
    $.each checklist.checkitems, (index, checkitem) ->
      list.append($('<li></li>').text(checkitem.name))

    base.append(list)

    buttons = $('<fieldset></fieldset>')
    buttons.append('<legend>Actions:</legend>')
    buttons.append($('<input></input>').attr('name', 'new_card_name').val(checklist.name))
    buttons.append($('<button></button>').attr('id', 'create_card').text('Create Card'))
    buttons.append($('<button></button>').attr('id', 'cancel').text('Cancel and start over'))

    base.append(buttons)

    base.show()

  makeCard: ->
    card_name = $('input[name=new_card_name]').val()
    card_name = this.checklist.name if card_name == ""
    list_id = this.card.idList
    description = ""

    Trello.post "cards", {idList: list_id, name: card_name, description: description}, (card) =>
      Trello.post "cards/#{card.id}/checklists", {value: this.checklist.id}, =>
        this.loadBoards()


  loadCards: (board_id) ->
    Trello.get "boards/#{board_id}/cards", (cards) =>
      list = $('#cards')
      $.each cards, (index, card) =>
        list.append $('<li></li>').append( $('<a></a>').data('card', card).attr('href', 'javascript:void(0)').text(card.name))

      list.show()

  loadBoards: ->
    $('#login').hide()
    $('#boards').hide().empty()
    $('#cards').hide().empty()
    $('#checklists').hide().empty()
    $('#checklist').hide().empty()
    Trello.get "members/me/boards", (boards) =>
      list = $('#boards')
      $.each boards, (index, board) =>
        list.append $('<li></li>').append($('<a></a>').data('board', board).attr('href', 'javascript:void(0)').text(board.name))

      list.show()


window.TrelloThing = TrelloThing


