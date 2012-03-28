(function() {
  var TrelloThing;

  TrelloThing = (function() {

    function TrelloThing() {
      var _this = this;
      $(document).ready(function() {
        var self;
        Trello.deauthorize();
        $('#login a').click(function() {
          return Trello.authorize({
            type: 'popup',
            success: _this.loadBoards,
            expiration: '1hour',
            scope: {
              read: true,
              write: true
            }
          });
        });
        self = _this;
        $('#boards a').live('click', function() {
          self.board = $(this).data('board');
          $('#boards').slideUp();
          return self.loadCards(self.board.id);
        });
        $('#cards a').live('click', function() {
          self.card = $(this).data('card');
          $('#cards').slideUp();
          return self.loadChecklists(self.card.id);
        });
        $('#checklists a').live('click', function() {
          self.checklist = $(this).data('checklist');
          $('#checklists').slideUp();
          return self.showChecklist(self.checklist);
        });
        $('#checklist button#create_card').live('click', function(event) {
          event.preventDefault();
          return self.makeCard();
        });
        return $('#checklist button#cancel').live('click', function(event) {
          event.preventDefault();
          return self.loadBoards();
        });
      });
    }

    TrelloThing.prototype.loadChecklists = function(card_id) {
      return Trello.get("cards/" + card_id + "/checklists", function(checklists) {
        var list;
        list = $('#checklists');
        $.each(checklists, function(index, checklist) {
          return list.append($('<li></li>').append($('<a></a>').data('checklist', checklist).attr('href', 'javascript:void(0)').text(checklist.name)));
        });
        return list.show();
      });
    };

    TrelloThing.prototype.showChecklist = function(checklist) {
      var base, buttons, list;
      base = $('#checklist');
      base.append($('<h3></h3>').text("" + checklist.name + " on card '" + this.card.name + "' on board '" + this.board.name + "'"));
      list = $('<ol></ol');
      $.each(checklist.checkitems, function(index, checkitem) {
        return list.append($('<li></li>').text(checkitem.name));
      });
      base.append(list);
      buttons = $('<fieldset></fieldset>');
      buttons.append('<legend>Actions:</legend>');
      buttons.append($('<input></input>').attr('name', 'new_card_name').val(checklist.name));
      buttons.append($('<button></button>').attr('id', 'create_card').text('Create Card'));
      buttons.append($('<button></button>').attr('id', 'cancel').text('Cancel and start over'));
      base.append(buttons);
      return base.show();
    };

    TrelloThing.prototype.makeCard = function() {
      var card_name, description, list_id,
        _this = this;
      card_name = $('input[name=new_card_name]').val();
      if (card_name === "") card_name = this.checklist.name;
      list_id = this.card.idList;
      description = "";
      return Trello.post("cards", {
        idList: list_id,
        name: card_name,
        description: description
      }, function(card) {
        return Trello.post("cards/" + card.id + "/checklists", {
          value: _this.checklist.id
        }, function() {
          return _this.loadBoards();
        });
      });
    };

    TrelloThing.prototype.loadCards = function(board_id) {
      var _this = this;
      return Trello.get("boards/" + board_id + "/cards", function(cards) {
        var list;
        list = $('#cards');
        $.each(cards, function(index, card) {
          return list.append($('<li></li>').append($('<a></a>').data('card', card).attr('href', 'javascript:void(0)').text(card.name)));
        });
        return list.show();
      });
    };

    TrelloThing.prototype.loadBoards = function() {
      var _this = this;
      $('#login').hide();
      $('#boards').hide().empty();
      $('#cards').hide().empty();
      $('#checklists').hide().empty();
      $('#checklist').hide().empty();
      return Trello.get("members/me/boards", function(boards) {
        var list;
        list = $('#boards');
        $.each(boards, function(index, board) {
          return list.append($('<li></li>').append($('<a></a>').data('board', board).attr('href', 'javascript:void(0)').text(board.name)));
        });
        return list.show();
      });
    };

    return TrelloThing;

  })();

  window.TrelloThing = TrelloThing;

}).call(this);
