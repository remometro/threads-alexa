const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const Util = require('./util.js');
const https = require('https');


async function getReq(url) {
  return new Promise ((resolve, reject) => {
    const req = https.get(url, res => {
      let rawData = '';

      res.on('data', chunk => {
        rawData += chunk;
        clearTimeout(timeout);
      });

      res.on('end', async () => {
        try {
          resolve(JSON.parse(rawData));
          clearTimeout(timeout);
        } catch (err) {
          clearTimeout(timeout);
          reject();
        }
      });
    });

    req.on('error', err => {
      clearTimeout(timeout);
      reject();
    });
  })
}

const fn = async (url) => new Promise(async (resolve, reject) => {
    try {
      const answer = await getReq(url);
      resolve(answer);
    } catch (e) {
      reject();
    }
});

const timeout = async (url) => {
  return new Promise(async (resolve, reject) => {
    const cancel = setTimeout(async () => {
      reject();
    }, 2000);
    const answer = await fn(url)
    clearTimeout(cancel)
    resolve(answer)
  })
}

const getRequest = async (url) => new Promise(async (resolve, reject) => {
  try {
    const answer = await timeout(url);
    resolve(answer);
  } catch (e) {
    reject();
  }
})

const confirmSlot = (slot) => {
    return slot.resolutions.resolutionsPerAuthority.map((resolution) => {
        return resolution.status.code === 'ER_SUCCESS_MATCH' && resolution.values[0].value.id
    }).filter(el => el)[0]
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to Threads. Which channel would you like to listen? Or would you prefer asking who is playing?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


/**
 * Intent handler to start playing an audio file.
 * By default, it will play a specific audio stream.
 * */
const PlayAudioIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayAudioIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent');
    },
    async handle(handlerInput) {
        let channel;
        try {
            const slot = handlerInput.requestEnvelope.request.intent.slots.channel.slotValue
            channel = Number(confirmSlot(slot));
        } catch (e) {
            channel = 0
        }
        console.log("channel", channel)
        const playbackInfo = await getPlaybackInfo();
        
        console.log("playbackInfo", playbackInfo)
        const playBehavior = 'REPLACE_ALL';
        const podcastUrls = ['https://threads.out.airtime.pro/threads_b', 'https://threads2.out.airtime.pro/threads2_b'];
        
        if (playbackInfo[channel] === "Nothing") {
            const sorry = "Sorry, but this channel is currently playing nothing. Which channel would you like to listen?"
            const prompt = "What channel would you like to listen?"
            return handlerInput.responseBuilder.speak(sorry).reprompt(prompt).getResponse()
        }
        
        const speakOutput = 'Connecting the dots. Now listening to: ' + playbackInfo[channel] + ".";
        

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addAudioPlayerPlayDirective(
                playBehavior,
                podcastUrls[channel],
                playbackInfo[channel],
                0,
                null
                )
            .getResponse();
    }
};

const ChannelOnePlayAudioIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChannelOneIntent' || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PreviousIntent');
    },
    async handle(handlerInput) {
        let channel = 0
        const playbackInfo = await getPlaybackInfo();
        const playBehavior = 'REPLACE_ALL';
        const podcastUrls = ['https://threads.out.airtime.pro/threads_b', 'https://threads2.out.airtime.pro/threads2_b'];
        
        const speakOutput = 'Connecting the dots. Now listening to: ' + playbackInfo[channel] + ".";
        
        if (playbackInfo[channel] === "Nothing") {
            const sorry = "Sorry, but this channel is currently playing nothing. Which channel would you like to listen?"
            const prompt = "What channel would you like to listen?"
            return handlerInput.responseBuilder.speak(sorry).reprompt(prompt).getResponse()
        }
        
        

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addAudioPlayerPlayDirective(
                playBehavior,
                podcastUrls[channel],
                playbackInfo[channel],
                0,
                null
                )
            .getResponse();
    }
};

const ChannelTwoPlayAudioIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChannelTwoIntent' || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NextIntent');
    },
    async handle(handlerInput) {
        let channel = 1
        const playbackInfo = await getPlaybackInfo();
        const playBehavior = 'REPLACE_ALL';
        const podcastUrls = ['https://threads.out.airtime.pro/threads_b', 'https://threads2.out.airtime.pro/threads2_b'];
        
        const speakOutput = 'Connecting the dots. Now listening to: ' + playbackInfo[channel] + ".";
        
        if (playbackInfo[channel] === "Nothing") {
            const sorry = "Sorry, but this channel is currently playing nothing. Which channel would you like to listen?"
            const prompt = "What channel would you like to listen?"
            return handlerInput.responseBuilder.speak(sorry).reprompt(prompt).getResponse()
        }
        
        
        

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addAudioPlayerPlayDirective(
                playBehavior,
                podcastUrls[channel],
                playbackInfo[channel],
                0,
                null
                )
            .getResponse();
    }
};

/**
 * Intent handler to start playing an audio file.
 * By default, it will play a specific audio stream.
 * */
const PauseAudioIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PauseIntent';
    },
    async handle(handlerInput) {
        return handlerInput.responseBuilder
            .addAudioPlayerStopDirective()
            .getResponse();
    }
};


const SwitchChannelIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SwitchChannelIntent';
    },
    async handle(handlerInput) {
        const channels = ["Channel One", "Channel Two"];
     
        let channel;
        try {
            const slot = handlerInput.requestEnvelope.request.intent.slots.channel.slotValue
            channel = Number(confirmSlot(slot));
        } catch (e) {
            channel = 0
        }
        const playbackInfo = await getPlaybackInfo();
        const playBehavior = 'REPLACE_ALL';
        const podcastUrls = ['https://threads.out.airtime.pro/threads_b', 'https://threads2.out.airtime.pro/threads2_b'];
        
        if (playbackInfo[channel] === "Nothing") {
            const sorry = `Sorry, but ${channels[channel]} is currently playing nothing. Which channel would you like to listen?`
            const prompt = "What channel would you like to listen?"
            return handlerInput.responseBuilder.speak(sorry).reprompt(prompt).getResponse()
        }
        
        const speakOutput = 'Switching to ' + channels[channel] + "You'll now be listening to: " + playbackInfo[channel] + ".";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addAudioPlayerPlayDirective(
                playBehavior,
                podcastUrls[channel],
                playbackInfo[channel],
                0,
                null
                )
            .getResponse();
    }
};

const WhatsPlayingIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'WhatsPlayingIntent');
    },
    async handle(handlerInput) {
        const playbackInfo = await getPlaybackInfo();
        const preliminary = "In Threads, "
        const speak1 = playbackInfo[0] === 'Nothing' ? "Channel one is currently playing nothing. " : `we're streaming on channel one: ${playbackInfo[0]}. `;
        const speak2 = playbackInfo[1] === 'Nothing' ? "Channel two is currently playing nothing. " : `On channel two, now is playing: ${playbackInfo[1]}. `;
        const prompt = "What channel would you like to listen?"
        
        const speakOutput = preliminary + speak1 + speak2 + prompt;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(prompt)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can ask Freddie to ask Angelo how to use this.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Farewell! Visit threadsradio.com for more.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * AudioPlayer events can be triggered when users interact with your audio playback, such as stopping and 
 * starting the audio, as well as when playback is about to finish playing or playback fails.
 * This handler will save the appropriate details for each event and log the details of the exception,
 * which can help troubleshoot issues with audio playback.
 * */
const AudioPlayerEventHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type.startsWith('AudioPlayer.');
  },
  async handle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    
    const audioPlayerEventName = handlerInput.requestEnvelope.request.type.split('.')[1];
    console.log(`AudioPlayer event encountered: ${handlerInput.requestEnvelope.request.type}`);
    let returnResponseFlag = false;
    switch (audioPlayerEventName) {
      case 'PlaybackStarted':
        playbackInfo.token = handlerInput.requestEnvelope.request.token;
        playbackInfo.inPlaybackSession = true;
        playbackInfo.hasPreviousPlaybackSession = true;
        returnResponseFlag = true;
        break;
      case 'PlaybackFinished':
        playbackInfo.inPlaybackSession = false;
        playbackInfo.hasPreviousPlaybackSession = false;
        playbackInfo.nextStreamEnqueued = false;
        returnResponseFlag = true;
        break;
      case 'PlaybackStopped':
        playbackInfo.token = handlerInput.requestEnvelope.request.token;
        playbackInfo.inPlaybackSession = true;
        playbackInfo.offsetInMilliseconds = handlerInput.requestEnvelope.request.offsetInMilliseconds;
        break;
      case 'PlaybackNearlyFinished':
        break;
      case 'PlaybackFailed':
        playbackInfo.inPlaybackSession = false;
        console.log('Playback Failed : %j', handlerInput.requestEnvelope.request.error);
        break;
      default:
        break;
    }
    return handlerInput.responseBuilder.getResponse();
  },
};


/* *
 * PlaybackController events can be triggered when users interact with the audio controls on a device screen.
 * starting the audio, as well as when playback is about to finish playing or playback fails.
 * This handler will save the appropriate details for each event and log the details of the exception,
 * which can help troubleshoot issues with audio playback.
 * */
const PlaybackControllerHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type.startsWith('PlaybackController.');
  },
  async handle(handlerInput) {
    let channel;
    try {
        const slot = handlerInput.requestEnvelope.request.intent.slots.channel.slotValue
        channel = Number(confirmSlot(slot));
    } catch (e) {
        channel = 0
    }
    const playbackInfo = await getPlaybackInfo();
    const playBehavior = 'REPLACE_ALL';
    const podcastUrls = ['https://threads.out.airtime.pro/threads_b', 'https://threads2.out.airtime.pro/threads2_b'];
    const playbackControllerEventName = handlerInput.requestEnvelope.request.type.split('.')[1];
    let response;
    switch (playbackControllerEventName) {
      case 'PlayCommandIssued':
        response = handlerInput.responseBuilder
            .addAudioPlayerPlayDirective(
                playBehavior,
                podcastUrls[channel],
                playbackInfo[channel],
                0,
                null
                )
            .getResponse();
        break;
      case 'PauseCommandIssued':
        response = handlerInput.responseBuilder
            .addAudioPlayerStopDirective()
            .getResponse();
        break;
      default:
        break;
    }
    console.log(`PlayCommandIssued event encountered: ${handlerInput.requestEnvelope.request.type}`);
    return response;
  },
};

/**
 * Intent handler for built-in intents that aren't supported in this sample skill.
 * As this is a sample skill for a single stream, these intents are irrelevant to this skill.
 * Regardless, the skill needs to handle this gracefully, which is why this handler exists.
 * */
const UnsupportedAudioIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.LoopOffIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.LoopOnIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ShuffleOffIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ShuffleOnIntent'
                    || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StartOverIntent'
                );
    },
    async handle(handlerInput) {
        const speakOutput = 'Sorry, I can\'t support that yet.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

/* *
 * SystemExceptions can be triggered if there is a problem with the audio that is trying to be played.
 * This handler will log the details of the exception and can help troubleshoot issues with audio playback.
 * */
const SystemExceptionHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log(`System exception encountered: ${JSON.stringify(handlerInput.requestEnvelope.request)}`);
  },
};

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)} handler: ${JSON.stringify(handlerInput)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/* HELPER FUNCTIONS */

const unescapeHTML = (safe) => {
  return safe.replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\(R\)/g, "from Repeats");
}

async function getPlaybackInfo(who = 0) {
  const publicStatus = [
    'https://threads.airtime.pro/api/live-info-v2',
    'https://threads2.airtime.pro/api/live-info-v2',
  ];

  let promises = [];
  
  const createPromise = (url) => new Promise(async (resolve, reject) => {
    try {
      const answer = await getRequest(url)
      resolve(answer)
    } catch (e) {
      resolve("Unavailable")
    }
  })

  promises.push(createPromise(publicStatus[0]));
  promises.push(createPromise(publicStatus[1]));
  
  const [response1, response2] = await Promise.allSettled(promises)

  let response = {}
    
    try {
        let show = undefined
        if (response1.value.station) {
            try { 
                show = response1.value.shows.current.name
            } catch (e) {
                show = "Nothing"
            }
            response[0] = unescapeHTML(show)
        } else {
            response[0] = "a stream that was not identified in time by Alexa."
        }
    } catch(e) {
        response[0] = "a stream that was not identified in time by Alexa."
        console.log(e)
    }
    
    try {
        let show = undefined
        if (response2.value.station) {
            try { 
                show = response2.value.shows.current.name
            } catch (e) {
                show = "Nothing"
            }
            response[1] = unescapeHTML(show)
        } else {
            response[1] = "a stream that was not identified in time by Alexa."
        }
    } catch(e) {
        response[1] = "a stream that was not identified in time by Alexa."
        console.log(e)
    }

    
    return response
}


/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        PlayAudioIntentHandler,
        PauseAudioIntentHandler,
        SwitchChannelIntentHandler,
        ChannelOnePlayAudioIntentHandler,
        ChannelTwoPlayAudioIntentHandler,
        WhatsPlayingIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        AudioPlayerEventHandler,
        UnsupportedAudioIntentHandler,
        PlaybackControllerHandler,
        SystemExceptionHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('threadsradio/v1')
    .lambda();