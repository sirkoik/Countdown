function Timer(timerBody) {
    var _self = this;
    var timers = {};
    
    this.init = function() {
        try {
            timers = JSON.parse(localStorage.getItem('timers'));
        } catch(e) {
            timers = {index: 0, timers: {}};
        }

        if (timers === null) timers = {index: 0, timers: {}};
        
        if ($.isEmptyObject(timers)) return false;
        
        $.each(timers.timers, function(k, v) {
            timerBody.startTimer(v);
            _self.addToDOM(v);
        });
    }
    
    
    this.save = function() {
        localStorage.setItem('timers', JSON.stringify(timers));
    }
    
    this.add = function (title, desc, t0, t1) {        
        timers.index = timers.index + 1 || 1;
                
        var obj = {
            index: timers.index,
            title: title,
            desc: desc,
            added: new Date().getTime(),
            t0: new Date(t0).getTime(),
            t1: new Date(t1).getTime(),
            func: 'simpleDHMS',
            notes: ''
        };
        
        timerBody.startTimer(obj);
                
        timers.timers['timer'+timers.index] = obj;
        
        console.log(timers);
        this.save();
        
        this.addToDOM(obj);
        console.log(timers);
    }
    
    this.remove = function(index) {
        delete timers.timers['timer'+index];
        
        this.save();
    }
    
    // add a timer object to DOM
    this.addToDOM = function(obj) {
        var $timer = $('#timer-template').clone();
        $timer.appendTo('#timers');        
        
        $timer.attr('id', 'timer'+obj.index);
        
        $timer.find('.timer-title').html(obj.title).attr('title', 'Added ' + new Date(obj.added));
        $timer.find('.timer-desc').html(obj.desc);
        
        $timer.show();        
    }
    
    this.getTimers = function() {
        return timers;
    }
    
    this.bindEm = function () {
        $('#btn-add').click(function() {
            var info = prompt('Enter Title, Description, t0, t1', 'Lorem ipsum et dolor,A description,some time 0, some time 1');
            if (!info) return false;
            
            var infoArr = info.split(',');
            _self.add(infoArr[0], infoArr[1], infoArr[2], infoArr[3]);
        });
        
        $('#timers').on('click', '.timer-dropdown', function(e) {
            var id = $(this).parents('.timer').attr('id');
            if ($('#timer-menu').is(':visible') && $('#timer-menu').attr('timerid') == id) {
                $('#timer-menu').hide();
                return false;
            }
            
            $('#timer-menu').css({left: e.clientX, top: e.clientY});
            
            $('#timer-menu').show();
            //var id = $(this).parents('.timer').attr('id');
            $('#timer-menu').attr('timerid', id);
            return false;
            
            //console.log(id);
            

        });
        
        $('#timer-menu div').click(function() {
            var id = $(this).parent().attr('timerid');
            var cmd = $(this).attr('id');
            
            var obj = timers.timers[id];
            
            switch(cmd) {
                case 'command-delete':
                    var title = obj.title;
                    var removeIt = confirm('Remove ' + title + '?');
                    if (!removeIt) break;

                    _self.remove(timers.timers[id].index);
                    //$(this).parents('.timer').remove();                    
                    $('#'+id).remove();
                break;
                    
                case 'command-type-seconds':
                    timerBody.changeType(obj, 'seconds');
                    _self.save();
                break;
                    
                case 'command-type-simpleDHMS':
                    timerBody.changeType(obj, 'simpleDHMS');
                    _self.save();
                break;
                    
                case 'command-type-textDHMS':
                    timerBody.changeType(obj, 'textDHMS');
                    _self.save();
                break;
                    
                case 'command-type-edit-title':
                    var title = prompt('New title? ' + obj.title + ', ' + id, obj.title); 
                    if (title) {
                        timerBody.editTitle(obj, title);
                        $('#'+id).find('.timer-title').html(title);
                        _self.save();
                    }
                break;
                    
                case 'command-type-edit-desc':
                    var desc = prompt('New description? ' + obj.desc + ', ' + id, obj.desc); 
                    if (desc) {
                        timerBody.editDesc(obj, desc);
                        $('#'+id).find('.timer-desc').html(desc);
                        _self.save();
                    }
                break;                    
            }
            
            $('#timer-menu').hide();
        });
        
        $(document).click(function(e) {
            if (e.target != $('#timer-menu')[0]) $('#timer-menu').hide();
        });
    }
}