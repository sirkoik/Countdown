function Timer(timerBody) {
    var _self = this;
    var timers = {};
    
    this.init = function() {
        // try to get the data from localStorage and / or URI.
        var timerSuccess = false;
        
        try {
            timers = JSON.parse(localStorage.getItem('timers'));
            timerSuccess = true;
        } catch(e) {

        }

        if (timers === null || !timerSuccess) {
            timers = {index: 0, timers: {}};
            
            // if countdown data exists in query string, use it.
            urlParams = new URLSearchParams(location.search);
            const uriData = urlParams.get('data');
            
            if (uriData && uriData != null) {
                timers = JSON.parse(atob(uriData));
                this.save();
            }
        }
        
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
            outputFunction: 'outputText',
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
        
        timerBody.manageAdditions(obj);
        
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
        
        // Generate URL with saved data in it.
        $('#btn-gen-url').click(function() {
            var str = localStorage.getItem('timers');
            var base64 = btoa(str);
            var url = document.URL.match(/[^\?]+/) + '?data=' + base64;
            
            //prompt('Copy this and paste it into the URL bar. Then bookmark to save your countdowns and settings.', url);
            
            var gotoNew = confirm('Now navigating to newly generated counter URL.');
            if (gotoNew) location.href = url;
            

            
            /* decoding code 
            uriData = base64;
            
            console.log(uriData);
            
            var decoded = atob(uriData);//JSON.parse(atob(uriData));
            
            console.log(JSON.parse(decoded));
            
            */
        });
        
        // clear local storage.
        $('#btn-clear-local').click(function() {
            var remTimers = confirm('This will remove the timer data from localStorage. It will have no effect on the data stored via URL. Local changes made before generating a new URL will be lost.');
            if (remTimers) {
                localStorage.removeItem('timers');
                location.reload();
            }
        })
        
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
                    timerBody.manageAdditions(obj);
                    timerBody.changeType(obj, 'seconds');
                    obj.outputFunction = 'outputText';
                    _self.save();
                break;
                    
                case 'command-type-simpleDHMS':
                    timerBody.manageAdditions(obj);
                    timerBody.changeType(obj, 'simpleDHMS');
                    obj.outputFunction = 'outputText';
                    _self.save();
                break;
                    
                case 'command-type-textDHMS':
                    timerBody.manageAdditions(obj);
                    timerBody.changeType(obj, 'textDHMS');
                    obj.outputFunction = 'outputText';
                    _self.save();
                break;
                    
                case 'command-type-bar':
                    timerBody.manageAdditions(obj, 'outputBar');
                    timerBody.changeType(obj, 'bar');
                    obj.outputFunction = 'outputBar';
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