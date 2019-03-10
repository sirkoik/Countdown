function TimerBodies() {
    var _self = this;
    
    var intervals = {};
    
    
    this.DHMS0 = function(t0, t1) {
        var sdObj = {};
        
        //var t1 = new Date().getTime();
        var s = Math.round((t1-t0) / 1000);
        var sign = s < 0? -1 : 1;
        
        s = Math.abs(s);

        
        var d = Math.floor(s / 86400);
        if (d > 0) sdObj.d = d;
 
        var sRem = s % 86400;
        var h = Math.floor(sRem / 3600);

        if (h > 0 || d > 0) sdObj.h = h;

        var m = Math.floor(sRem % 3600 / 60);        
        
        if (h > 0 || d > 0 || m > 0) sdObj.m =m;
        
        sRem2 = sRem % 60;
        sdObj.s = sRem2;
        
        sdObj.sign = sign;
        
        return sdObj;
    }
    
    // simple day, hour, minute, second
    this.DHMSfunct = function(t0, t1) {
        var curTime = new Date().getTime();
        obj1 = this.DHMS0(t0, curTime);
        obj2 = this.DHMS0(t1, curTime);
        
        return [obj1, obj2];
    }
    
    this.DHMSnum = function(t0, t1) {
        var obj = this.DHMSfunct(t0, t1);
        
        var sArr = [];
        
        for (var x = 0; x < obj.length; x++) {
            var o = obj[x];
            var str = '';

            str += o.sign < 1? '-' : '+';
            if (o.d) str += this.zp(o.d) + ':';
            if (o.h) str += this.zp(o.h) + ':';
            if (o.m) str += this.zp(o.m) + ':';
            if (o.s) str += this.zp(o.s);

            var signStr = o.sign < 0? 'until' : 'since';
            
            sArr.push({sign: o.sign, signStr: signStr, outString: str});
        }
        
        return sArr;
    }
    
    this.simpleDHMS = function(t0, t1) {
        return this.DHMSnum(t0, t1);
    }
    
    this.textDHMS = function(t0, t1) {
        var obj = this.DHMSfunct(t0, t1);

        var sArr = [];
        
        for (var x = 0; x < obj.length; x++) {
            var o = obj[x];
            var str = '';                
            if (o.d) str += this.zp(o.d) + 'd ';
            if (o.h) str += this.zp(o.h) + 'h ';
            if (o.m) str += this.zp(o.m) + 'm ';
            if (o.s) str += this.zp(o.s) + 's ';

            var signStr = o.sign < 0? 'until' : 'since';
            
            sArr.push({sign: o.sign, signStr: signStr, outString: str});
        }
        
        return sArr;
    }
    
    this.bar = function(t0, t1) {
        //var obj = this.DHMSfunct(t0, t1);
        var curTime = new Date().getTime();
        var l = t1 - t0;
        var lCur = curTime - t0;
        
        var pct = lCur / l;
        
        return Math.round(10000 * pct, 2) / 100;
    }
    
    // pie chart calc function
    // return a fraction of 1 for css "turn"
    this.pie = function(t0, t1) {
        //var obj = this.DHMSfunct(t0, t1);
        var curTime = new Date().getTime();
        var l = t1 - t0;
        var lCur = curTime - t0;
        
        var pct = lCur / l;
        return pct;
    }
    
    
    this.seconds0 = function(t0, t1) {
        var math = Math.round((t1 - t0) / 1000);
        
        var sign = math < 0? -1 : 1;
        var signT = sign < 0? 'T' : 'T+';
        var signStr = math < 0? 'until' : 'since';
        var readable = signT + math + ' seconds';
        return {sign: sign, signStr: signStr, outString: readable};        
    }
    
    this.seconds = function(t0, t1) {
        var curTime = new Date().getTime();
        obj1 = this.seconds0(t0, curTime);
        obj2 = this.seconds0(t1, curTime);
        
        return [obj1, obj2];           
    }
    
    // Fix: stop, start output function intervals on change.
    this.startTimer = function(obj) {
        intervals['interval'+obj.index] = setInterval(function() {
            
            // checks output function each time.
            var outputFunct = obj.outputFunction? obj.outputFunction : 'outputText';
            //_self.outputText(obj);
            _self[outputFunct](obj);
            
            // BLINK-1 disable programmatic blinking for now
            //_self.blink(obj);
        }, 500);
    }
    
    this.clearTimer = function(obj) {
        clearInterval(intervals['interval'+obj.index]);
    }
    
    // outputText: output text.
    this.outputText = function(obj) {
        var ret = _self[obj.func](obj.t0, obj.t1);

        var html = (ret[0].outString === ret[1].outString)? ret[0].outString + ' ' + ret[0].signStr + ' ' + new Date(obj.t0) : ret[0].outString + ' ' + ret[0].signStr + ' ' + new Date(obj.t0) + '<br/><br/>' + ret[1].outString + ' ' + ret[1].signStr + ' ' + new Date(obj.t1);
        $('#timer'+obj.index).find('.timer-body').find('.text').html(html);
        
    }
    
    // outputBar: output a bar graph.
    this.outputBar = function(obj) {
        var ret = _self[obj.func](obj.t0, obj.t1);
        var $timerBody = $('#timer'+obj.index).find('.timer-body');
        $timerBody
            .attr('title',ret + '%')
            .find('.bar').css('width', ret + '%')
        $timerBody.find('.bar-pct').html(ret + '%');
        
        // text goes with bar. prevent the text from running off the right side at high values.
        if (ret < 75) $timerBody.find('.bar-pct').css('left', ret + '%')
    }
    
    // outputPie: output a pie graph.
    this.outputPie = function(obj) {
        // pie output
       var ret = _self[obj.func](obj.t0, obj.t1);
        var $timerBody = $('#timer'+obj.index).find('.timer-body');

        var retReadable = Math.round(10000 * ret, 2) / 100;;
        $timerBody
            .attr('title',retReadable + '%');        
        
        var pieCSS = ret > 0.5? { transform: 'rotate('+(ret-0.5)+'turn)' } : {  transform: 'rotate('+ret+'turn)', 'background-image': 'linear-gradient(to right, transparent 50%, #54798E 0' };
        
        $timerBody.find('.pie-before').css(pieCSS);
        $timerBody.find('.pie-pct').html(retReadable + '%');
    }
    
    
    this.changeType = function(obj, toType) {
        obj.func = toType;
    }
    
    // manageAdditions: Set up the initial environment for a specific type of output.
    // @outFunc: supply an output function when necessary (good when doing this out of order)
    this.manageAdditions = function(obj, outFunc) {
        var $timerBody = $('#timer'+obj.index).find('.timer-body');
        
        var outFunc = outFunc? outFunc : obj.outputFunction;

        switch(outFunc) {
            case 'outputText': 
            default:
                $timerBody
                    .empty()
                    .append('<div class="text"></div>');
            break;
            case 'outputBar':
                $timerBody
                    .empty()
                    .append('<div class="bar"></div>')
                    .append('<div class="bar-pct"></div>');
            break;
            case 'outputPie':
                $timerBody
                    .empty()
                    .append('<div class="pie-before"></div><div class="pie"></div>')
                    .append('<div class="pie-pct"></div>');
            break;
        }
        
        // append blinker pip.
        $timerBody.append('<div class="blinker-fade"></div>');
    }
    
    // BLINK-1 disable programmatic blinking for now
    this.blink = function(obj) {
//        var $timerBody = $('#timer'+obj.index).find('.timer-body');
//        $timerBody.find('.blinker').toggle();
    }
    
    this.zp = function(num) {
        return this.zeroPad(num);
    }
    this.zeroPad = function(num) {
        return (num < 10)? '0' + num : num;
    }
    
    this.editTitle = function(obj, newTitle) {
        if (!newTitle || newTitle == '') return false;
        obj.title = newTitle;
    }
    
    this.editDesc = function(obj, newDesc) {
        if (!newDesc || newDesc == '') return false;
        obj.desc = newDesc;
    }   

}