// ==UserScript==
// @name        YouTube: Remember current time stamp
// @description Puts time stamp in URL every time the video is paused, except if video is within its last 5 seconds.
// @author      Sebastian Simon
// @include     https://youtube.com/*
// @include     https://youtube.com/
// @include     https://www.youtube.com/*
// @include     https://www.youtube.com/
// @grant       none
// @run-at      document-start
// @version     1.0.0
// @homepageURL https://github.com/SebastianSimon/youtube-save-time-stamp
// ==/UserScript==

/* eslint no-unused-vars: [ "error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" } ] */
/* eslint no-trailing-spaces: [ "error", { "skipBlankLines": true } ] */

addEventListener("DOMContentLoaded", function(){ "use strict";
  addEventListener("pause", () => {
    if(location.pathname.includes("/watch")){
      const url = new URL(location),
        [
          currentTime,
          totalTime
        ] = [
            ".ytp-time-current",
            ".ytp-time-duration"
          ].map((selector) => {
            const timeStamp = document.querySelector(selector)?.textContent;
            
            if(timeStamp){
              const time = timeStamp.split(":").map(Number);
              
              if(time.length === 4){
                time[1] += 24 * time[0];
                time.shift();
              }
              
              const {
                  timeParam,
                  totalSeconds
                } = time.reduceRight((aggregator, measure) => {
                    const unit = aggregator.timeUnits.shift(),
                      scalar = aggregator.timeScalars.shift();
                    
                    if(measure){
                      aggregator.timeParam = `${measure}${unit}${aggregator.timeParam}`;
                      aggregator.totalSeconds += scalar * measure;
                    }
                    
                    return aggregator;
                  }, {
                    timeParam: "",
                    totalSeconds: 0,
                    timeUnits: [
                      "s",
                      "m",
                      "h"
                    ],
                    timeScalars: [
                      1,
                      60,
                      60 * 60
                    ]
                  });
              
              return {
                timeParam,
                totalSeconds
              };
            }
            
            return null;
          });
      
      if(currentTime){
        if(currentTime.timeParam && currentTime.totalSeconds <= totalTime.totalSeconds - 5){
          if(currentTime.timeParam !== url.searchParams.get("t")){
            url.searchParams.set("t", currentTime.timeParam);
            history.replaceState(history.state, "", url);
          }
        }
        else{
          url.searchParams.delete("t");
          history.replaceState(history.state, "", url);
        }
      }
    }
  }, {
    capture: true
  });
});
