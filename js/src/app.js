import 'awesomplete';
import {scaleLinear} from 'd3-scale';

function translateData(data){
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


window.addEventListener('DOMContentLoaded', function(e){
	
	const 	form = document.querySelector('#school-search'),
			searchBar = form.querySelector('.school-search__text'),
			submitButton = form.querySelector('.school-search__btn');

		// This is the autocomplete tool. It needs the `list` attribute
		// to be filled with autocomplete options. We'll do that with AJAX.
		
		const auto = new Awesomplete(searchBar, {
			minChars: 2,
			maxItems: 20,
			autoFirst: true
		});

		searchBar.addEventListener('keyup', function(e){
			// When the user starts typing, it will ping the database to fetch a JSON list of possible schools
			// There are three GET vars in the url:
			// @format ... duh. we want JSON
			// @page_size: Maximum number of schools in the response. Can be anything, but the variable MUST be there b/c otherwise django will format the data in a way other than what we want.
			// @query: This is what the user has typed.

			const 	ajaxBaseUrl = "http://ec2-52-14-19-228.us-east-2.compute.amazonaws.com/schools/api/search/?format=json&page_size=20&autocomplete=",
					searchQuery = searchBar.value,
					queryUrl = `${ajaxBaseUrl}${searchQuery}`;

			// Init the request for school fetching.
			const ajax = new XMLHttpRequest();
			ajax.open("GET", queryUrl, true);
			ajax.onload = function(){
				// This is the response, parsed into JSON
				const schoolsList = JSON.parse(ajax.responseText)['results'] || JSON.parse(ajax.responseText);

				// When we get a response, parse the reponses into this format:
				// [{label:foo, value:bar}]
				// Then feed it into the list, so awesomeplete uses the new schools as the options.

				if (schoolsList.length > 0){
					auto.list = schoolsList.map(i => [`${i.autocomplete} (${i.district})`, i.school_id]);
				} else {
					auto.list = "No matches";
				}
			}
			ajax.send();
		});



	form.addEventListener('submit', function(e){
		// Folks shouldn't have a chance to hit submit, but if they do ....
		e.preventDefault();
		const schoolID = searchBar.value;

		// if (schoolID != "") formatSchoolProfile(data);
		
		if (schoolID != ""){ 
			const 	baseUrl = "http://ec2-52-14-19-228.us-east-2.compute.amazonaws.com/schools/school_detail/",
					queryUrl = `${baseUrl}${schoolID}`,
					ajax = new XMLHttpRequest();

			ajax.open("GET", queryUrl, true);
			ajax.onload = function(){
				const schoolData = JSON.parse(ajax.responseText)[0]['fields'];
				window.selectedSchool = schoolData.name;
				formatSchoolProfile(translateData(schoolData));

			}
			ajax.send();
		}
		

		try{
			// Let's track the number of times people call for a profile
			const uniquePhrase = "School report card 2017 profile displayed";
			s.linkTrackVars = "server,prop3,prop20,prop28,prop33,prop34,prop57,eVar3,eVar20,eVar21,eVar34,eVar35,eVar36,eVar37,eVar38,eVar39,eVar51";
			s.linkTrackEvents = "";
			s.prop57 = uniquePhrase;
			s.tl(
			   // Since we're not actually tracking a link click, use true instead of `this`.  This also supresses a delay
			   true,
			   // linkType, 'o' for custom link
			   'o',
			   // linkName
				uniquePhrase,
			   // variableOverrides
			   null
			);
		}
		catch (ReferenceError){
			console.warn('You must be running this locally. *OR* Omniture is not loaded. Skipping analytics.');
		}

	});

	window.addEventListener('awesomplete-selectcomplete', e => {
		// When the user makes an autocompleted selection, trigger the search by faking a submit button click.
		submitButton.click();
		document.querySelector('.school-search__text').setAttribute('placeholder', 'Search for another school');
		document.querySelector('.school-search__text').value = "";
		// document.querySelector('.school-search__text').setAttribute('value', window.selectedSchool);
	})

})

function addPie(num, addClass=""){
	return `<div class='pie pie--${Math.round(num)} ${addClass}'></div><span>${Math.round(num)}%</span>`;
}

function formatSchoolProfile(data){
	// The data fetching mechanism is TBD. 

	// Fill out the school name/district
	document.querySelector('.school__name').innerHTML = data.name;
	document.querySelector('.school__district').innerHTML = data.district;
	
	// Fill out the demographic big numbers
	document.querySelector('.demo--lunch dt').innerHTML = addPie(data.freeLunch);
	document.querySelector('.demo--ell dt').innerHTML = addPie(data.englishLearner);
	document.querySelector('.demo--non-white dt').innerHTML = addPie(data.nonWhite);
	document.querySelector('.demo--special-ed dt').innerHTML = addPie(data.specialEd);
	
	let satString = "", // This string will hold the html as it's written for SAT scores
		parccSchoolProficencyString = "",
		parccString = ""; // This string will hold the html as it's written for PARCC scores

	if(data.sat){
	
		// Now, move on to the score charts
		// This array of the keys will let us iterate over the tests
		const tests = Object.keys(data.sat);

		tests.forEach(test => {
			// For each test, grab/calc the various stats needed

			const 	temp = data['sat'][test],
					min = temp.min,
					max = temp.max,
					median = temp.median,
					school = temp.school,
					satScale = scaleLinear().domain([min, max]).range([0, 100]),
					medianPlacement = median ? satScale(median) : null,
					schoolPlacement = satScale(school);
			let label = window.testLabels[test];

			// Add the element to the holder string
			satString += `
				<li class='score'>
					<span class='score__label'>${label}</span>
					<div class='score__chart'>`;

			if (min > -1) {
				satString += `						
					<div class='test test--min' style='left: 0'>
						<span class='test__dot'></span>
						<span class='test__score'>${min}</span>
					</div>`;
			}	
			if (median) {
				satString += `<div class='test test--med' style='left: ${medianPlacement}%'>
					<span class='test__dot'></span>
					<span class='test__score'>${median}</span>
				</div>`;
			}

				satString += `<div class='test test--max' style='left: 100%'>
					<span class='test__dot'></span>
					<span class='test__score'>${max}</span>
				</div>`;

				satString += `<div class='test test--school' style='left: ${schoolPlacement}%'>
						<span class='test__dot'></span>
						<span class='test__score'>${school}</span>
					</div>`;
			
			satString += `</div></li>`;
		});
	
	} else{
		satString = `<p class='note'>${window.noScores}</p>`;
	}

	if (data.parcc){

		// ---------- 
		// START WITH THE OVERALL STUFF
		// ----------
		const parccOverall = data.parcc.overall;

		parccSchoolProficencyString = `<h4 class='school__scores-sublabel'>${window.overallParccLabel}<span>${window.overallParccSubLabel}</span></h4>`;
		parccSchoolProficencyString += `<ul class='school__scores school__scores--parcc'>`
		
		Object.keys(parccOverall).forEach(level => {
			parccSchoolProficencyString += `<li class='score'><span class='score__label'>${level}</span><div class='score__chart score__chart--parcc'>`;
			parccSchoolProficencyString += `<div class='parcc parcc--pm' style='width:${100 - parccOverall[level]}%'><span>${100 - parccOverall[level]}%</span></div>`;								
			parccSchoolProficencyString += `<div class='parcc parcc--m' style='width:${parccOverall[level]}%'><span>${parccOverall[level]}%</span></div>`;

		})

		console.log(parccSchoolProficencyString);
		// ---------- 
		// NOW WITH THE GRADE LEVEL STUFF
		// ----------

		const 	testTypes = ['ela', 'math'],
				parccLevels = Object.keys(data.parcc.grades);

		parccLevels.forEach(level => {
			if (level){
				// Format the level string (i.e. "third" => "Third grade");
				let levelString = level == "school" ? "Overall" : `${level} grade`;

				// Load the sub label into the string 
				parccString += `<h4 class='school__scores-sublabel'>${levelString}</h4>`;	

				if (data['parcc']['grades'][level]){
					// If there are scores for this grade level, then display them
					parccString += `<ul class='school__scores school__scores--parcc'>`;	
	
					testTypes.forEach(type => {
						const tempScores = data['parcc']['grades'][level][type];

						// A little fix for the floated items. Totals might exceed 100% due to rounding
						if (tempScores.DNM + tempScores.PM + tempScores.A + tempScores.M + tempScores.E > 100) {
							if (tempScores.A > 0){
								tempScores.A -= 0.1;				
							} else {
								tempScores.M -= 0.1;								
							}
						}
						parccString += `<li class='score'><span class='score__label'>${window.testLabels[type]}</span><div class='score__chart score__chart--parcc'>`;
						
						// Add each bar only if the value is > 0;		
						["dnm", "pm", "a", "m", "e"].forEach(result =>{
							if (tempScores[result.toUpperCase()] > 0){
								parccString += `<div class='parcc parcc--${result}' style='width:${tempScores[result.toUpperCase()]}%'><span>${Math.round(tempScores[result.toUpperCase()] * 10, -1) / 10}%</span></div>`								
							}
						});
	
						parccString += `</div></li>`;	
					});
					parccString += `</ul>`;	
				} else {
					// If there are no scores for this grade level, then don't display them.
					parccString += `<p class='note'>${window.noScores}</p>`;
				}
			}
		})
	} else{
		parccString = `<p class='note'>${window.noScores}</p>`;
	}

	// Insert our parsed SAT chart string into the profile
	document.querySelector('#school-scores').innerHTML = satString;

	// Insert our parsed PARCC chart string into the profile
	document.querySelector('#parcc-scores').innerHTML = parccString;
	document.querySelector('#parcc-scores-overall').innerHTML = parccSchoolProficencyString;

	// Display (unhide) the profile
	document.querySelector('.school').classList.add('school--active');
}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}