module.exports = function translateData(data){
	// A crosswalk, of sorts, to take the data from the database and make it more usable per the design I like.
	let retval = {
	    name:data.name,
	    district: `${data.district} (${data.city}, ${data.county} County)`,
	    specialEd: parseFloat(data.iep_schl),
	    freeLunch: parseFloat(data.low_income_schl),
	    englishLearner: parseFloat(data.lep_schl),
	    nonWhite: 100 - parseFloat(data.schl_white)
	}

	if(data.gr11_schl_avg_scale_score_in_ela_sat_2017_ela != "" && data.gr11_schl_avg_scale_score_in_math_sat_2017_math != "" && data.gr11_schl_ttl_scale_score_sat_2017_composite != ""){
		retval.sat = {
	        overall: {
	            min: 400,
	            max: 1600,
	            median: 1000,
	            school: parseFloat(data.gr11_schl_ttl_scale_score_sat_2017_composite)
	        },
	        math: {
	            min: 200,
	            max: 800,
	            median: 500,
	            school: parseFloat(data.gr11_schl_avg_scale_score_in_math_sat_2017_math)
	        },
	        ela: {
	            min: 200,
	            max: 800,
	            median: 500,
	            school: parseFloat(data.gr11_schl_avg_scale_score_in_ela_sat_2017_ela)
	        }
	    }

	} else {
		retval.sat = false;
	}

	// -----------
	// PARCC SCORES
	// -----------
	// Test if the school has an overall parcc composite. if so, initialize our data containers.
	retval.parcc = data.schl_pct_of_prof_ela_math_parcc_2017_composite != "" ? {grades:{}, overall:{}} : false;
	
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
			composite:parseFloat(data.schl_pct_of_prof_ela_math_parcc_2017_composite)
		};

		keys.forEach(key => {
			const 	letters = key.letters,
					num = key.num;

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
				retval['parcc']['grades'][letters] = false;
			}
		})

	}
	console.log(data, retval);
		return retval;
	}
