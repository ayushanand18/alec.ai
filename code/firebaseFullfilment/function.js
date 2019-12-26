// Copyright 2019, Ayush Anand.
// Licensed under the GNU AGPLv3 Licence, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    https://www.gnu.org/licenses/agpl-3.0.en.html
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const {
dialogflow,
SimpleResponse,
BasicCard,
Suggestions,
Permission,
UpdatePermission,
RegisterUpdate
} = require('actions-on-google');
const brain = require('brain.js');
const fs = require('fs');

var natural = require('natural');
var classifier = new natural.BayesClassifier();



exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  agent.requestSource = agent.ACTIONS_ON_GOOGLE;

  process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements



  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function classificationReq(agent){
    var classText = agent.parameters.any;
  	var restoredClassifier = natural.BayesClassifier.restore(JSON.parse(fs.readFileSync('classifier.json')));
    var outs = restoredClassifier.classify(classText);
    agent.add("The Text provided for Classification is- " +classText+ "  "+"\n Results:"+ " " +outs+" "+ "  This is a Machine Learning Classification, therefore results might be inaccurate.\n If you want to check another news please say 'Check Another'. What else may i help you?");

  }

  function googleAssistantHandler(agent) {
    var classText = agent.parameters.any;
  	let conv = agent.conv(); // Get Actions on Google library conv instance
  	var restoredClassifier = natural.BayesClassifier.restore(JSON.parse(fs.readFileSync('classifier.json')));
    var outs = restoredClassifier.classify(classText);
	conv.ask("The Text provided for Classification is " +classText+ "  " + "Results:"+" " +outs+ " "+"This is a Machine Learning Classification, therefore results might be inaccurate.\n If you want to check another news please say 'Check Another'. What else may i help you?"); // Use Actions on Google library
  	agent.add(conv);
  	 // Add Actions on Google library responses to your agent's response
  }

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('classification_text_intent', classificationReq);
  //intentMap.set('classification_text_intent', googleAssistantHandler);
  agent.handleRequest(intentMap);
});


/*
    "actions-on-google": "^2.2.0",
    "firebase-admin": "^5.13.1",
    "firebase-functions": "^2.0.2",
    "dialogflow": "^0.6.0",
    "dialogflow-fulfillment": "^0.5.0",
    "brain.js": "^1.1.2"
*/
    //tellmeitstruth.tellmeitstruth-custom.parameters.country_given
    //tellmeitstruth.tellmeitstruth-custom.countryofdata-custom-2.category-post
    //const countryGiven = agent.context.get('countryofdata-followup').parameters.country_given;
    //const categoryPost = agent.parameters.category-post;
/*
The text provided for classification is: $any .
The region is  #countryofdata-followup.country_given and the Category of the text is  #countryofdata-followup-2.category-post
Thanks for the data. Unfortunately, detecting Fake News is unsupported for the current release. Things will surely get back stable till 24th August 2019.
*/
//fs.readFileSync("https://firebasestorage.googleapis.com/v0/b/whatztru-ai.appspot.com/o/fake.news.model%2Fnet.json?alt=media&amptoken=e9020770-d89f-478a-b9e8-c1dc51fbb111", "utf8")
//net.fromJSON(JSON.parse(fetch('https://firebasestorage.googleapis.com/v0/b/whatztru-ai.appspot.com/o/fake.news.model%2Fnet.json?alt=media&amptoken=e9020770-d89f-478a-b9e8-c1dc51fbb111')