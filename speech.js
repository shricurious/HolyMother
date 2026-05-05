window.onload = function () {
    var params = new URLSearchParams(window.location.search);
    var languageCode = params.get("language_code") || "hi-IN";
    var srtLanguage = params.get("srt_language") || languageCode.split("-")[0];
    var audioBasePath = params.get("audio_base") || ("speech/" + languageCode);
    var subtitlePath = params.get("srt_file") || ("video/RPuLKaEqRH0/" + srtLanguage + "/captionFile_" + srtLanguage + ".srt");
    var saveFileName = params.get("save_file") || ("captionFile_" + srtLanguage + "_1.srt");
    var originalSubtitlePath = params.get("original_srt_file") || "captionFile_en-EN.srt";
    var storageKey = "changedSubtitles:" + languageCode;

    var video = document.getElementById("video");
    var subtitleContainer = document.getElementById("subtitles");
   // subtitleContainer.style.display = "center";
    var olSubtitlesTA = document.getElementById("OLsubtitlesTA");
     olSubtitlesTA.style.display = "none";
     olSubtitlesTA.style.float = "left";
     olSubtitlesTA.style.width ="50%";
     olSubtitlesTA.style.overflow = "hidden";
    var subtitlesTextArea = document.getElementById("subtitles-textarea");
     subtitlesTextArea.style.width ="100%";
    var submitButton = document.getElementById("submit");
    var playTlAudioButton = document.getElementById("playTlAudio");
    var pauseTlAudioButton = document.getElementById("pauseTlAudio");
    pauseTlAudioButton.style.display = 'none';
    var showOLSubtitlesButton = document.getElementById("showOLSubtitles");
    var hideOLSubtitlesButton = document.getElementById("hideOLSubtitles");
    var resetButton = document.getElementById("reset");
    var showDiff = document.getElementById("showDiff");
    var subtitles = []; // initialize empty array
    var subtitleIndex = 0; // initialize the subtitle index to zero
    var totalLines =0;
    var savedValue = localStorage.getItem(storageKey);
    var videoPaused = false;
    var subtext="";
    var subtextOL="";
    //this is neede for diff to work
    var context = document.getElementById("context");
    context.style.display = "none";
    //var speedSlider = document.getElementById("speed-slider");
    var tlaudio = document.getElementById("tlaudio");
    var position = 1;
	  var startTime;
	  var endTime;
    var playTranslations = false;
    var looper = 0;
   
   
  
    // load the subtitle file into the textarea
    var subtitleFile = new XMLHttpRequest();
    subtitleFile.open("GET", subtitlePath);
    subtitleFile.onload = function () {
      if (subtitleFile.status === 200) {
         subtext = subtitleFile.responseText;
         olSubtitlesTA.innerHTML = subtext;
        if (!(savedValue === null || savedValue.trim() === "")){
          subtitlesTextArea.innerHTML = savedValue;
        }else{
        subtitlesTextArea.innerHTML = subtext;
        }
        subtitles = parseSRT(subtext);
        totalLines = (subtitles.length * 5) ;
      } else {
        console.error("Failed to load SRT file");
      }
    };
    subtitleFile.send();
  
    // parse the SRT file
    function parseSRT(text) {
      var srt = text.trim();
      srt = srt.replace(/\r\n|\r|\n/g, "\n"); // normalize line breaks
      var parts = srt.split("\n\n");
      var subtitles = [];
      actualLines= parts.length;
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i].trim();
        var lines = part.split("\n");
  
        if (lines.length >= 2) {
          var index = lines[0];
          var timestamp = lines[1];
          var text = lines.slice(2).join("\n");
  
          var start = parseTimestamp(timestamp.split("-->")[0]);
          var end = parseTimestamp(timestamp.split("-->")[1]);
  
          subtitles.push({ index: index, start: start, end: end, text: text });
        }
      }
  
      return subtitles;
    }
  
    // parse the timestamp in the format hh:mm:ss,ms
    function parseTimestamp(timestamp) {
      var parts = timestamp.split(":");
      var seconds = parts[2].split(",")[0];
      var milliseconds = parts[2].split(",")[1];
      return (
        parseFloat(parts[0]) * 3600 +
        parseFloat(parts[1]) * 60 +
        parseFloat(seconds) +
        parseFloat(milliseconds) / 1000
      );
    }
  
    video.ontimeupdate = function () {

      if(playTranslations){
        playTranslatedAudio();
      }else{
      var currentTime = video.currentTime;
      if(currentTime >= startTime &&  currentTime <= endTime){
        return;
      }else{
      for (var i = 0; i < subtitles.length; i++) {
        if (
          currentTime >= subtitles[i].start &&
          currentTime <= subtitles[i].end
        ) {
          startTime = subtitles[i].start;
          endTime = subtitles[i].end;
          position == i+1;
          subtitleContainer.innerHTML = subtitles[i].text.replace(/\n/g, " ");
          //subtitlesTextArea.innerHTML = subtitles[i].text.replace(/\n/g, " ");
          subtitlesTextArea.scrollTop = (subtitlesTextArea.scrollHeight * (subtitles[i].index-1) *5)/totalLines -1;
          olSubtitlesTA.scrollTop = (olSubtitlesTA.scrollHeight * (subtitles[i].index-1) *5)/totalLines -1;
          
          break;
        } else {
          subtitleContainer.innerHTML = "";
        }
      }
     }
      }   
  } 
   
  
  function enableTranslatedAudio(){
    playTranslations = true;
    playTlAudioButton.style.display = 'none';
    pauseTlAudioButton.style.display = 'inline-block';
  }

  function disableTranslatedAudio(){
    playTranslations = false;
    playTlAudioButton.style.display = 'inline-block';
    pauseTlAudioButton.style.display = 'none';
  }

  playTlAudioButton.onclick = function(){
    enableTranslatedAudio();
  };

  pauseTlAudioButton.onclick = function(){
    disableTranslatedAudio();
  };

  enableTranslatedAudio();

  function playTranslatedAudio(){
    var currentTime = video.currentTime;
    //check if it is already in between current start and end then avoid any processing
    if(currentTime >= startTime &&  currentTime <= endTime){
      return;
    }else{
    for (var i = 0; i < subtitles.length; i++) {
      if (
        currentTime >= subtitles[i].start &&
        currentTime <= subtitles[i].end
      ) {
        startTime = subtitles[i].start;
        endTime = subtitles[i].end;

        if(position == i){
          //play the audio for previoussubtitles //position.mp3
          tlaudio.src = audioBasePath + '/' + (position) + '.mp3';
          tlaudio.load();
          video.pause();
          //get the correct audio
         
          tlaudio.play();
          tlaudio.onended = () => {
            // Do something when the audio has finished playing.
           position = position+1;  
           subtitleContainer.innerHTML = subtitles[i].text.replace(/\n/g, " ");
           //subtitlesTextArea.innerHTML = subtitles[i].text.replace(/\n/g, " ");
           subtitlesTextArea.scrollTop = (subtitlesTextArea.scrollHeight * (subtitles[i].index-1) *5)/totalLines -1;
           olSubtitlesTA.scrollTop = (olSubtitlesTA.scrollHeight * (subtitles[i].index-1) *5)/totalLines -1;
           video.play();	  
          };
        }
        else{
          position = i +1;
        }
 

        break;
      }
      // else {
      //  subtitleContainer.innerHTML = "";
      //}
    }
  }
   };
  /*
    function syncSubtitles() {
      var currentTime = video.currentTime;
  
      for (var i = 0; i < subtitles.length; i++) {
        if (
          currentTime >= subtitles[i].start &&
          currentTime <= subtitles[i].end
        ) {
          subtitlesTextArea.scrollTo = (subtitlesTextArea.scrollHeight * )/totalLines *
            (subtitles[0].start / video.duration);
          break;
        }
      }
    }
  */
    // synchronize the subtitles with the text area
   // video.addEventListener("timeupdate",syncSubtitles() );
   
    // Stop video and subtitle scrolling when input is focused
    //var input = document.getElementById("input");
    subtitlesTextArea.addEventListener("focus",function () {
      if(!video.paused){
         video.pause();
         videoPaused = true;
      }
    });
    subtitlesTextArea.addEventListener("input",function () {
     // video.pause();
    });
    subtitlesTextArea.addEventListener("change", function() {
      //replace the text in the variable and highlight it.  
      //save it to the local store
      localStorage.setItem(storageKey, this.value);
      video.play();
     });
    /* 
    subtitlesTextArea.addEventListener("blur", function() {
      if(videoPaused){
          videoPaused = false;
          video.play();
      }
    });*/
     
    submitButton.addEventListener('click', () => {
      const data = {
        "fileName": saveFileName,
        "languageCode": languageCode,
        "replacedSub": subtitlesTextArea.value
      };
      fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        localStorage.removeItem(storageKey);
        subtitlesTextArea.value = subtext;
        console.log('Server response:', response);
      })
      .catch(error => {
        console.error('Error sending POST request:', error);
      });
      
    });
  
    showOLSubtitlesButton.addEventListener('click', () => {
     var subtitleOL = new XMLHttpRequest();
     subtitleOL.open("GET", originalSubtitlePath);
     subtitleOL.onload = function () {
      if (subtitleOL.status === 200) {
        //hide the differences
        diffoutputdiv = document.getElementById("diffoutput");
        diffoutputdiv.innerHTML = "";
        
        olSubtitlesTA.style.display = "block";
         subtextOL = subtitleOL.responseText;
          olSubtitlesTA.innerHTML = subtextOL;
          subtitlesTextArea.style.float = "right";
         subtitlesTextArea.style.width ="50%";
      } else {
        console.error("Failed to load SRT file");
      }
    };
    subtitleOL.send();
    showOLSubtitlesButton.style.display = 'none';
    hideOLSubtitlesButton.style.display = 'inline-block';
    });
  
    hideOLSubtitlesButton.onclick = function(){
      olSubtitlesTA.style.display = "none";
      subtitlesTextArea.style.width ="100%";
      hideOLSubtitlesButton.style.display = 'none';
      showOLSubtitlesButton.style.display = 'inline-block';

    };
  resetButton.onclick = function(){
    subtitlesTextArea.value = subtext;
    localStorage.removeItem(storageKey);
  
  };
  
  showDiff.addEventListener('click', (event) => {
   var showHide = event.target.value;
  if(showHide=="show"){
    //make sure we load the original text for comparison
    olSubtitlesTA.innerHTML = subtext;
    //set the button
    event.target.value = "hide";
    showDiff.innerHTML= "Hide Comparison";

    //original comparison code
    "use strict";
    var viewType=0;
	var byId = function (id) { return document.getElementById(id); },
		base = difflib.stringAsLines(byId("OLsubtitlesTA").value),
    newtxt = difflib.stringAsLines(byId("subtitles-textarea").value),
		sm = new difflib.SequenceMatcher(base, newtxt),
		opcodes = sm.get_opcodes(),
		diffoutputdiv = byId("diffoutput"),
		contextSize = byId("contextSize").value;

	diffoutputdiv.innerHTML = "";
	contextSize = contextSize || null;

	diffoutputdiv.appendChild(diffview.buildView({
		baseTextLines: base,
		newTextLines: newtxt,
		opcodes: opcodes,
		baseTextName: "Original Text",
		newTextName: "My Changes",
		contextSize: contextSize,
		viewType: viewType
	}));
  
}else{
  event.target.value = "show";
  showDiff.innerHTML= "Show My Changes";
  diffoutputdiv = document.getElementById("diffoutput");
  diffoutputdiv.innerHTML = "";
}

});
    
 /* 
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden'){
      if(!video.paused){   
      video.pause();
      videoPaused = true;
      }
    }// else {
     //   if(videoPaused){   
     //       video.play();
     //       videoPaused = false;
     //    }
     //} 
  });
  */
  // bind the scroll event to both text areas
  //olSubtitlesTA.addEventListener("scroll", function() {
  //  subtitlesTextArea.scrollTop = olSubtitlesTA.scrollTop;
  // });

subtitlesTextArea.addEventListener("scroll", function() {
  olSubtitlesTA.scrollTop = subtitlesTextArea.scrollTop;
});
/*
speedSlider.addEventListener("input", function() {
  video.playbackRate = speedSlider.value;
});
*/
 
};
