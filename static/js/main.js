GIPHY_API_KEY = 'dc6zaTOxFJmzC';
GIPHY_SEARCH_ENDPOINT = 'http://api.giphy.com/v1/gifs/search';


$(document).ready(function() {

    // listen on microphone
    // take audio, query for keywords
    // use keywords as search in giphy
    // change gif to first result
    // probably debounce the changing of the gif to avoid flicker

    var debouncedGiphy = debounce(function(partialTranscript, finalTranscript) {
        console.log(partialTranscript);
        $.ajax({
            method: 'GET',
            url: '/keywords',
            data: {
                text: partialTranscript
            },
            dataType: 'JSON',
            success: function(data) {

                if (data.keywords === null) {
                    return;
                }

                $('#text').text(data.keywords);
                console.log(data.keywords);

                $.ajax({
                    method: 'GET',
                    url: GIPHY_SEARCH_ENDPOINT,
                    data: {
                        q: data.keywords,
                        'api_key': GIPHY_API_KEY
                    },
                    dataType: 'JSON',
                    success: function(data) {
                        if (data.data.length > 0) {
                            new_src = data.data[0].images.downsized.url;
                            if ($('#gif').attr('src') !== new_src) {
                                $('#gif').attr('src', data.data[0].images.downsized.url);
                            }
                        }
                    }
                });
            }
        });
    }, 300);

    if (!('webkitSpeechRecognition' in window)) {
        upgrade();
    } else {
        startRecognition(debouncedGiphy);
    }

});




function startRecognition(cb) {

    var final_transcript = '';
    // var recognizing = false;
    var ignore_onend;


    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = function() {
        // recognizing = true;
    };
    recognition.onerror = function(event) {
      ignore_onend = true;
    };
    recognition.onend = function() {
        // recognizing = false;
        console.warn('ONEND');
        if (ignore_onend) {
            return;
        }
        if (!final_transcript) {
            return;
        }
        setTimeout(function() {
            startRecognition(cb);
        }, 500);
    };
    recognition.onresult = function(event) {
        var interim_transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        if (interim_transcript !== '') {
            cb(interim_transcript, final_transcript);
        }
    };
    recognition.start();
    return recognition;
}



function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};