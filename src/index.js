'use strict';

var Alexa = require('alexa-sdk');
var APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).
var personInfo = require('./personInfo.json');
var teamEvents = require('./teamEvent.json');
var util = require('./util');
exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    //Use LaunchRequest, instead of NewSession if you want to use the one-shot model
    // Alexa, ask [my-skill-invocation-name] to (do something)...
    'LaunchRequest': function () {
        this.attributes['speechOutput'] = this.t("LOGIN_MESSAGE_NO_USER_NAME", this.t("SKILL_NAME"));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },

    'SkillIntent': function () {
        var itemSlot = this.event.request.intent.slots.Item;
        var itemName;
        if (itemSlot && itemSlot.value) {
            itemName = itemSlot.value.toLowerCase();
        }

        var personSkills = personInfo.PERSON_SKILL_EN_US;
        var personNames = personSkills[itemName];
        //find the user list who are good at corresponding skill.
        if (personNames) {
            var answer = "According to the matching result, ";
            if(personNames instanceof Array && personNames.length >1){
                for (var i = 0; i < personNames.length; i++) {
                    var personName = personNames[i];
                    answer += personName;
                    if (i < personNames.length - 1) {
                        answer += ",";
                    }
                }
                answer +=" are";
            }else{
                answer += personNames;
                answer += " is";
            }
            answer += " good at " + itemName;
            this.attributes['speechOutput'] = answer;
            this.attributes['repromptSpeech'] = this.t("PERSON_INFO_REPEAT_MESSAGE");
            this.emit(':ask', answer, this.attributes['repromptSpeech']);

        } else {
            var speechOutput = this.t("PERSON_INFO_NOT_FOUND_MESSAGE");
            var repromptSpeech = this.t("PERSON_INFO_FOUND_REPROMPT");
            if (itemName) {
                speechOutput += this.t("PERSON_INFO_FOUND_WITH_ITEM_NAME");
            } else {
                speechOutput += this.t("PERSON_INFO_FOUND_WITHOUT_ITEM_NAME");
            }
            speechOutput += repromptSpeech;

            this.attributes['speechOutput'] = speechOutput;
            this.attributes['repromptSpeech'] = repromptSpeech;

            this.emit(':ask', speechOutput, repromptSpeech);
        }
    },
    'PersonIntent': function () {
        var itemSlotContactInfo = this.event.request.intent.slots.contactInfo;
        var itemSlotName = this.event.request.intent.slots.name;
        var speechOutput = "";
        var repromptSpeech = "";
        if (itemSlotName && itemSlotName.value) {
            itemSlotName = itemSlotName.value.toLowerCase();
            var userInfo = personInfo.PERSON_INFO_EN_US;
            userInfo = userInfo[itemSlotName];
            if (userInfo) {//get the new person from user list
                if (itemSlotContactInfo && itemSlotContactInfo.value) {
                    itemSlotContactInfo = itemSlotContactInfo.value.toLowerCase();
                    speechOutput = "the " + itemSlotContactInfo + " of " + itemSlotName + " is " + userInfo[itemSlotContactInfo];
                    repromptSpeech = this.t("PERSON_INFO_REPEAT_MESSAGE");
                } else {
                    speechOutput = this.t("PERSON_INFO_NOT_FOUND_MESSAGE");
                    repromptSpeech = this.t("PERSON_INFO_FOUND_REPROMPT");
                    speechOutput += this.t("PERSON_INFO_FOUND_WITH_CONTRACT_INFO", itemSlotName, itemSlotContactInfo);
                }
            } else {
                speechOutput = "sorry, currently we don't have the record for " + itemSlotName;
                repromptSpeech = this.t("PERSON_INFO_REPEAT_MESSAGE");
            }
        }else{
            speechOutput = "sorry, currently we don't have the record for this person.";
            repromptSpeech = this.t("PERSON_INFO_REPEAT_MESSAGE");
        }
        this.emit(':ask', speechOutput, repromptSpeech);
    },
    'TeamEventsIntent': function () {
        var itemSlotTeamName = this.event.request.intent.slots.teamName;
        var speechOutput = "sorry, currently I don't have the record for this team.";
        var repromptSpeech = "sorry, currently I don't have the record for this team.";
        if (itemSlotTeamName && itemSlotTeamName.value) {
            itemSlotTeamName = itemSlotTeamName.value.toLowerCase();
            speechOutput = "";
            repromptSpeech = "";
            if(teamEvents.TEAM_EVENTS[itemSlotTeamName] != undefined){
                var events = teamEvents.TEAM_EVENTS[itemSlotTeamName].events;
                if(events instanceof Array && events.length > 0){
                    for(var i = 0 ; i< events.length ; i++){
                        var eventNo = i+1;
                        speechOutput += " the event " + eventNo+ " is :" + events[i] + ";";
                    }
                }else{
                    speechOutput = "there are no big events from " + itemSlotTeamName + " team.";
                }
                repromptSpeech = "Try saying repeat.";
            }
        }
        this.emit(':ask', speechOutput, repromptSpeech);
    },
    'TeamStructureIntent': function () {
        var itemSlotTeamName = this.event.request.intent.slots.teamName;
        var speechOutput = "sorry, currently I don't have the record for this team.";
        var repromptSpeech = "sorry, currently I don't have the record for this team.";
        if (itemSlotTeamName && itemSlotTeamName.value) {
            itemSlotTeamName = itemSlotTeamName.value.toLowerCase();
            speechOutput = "";
            repromptSpeech = "";
            if(teamEvents.TEAM_EVENTS[itemSlotTeamName] != undefined) {
                var po = teamEvents.TEAM_EVENTS[itemSlotTeamName].productOwner;
                var scrumMaster = teamEvents.TEAM_EVENTS[itemSlotTeamName].scrumMaster;
                var members = teamEvents.TEAM_EVENTS[itemSlotTeamName].teamMembers;
                speechOutput = "In " + itemSlotTeamName + " team the product owner is " + po + ", the scrum master is " + scrumMaster + ", " +
                    "the team members";
                if (members instanceof Array && members.length > 1) {
                    speechOutput += " are ";
                    for (var i = 0; i < members.length; i++) {
                        var member = members[i];
                        speechOutput += member;
                        if (i < members.length - 1) {
                            speechOutput += ",";
                        }
                    }
                } else {
                    speechOutput += " is ";
                    speechOutput += members[0];
                }
                repromptSpeech = "Try saying repeat."
            }
        }
        this.emit(':ask', speechOutput, repromptSpeech);
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = this.t("HELP_MESSAGE");
        this.attributes['repromptSpeech'] = this.t("HELP_REPROMT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'Unhandled': function() {
        this.emit(':tell', 'what are you talking about ? I can not understand ! I think maybe I need to take a good rest. Bye Bye. ');
    }

    // 'UserLoginIntent': function () {
    //    // var personInfos = require('./personInfo.json');
    //     var speechOutput = "";
    //     var repromptSpeech = "";
    //     var itemSlotName = this.event.request.intent.slots.name;
    //     if (itemSlotName && itemSlotName.value) {
    //         itemSlotName = itemSlotName.value.toLowerCase();
    //         //var userInfo = personInfos.PERSON_INFO_EN_US;
    //      //   userInfo = userInfo[itemSlotName];
    //        // if (userInfo) {
    //           //  var lastLoginTime = userInfo["lastLoginTime"];
    //
    //             //TODO
    //             //first time login to skill finder
    //             // if(lastLoginTime == ""){
    //             //     speechOutput = this.t("WELCOME_MESSAGE_FIRST_TIME", itemSlotName);
    //             //     repromptSpeech = this.t("WELCOME_REPROMT_FIRST_TIME", itemSlotName);
    //             // }else if(util.daysCalculation(lastLoginTime) <= 5){
    //             //     speechOutput = this.t("WELCOME_MESSAGE", itemSlotName);
    //             //     repromptSpeech = this.t("WELCOME_REPROMT", itemSlotName);
    //             // }else{
    //             //     speechOutput = this.t("WELCOME_MESSAGE_LONG_TIME", itemSlotName);
    //             //     repromptSpeech = this.t("WELCOME_REPROMT_LONG_TIME", itemSlotName);
    //             // }
    //          //   var err = util.updateLoginTime(itemSlotName, personInfos);
    //           //      speechOutput = this.t("WELCOME_MESSAGE", itemSlotName);
    //           //      repromptSpeech = this.t("WELCOME_REPROMT", itemSlotName);
    //
    //         //}
    //         speechOutput = this.t("WELCOME_MESSAGE", itemSlotName);
    //         repromptSpeech = this.t("WELCOME_REPROMT", itemSlotName);
    //     }else{
    //         speechOutput = this.t("WELCOME_MESSAGE_USER_NOT_FOUND", itemSlotName);
    //         repromptSpeech = this.t("WELCOME_REPROMT", itemSlotName);
    //     }
    //     this.attributes['speechOutput'] = speechOutput;
    //     this.attributes['repromptSpeech'] = repromptSpeech;
    //     this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    // },
};

var languageStrings = {
    "en-US": {
        "translation": {
            "SKILL_NAME": "Skill finder",
            "LOGIN_MESSAGE": "hey, my name is Alexa %s. I'm so happy you can talk to me. May I know your name please?",
            "LOGIN_MESSAGE_NO_USER_NAME": "hey, my name is Alexa %s. Nice to meet you, I'm very glad to answer your questions. You can ask a question like, who is good at AI technology. You also can ask the person contact information to me... Now, what can I hekp you with ?",
            "LOGIN_REPROMT": "Please kindly tell me your name.",
            "WELCOME_MESSAGE_FIRST_TIME": "Nice to meet you %s, this is the first time you talk to me. I'm very glad to answer your questions. You can ask a question like, who is good at AI technology. You also can ask the person contact information to me... Now, what can I hekp you with ?",
            "WELCOME_REPROMT_FIRST_TIME": "You can ask a question like, who is good at angular? You also can ask the person contact information to me... Now, what can I hekp you with ?",
            "WELCOME_MESSAGE": "Nice to meet you %s. I'm very glad to answer your questions. You can ask a question like, who is good at AI technology. You also can ask the person contact information to me... Now, what can I hekp you with ?",
            "WELCOME_REPROMT": "You can ask a question like, who is good at AI technology. You also can ask the person contact information to me... Now, what can I hekp you with ?",
            "WELCOME_MESSAGE_LONG_TIME": "Nice to meet you %s. Long time no talk with you. I really miss you. You can ask a question like, who is good at AI technology. You also can ask the person contact information to me... Now, what can I hekp you with ?",
            "WELCOME_MESSAGE_USER_NOT_FOUND": "Nice to meet you. I'm very glad to answer your questions. You can ask a question like, who is good at AI technology. You also can ask the person contact information to me... Now, what can I hekp you with ?",
            "WELCOME_REPROMT_LONG_TIME": "You can ask a question like, who is good at AI technology. You also can ask the person contact information to me... Now, what can I hekp you with ?",
            "DISPLAY_CARD_TITLE": "%s  - skill for %s.",
            "HELP_MESSAGE": "You can ask questions such as, who knows the AI technology, or, you can say exit...Now, what can I help you with?",
            "HELP_REPROMT": "You can say things like, who learned the AI recently, or you can say exit...Now, what can I help you with?",
            "STOP_MESSAGE": "oh my god !!!! I only want to find a person who I can talk to. Is it really difficult ? Am I wrong ? oh no ! Bye Bye !",
            "PERSON_INFO_REPEAT_MESSAGE": "Try saying repeat.",
            "PERSON_INFO_NOT_FOUND_MESSAGE": "I\'m sorry, I currently don\'t know ",
            "PERSON_INFO_FOUND_WITH_ITEM_NAME": "the person info for that skill. ",
            "PERSON_INFO_FOUND_WITHOUT_ITEM_NAME": "that skill. ",
            "PERSON_INFO_FOUND_REPROMPT": "What else can I help with?",
            "PERSON_INFO_FOUND_WITH_CONTRACT_INFO": "%s\'s %s"
        }
    }
};