    function play(id) {
        var audio = document.getElementById(id);
        if (audio.paused) {
            audio.play();
        }else{
            audio.pause();
            audio.currentTime = 0
        }
    }

    function stopp(id) {
        var audio = document.getElementById(id);
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0
        }else{
            ; 
            
        }
    }

    function pause(id) {
        var audio = document.getElementById(id);
        if (!audio.paused) {
            audio.pause();
        }else{
            ; 
        }
    }
