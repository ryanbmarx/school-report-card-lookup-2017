/*

:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::-'    `-::::::::::::::::::
::::::::::::::::::::::::::::::::::::::::::-'          `::::::::::::::::
:::::::::::::::::::::::::::::::::::::::-  '   /(_M_)\  `:::::::::::::::
:::::::::::::::::::::::::::::::::::-'        |       |  :::::::::::::::
::::::::::::::::::::::::::::::::-         .   \/~V~\/  ,:::::::::::::::
::::::::::::::::::::::::::::-'             .          ,::::::::::::::::
:::::::::::::::::::::::::-'                 `-.    .-::::::::::::::::::
:::::::::::::::::::::-'                  _,,-::::::::::::::::::::::::::
::::::::::::::::::-'                _,--:::::::::::::::::::::::::::::::
::::::::::::::-'               _.--::::::::::::::::::::::#####:::::::::
:::::::::::-'             _.--:::::::::::::::::::::::::::#####:::::####
::::::::'    ##     ###.-::::::###:::::::::::::::::::::::#####:::::####
::::-'       ###_.::######:::::###::::::::::::::#####:##########:::####
:'         .:###::########:::::###::::::::::::::#####:##########:::####
     ...--:::###::########:::::###:::::######:::#####:##########:::####
 _.--:::##:::###:#########:::::###:::::######:::#####:#################
'#########:::###:#########::#########::######:::#####:#################
:#########:::#############::#########::######:::#######################
##########:::########################::################################
##########:::##########################################################
##########:::##########################################################
#######################################################################
#######################################################################
######### http://www.chris.com/ascii/index.php?art=comics/batman ######
#######################################################################

It is our darkest hour, the data does not fit the required format. Only 
one person can save us. This function probably will be re-written from 
scratch each year, as the source data changes. It's purpose is to connect
the app to the data.

The underlying premise to this data structure is:

- Not all schools will have all scores. In the case that a certain score does not pertain 
to that school, let the data call it false for easy conditionals.
- The data at points goes several levels deep in embedding. This is done to make iterating over 
certain elements, such as grade levels, easier to do in one fell swoop (with Object.keys)


*/


module.exports = function translateData(data){
	// A crosswalk, of sorts, to take the data from the database and make it more usable per the design I like.
	
	// retval, or return value, will be our json. This first part is self-explanatory. 
	let retval = {
	    name:data.name,
	    district: `${data.district} (${data.city}, ${data.county} County)`,
	    specialEd: parseFloat(data.iep_schl),
	    freeLunch: parseFloat(data.low_income_schl),
	    englishLearner: parseFloat(data.lep_schl),
	    nonWhite: 100 - parseFloat(data.schl_white) // Easier than adding all the variants together.
	}

	// Test if the three SAT school composite scores are blank. 
	if(data.gr11_schl_avg_scale_score_in_ela_sat_2017_ela != "" && data.gr11_schl_avg_scale_score_in_math_sat_2017_math != "" && data.gr11_schl_ttl_scale_score_sat_2017_composite != ""){
		retval.sat = {
	        overall: {
	            min: 400, // Hard coded b/c there wasn't enough time to add dynamically
	            max: 1600,// Hard coded b/c there wasn't enough time to add dynamically
	            median: 1000,// Hard coded b/c there wasn't enough time to add dynamically
	            school: parseFloat(data.gr11_schl_ttl_scale_score_sat_2017_composite)
	        },
	        math: {
	            min: 200,// Hard coded b/c there wasn't enough time to add dynamically
	            max: 800,// Hard coded b/c there wasn't enough time to add dynamically
	            median: 500,// Hard coded b/c there wasn't enough time to add dynamically
	            school: parseFloat(data.gr11_schl_avg_scale_score_in_math_sat_2017_math)
	        },
	        ela: {
	            min: 200,// Hard coded b/c there wasn't enough time to add dynamically
	            max: 800,// Hard coded b/c there wasn't enough time to add dynamically
	            median: 500,// Hard coded b/c there wasn't enough time to add dynamically
	            school: parseFloat(data.gr11_schl_avg_scale_score_in_ela_sat_2017_ela)
	        }
	    }

	} else {
		retval.sat = false;
	}

	// -----------
	// PARCC SCORES
	// -----------
	// Test if the school has an overall parcc composite. 
	// If so, we'll assume it has ANY PARCC SCORES at all. 
	// "Initialize our data containers. Turbines to speed."
	// "Roger. Ready to move out."
	retval.parcc = data.schl_pct_of_prof_ela_math_parcc_2017_composite != "" ? {grades:{}, overall:{}} : false;
	
	// We need an iterable to cycle through the grades. 
	let keys = [
		{letters: "third", num: "3"},
		{letters: "fourth", num: "4"},
		{letters: "fifth", num: "5"},
		{letters: "sixth", num: "6"},
		{letters: "seventh", num: "7"},
		{letters: "eighth", num: "8"}
	];

	if (retval.parcc){
		
		// Load up the school-level proficency
		retval.parcc.overall = {
			math:parseFloat(data.schl_pct_of_prof_in_math_parcc_2017_math),
			ela:parseFloat(data.schl_pct_of_prof_in_ela_parcc_2017_ela),
			overall:parseFloat(data.schl_pct_of_prof_ela_math_parcc_2017_composite)
		};

		// Cycle through the grade levels. These all will live in retval.parcc.grades
		keys.forEach(key => {
			const 	letters = key.letters,
					num = key.num;

			// To test for results in each grade, we'll look for any result from the ELA test.
			// If it exists, we'll assume that complete results for both ELA and MATH exist.
			if (data[`gr${num}_ela_schl_approached_expectns_parcc_all`] || data[`gr${num}_ela_schl_did_not_meet_expectns_parcc_all`] || data[`gr${num}_ela_schl_exceeded_expectns_parcc_all`] || data[`gr${num}_ela_schl_met_expectns_parcc_all`] || data[`gr${num}_ela_schl_partially_met_expectns_parcc_all`]){
				retval['parcc']['grades'][letters] = {
					 math:{
		                DNM: parseFloat(data[`gr${num}_math_schl_did_not_meet_expectns_parcc_all`]),
		                PM: parseFloat(data[`gr${num}_math_schl_partially_met_expectns_parcc_all`]),
		                A: parseFloat(data[`gr${num}_math_schl_approached_expectns_parcc_all`]),
		                M: parseFloat(data[`gr${num}_math_schl_met_expectns_parcc_all`]),
		                E: parseFloat(data[`gr${num}_math_schl_exceeded_expectns_parcc_all`])
		            }, 
		            ela:{
		                DNM: parseFloat(data[`gr${num}_ela_schl_did_not_meet_expectns_parcc_all`]),
		                PM: parseFloat(data[`gr${num}_ela_schl_partially_met_expectns_parcc_all`]),
		                A: parseFloat(data[`gr${num}_ela_schl_approached_expectns_parcc_all`]),
		                M: parseFloat(data[`gr${num}_ela_schl_met_expectns_parcc_all`]),
		                E: parseFloat(data[`gr${num}_ela_schl_exceeded_expectns_parcc_all`])
		            }
				}
			} else {
				// If no ELA test results of any kind for that grade, mark it false.
				retval['parcc']['grades'][letters] = false;
			}
		})

	}
		// For testing.
		// console.log(data, retval);
		
		// We're done here.
		return retval;
	}
