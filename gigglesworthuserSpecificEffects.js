exports.getScriptManifest = function() {
	return {
		name: "User Specific Effects",
		description: "Allows you to play effects only if the event, command, button is triggered by the given user. This is a catered version of the User Specific Events script provided by ebiggz.",
		author: "CorporalGigglesworth",
		version: "1"
	}
}

function getDefaultParameters() {
    return new Promise((resolve, reject) => {
        resolve({
			"targetUsernames": {
                "type": "string",
                "description": "Target Username(s)",
				"secondaryDescription": "The usernames that you want the below effects to trigger for, If multiple - Use a comma deliminated list i.e. TestUsername,TestUsername2,TestUsername3 or leave blank to specify a generic action that will work for everyone that this script has not already been registered for. (If generic, ensure this is the last provided in a list of effects...) ",
				"default": ""
            },
			"effects": {
                "type": "effectlist",
                "description": "Effects",
				"secondaryDescription": "The effects to run if the above user triggers the event, command, or button.",
				"default": []
			},
			"cooldown": {
				"type": "string",
                "description": "Cooldown",
				"secondaryDescription": "The cooldown before this can be triggered for the specific user again... Set to 0 for no cooldown, value is in seconds.",
				"default": "0"
			},
			"type": {
				"type": "enum",
                "description": "Type",
				"secondaryDescription": "The type of action you require from the specified effects... All = standard implementation that runs all effects, Random = Runs one of the specified effects randomly selected. Defaults to 0.",
				"options": ["All", "Random"],
				"default": "All"
			},
			// "logging": {
				 // "type": "boolean",
				 // "description":"Enable Logging",
				 // "secondaryDescription": "Enable this setting to see debug logging, Error logging will occur either way. (setting is useful for debugging errors.)",
				 // "default": false
			// }
        });
    });
}
exports.getDefaultParameters = getDefaultParameters;

var moment = {};
var logger = {};
var logging = false;

function withinCooldown(type, triggerer, cooldown) {
	if (cooldown > 0) {
		// make sure the state object exists
		if(global.triggeredUserEffects == null) {
			global.triggeredUserEffects = {};
		}
		let now = moment();
		//build key for cache
		let cacheKey = `${type}:${triggerer}`;
		// get the last run time
		let lastRan = global.triggeredUserEffects[cacheKey];
		if(lastRan != null) {
			// compare minutes since last time we ran effects.
			let minutesSince = now.diff(lastRan,'minutes');
			if(minutesSince < cooldown && cooldown > 0) {
				return false;
			}
		}
		// add now as the last time we ran effects
		global.triggeredUserEffects[cacheKey] = now;
		return true;
	} else {
		return true;
	}
	
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function log(message) {
	if (logging) {
		logger.debug(`[Script][User Specific Effects] ${message}`);
	}
}

function error(message) {
	logger.error(`[Script][User Specific Effects] ${message}`);
}

function run(runRequest) {
    return new Promise(async resolve => {
		//set script global scope vars.
		moment = runRequest.modules.moment;
		logger = runRequest.modules.logger;
		// logging = runRequest.parameters.logging;
		logging = false;
		log("Started");

		let response = {
			success: true,
			effects: []
		}

		//get the targetUsernames...
		let targetUsernames = runRequest.parameters.targetUsernames;
		log(`targetUsernames = ${targetUsernames}`);
		let nameArr = [];
		if (targetUsernames !== "")  {
			//create an array from the targetUsernames
			nameArr = targetUsernames.split(",");
			//make all names lowercase for comparisons...
			nameArr = nameArr.map((x) => { return x.toLowerCase() });
		}
		
		//create a global state object to store the target usernames.
		if(global.triggeredUserEffectsUsernames == null) {
			global.triggeredUserEffectsUsernames = [];
		}
		
		//concat the nameArr to a global nameArr so that the generic version can still function correctly.
		global.triggeredUserEffectsUsernames = global.triggeredUserEffectsUsernames.concat(nameArr);
		
		//get user who triggered command/event/button etc... Make sure it's lower case for comparisons.
		let triggerer = runRequest.user.name.toLowerCase();
		log(`triggerer = ${triggerer}`);
		
		//check whether this user can be applied as a generic script trigger. if global does not include, then yes, it can as long as the targetUsernames == ""
		var generic = !global.triggeredUserEffectsUsernames.includes(triggerer) && targetUsernames === "";		
		log(`IsGeneric = ${generic}`);

		//check if user exists within the target usernames.
		if(nameArr.includes(triggerer) || generic) {
			//verify cooldown...
			if(withinCooldown(runRequest.trigger.type, triggerer, runRequest.parameters.cooldown)) {
				//if we would like to run all the scripts we can just set the effects.
				if (runRequest.parameters.type === "All") {
					response.effects = runRequest.parameters.effects;
				//if we want to apply a randomisation to the effects - Generate random number within bounds of the array.
				} else if (runRequest.parameters.type === "Random") {
					//get length of array.
					var len = runRequest.parameters.effects.length;
					//generate random number between 0 and array length.
					var num = getRandomInt(0, len - 1);
					log(`Random num = ${num}`);
					//assign effects with random num.
					response.effects = [runRequest.parameters.effects[num]];
					log(JSON.stringify(response.effects));
				} else {
					//if no appropriate option, log as a debug message for appropriate debugging assistance.
					error(`Could not parse type value of ${runRequest.parameters.type}.`);
				}
			} else {
				resolve(response);
			}
		}	
		resolve(response);
    });
}
exports.run = run;