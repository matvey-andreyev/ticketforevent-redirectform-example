(function () {

    /* JS-код здесь для презентационных целей. На сбор адреса он не влияет. */

    var addTicket,
        deleteTicket,
        numerateTickets,
        addedTicketsCount = 0,
        setReferrerToSource;

    // Заполнение input#referrerSource
    setReferrerToSource = function setReferrerToSource() {
        if (document.referrer) {
            document.getElementById('referrerSource').value = document.referrer;
        }
    }

    // Заполнение input#linkerParam данными из первого счетчика Гугл Аналитикс
    setLinkerParam = function setLinkerParam() {
        if (typeof ga === 'function' && typeof ga.getAll === 'function' && ga.getAll().length) {
            document.getElementById('linkerParam').value = ga.getAll()[0].get('linkerParam').split('=').pop();
        }
    }

    // Добавление билета в форму.
    addTicket = function addTicket() {
        var newEl = document.createElement('div'),
            fieldset = document.getElementById('fieldSetToCopy'),
            insertPlace = this.parentNode; // div.actions в нашем случае

        newEl.classList.add('added-ticket');
        newEl.innerHTML = fieldset.outerHTML.replace('id="fieldSetToCopy"', '').replace('types[1]', 'types[00000000]');

        insertPlace.parentNode.insertBefore(newEl, insertPlace);

        newEl.getElementsByClassName('deleteTicket')[0].onclick = deleteTicket;

        numerateTickets();
        return false; //

    }

    // Удаление билета из формы
    deleteTicket = function deleteTicket() {
        var victim = this.parentNode.parentNode;
        victim.parentNode.removeChild(victim);
        numerateTickets();
    }

    numerateTickets = function numerateTickets() {
        var tickets = document.querySelectorAll('.ticket'),
            number,
            inputs;
        for (var i = 0; i < tickets.length; i++) {
            number = tickets[i].getElementsByTagName('legend')[0].getElementsByTagName('span')[0];
            number.innerHTML = i + 1;
            inputs = tickets[i].getElementsByTagName('input');
            for (var j = 0; j < inputs.length; j++) {
                inputs[j].setAttribute('name', inputs[j].getAttribute('name').replace(/\[\d+\]/, '[' + (i + 1) + ']'));
            }
        }
    }

    document.getElementById('addTicket').onclick = addTicket;
    numerateTickets();
    setReferrerToSource();
    setLinkerParam();

})();


$(function () {
    var submitHandler,
        createTicketForEventIframe,
        removeTicketForEventIframe,
        ticketForEventFrameID = 'TFE_IFRAME',
        notify,
        removeNotification;


    notify = function(text, options){
        var notificationsPlace = document.getElementById('notifications_place'),
            newNote,
            delay = 15000; // ms

        if( !notificationsPlace ){
            notificationsPlace = document.createElement('div');
            notificationsPlace.id='notifications_place';
            document.getElementsByTagName('body')[0].appendChild(notificationsPlace);
        }

        newNote = document.createElement('div');
        newNote.innerHTML = text;
        newNote.className = 'note';

        if(options && options.delay){
            delay = options.delay;
        }

        if(options && options.frameRemover){
            newNote.classList.add('frame-remover');
            newNote.onclick = removeTicketForEventIframe;
        }
        $(notificationsPlace).append(newNote);

        setTimeout(function(){
            newNote.classList.add('show-progress');
        }, 50);

        setTimeout(function(){
            removeNotification(newNote);
        },delay);

    }

    removeNotification = function(el){
        el.parentNode.removeChild(el);
    }

    createTicketForEventIframe = function (url) {
        var ifr = document.getElementById(ticketForEventFrameID);
        if (!ifr) {
            ifr = document.createElement('iframe');
            ifr.src = url;
            ifr.id = ticketForEventFrameID;
            // Some Apple browsers need iframes to exist and be not 0-sized
            ifr.width = 10;
            ifr.height = 10;
            $(ifr).css({
                'position': 'fixed',
                'box-shadow':'0 0 0 10px green',
                'top': 10 + 'px', // change this to negatives to hide the frame
                'left': 10 + 'px',
                'z-index': 10,
            });
            document.getElementsByTagName('body')[0].appendChild(ifr);
        }
    }

    removeTicketForEventIframe = function () {
        var frameRemovers = document.getElementsByClassName('frame-remover');
        $('#' + ticketForEventFrameID).remove();
        for(var i = 0; i<frameRemovers.length; i++){
            frameRemovers[i].parentNode.removeChild(frameRemovers[i]);
        }
    }

    submitHandler = function (e) {
        var $form = $(this),
            action = $form.attr('action'),
            data = $form.serialize();

        $.ajax({
            'url': action,
            'data': data,
            'dataType': 'json',
            'type': 'post',
            'success': function (response) {
                if (response.success && response.url) {
                    createTicketForEventIframe(response.url);
                } else {
                    console.log('Неправильный ответ от save.php:');
                    console.log(response);
                }
            },
            'error': function () {
                console.log('AJAX error, callback arguments:');
                console.log(arguments);
            }
        });

        e.preventDefault;
        return false;

    }

    postMessagesHandler = function (e) {
        if (e && e.data && e.data.type) {
            switch (e.data.type) {
                case "ticketforevent_loaded_notification" :
                    notify('Фрейм загрузился.');
                    break;
                case "ticketforevent_error_notification":
                    notify("Ошибка внутри фрейма, e.data " + JSON.stringify(e.data));
                    break;
                case "ticketforevent_order_info":
                    notify("Заказ размещён! " + JSON.stringify(e.data));
                    notify("Нажмите, чтобы удалить iframe", {delay:360000, frameRemover:true});
                default:
                    void (0);
            }
        }
    }

    window.addEventListener('message', postMessagesHandler);

    $('form').bind('submit', submitHandler);

})