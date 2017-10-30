import 'awesomplete';
// var request = require( 'request');
// import * as schoolList from './school_names_and_districts.js'
// import {csv} from 'd3-request';



		window.tempData = {    
		    name:"This is the name of the school" + getRandomInt(850,1600),
		    district: "This is the district" + getRandomInt(850,1600),
		    specialEd: getRandomInt(0,100),
		    freeLunch: getRandomInt(0,100),
		    englishLearner: getRandomInt(0,100),
		    nonWhite: getRandomInt(0,100),
		    parcc:false,
		    sat: {
		        overall: {
		            min: 850,
		            max: 1600,
		            median: getRandomInt(850,1600),
		            school: getRandomInt(850,1600)
		        },
		        math: {
		            min: 800,
		            max: 1400,
		            median: getRandomInt(800,1400),
		            school: getRandomInt(800,1400)
		        },
		        ela: {
		            min: 700,
		            max: 1200,
		            median: getRandomInt(700,1200),
		            school: getRandomInt(700,1200)
		        }
		    },
		    parcc: { // If there are no PARCC scores, then set to false
		        school:{ // the school composite scores
		            overall:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }, 
		            math:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }, 
		            ela:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }
		        },
		        third:{ // or false
		            overall:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }, 
		            math:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }, 
		            ela:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }
		        },
		        fourth:{ // or false
		            overall:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }, 
		            math:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }, 
		            ela:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }
		        },
		        fifth:{ // or false
		            overall:{
          DNM: 25,
		                PM: 5,
		                A: 10,
		                M: 20,
		                E: 40
		            }, 
		            math:{
		      

		                DNM: 35,
		                PM: 10,
		                A: 20,
		                M: 10,
		                E: 25
		            }, 
		            ela:{
		                DNM: 5,
		                PM: 20,
		                A: 5,
		                M: 60,
		                E: 10
		            }
		        },
		        sixth:{ // or false
		            overall:{
		                DNM: 35,
		                PM: 10,
		                A: 20,
		                M: 10,
		                E: 25
		            }, 
		            math:{
		                DNM: 25,
		                PM: 5,
		                A: 10,
		                M: 20,
		                E: 40
		            }, 
		            ela:{
		                DNM: 5,
		                PM: 20,
		                A: 5,
		                M: 60,
		                E: 10
		            }
		        },
		        seventh:{ // or false
		            overall:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }, 
		            math:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }, 
		            ela:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }
		        },
		        eighth:{ // or false
		            overall:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }, 
		            math:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }, 
		            ela:{
		                DNM: 20,
		                PM: 20,
		                A: 20,
		                M: 20,
		                E: 20
		            }
		        }
		    }        
		}


window.addEventListener('DOMContentLoaded', function(e){
	
	const 	form = document.querySelector('#school-search'),
			searchBar = form.querySelector('.school-search__text'),
			submitButton = form.querySelector('.school-search__btn');

		// This is the autocomplete tool. It needs the `list` attribute
		// to be filled with autocomplete options. We'll do that with AJAX.
		
		const auto = new Awesomplete(searchBar, {
			minChars: 2,
			maxItems: 10,
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

			// let newList = [];

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
					auto.list = schoolsList.map(i => [i.autocomplete, "ID"]);
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
		
		window.tempData.parcc.seventh = false;
		window.tempData.parcc.eighth = false;
		formatSchoolProfile(window.tempData);
		

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
	})

})

function addPie(num){
	return `<div class='pie pie--${Math.round(num)}'></div><span>${Math.round(num)}%</span>`;
}

function formatSchoolProfile(data){
	// The data fetching mechanism is TBD. 
	console.log(data);


	// Fill out the school name/district
	document.querySelector('.school__name').innerHTML = data.name;
	document.querySelector('.school__district').innerHTML = data.district;
	
	// Fill out the demographic big numbers
	document.querySelector('.demo--lunch dt').innerHTML = addPie(data.freeLunch);
	document.querySelector('.demo--ell dt').innerHTML = addPie(data.englishLearner);
	document.querySelector('.demo--non-white dt').innerHTML = addPie(data.nonWhite);
	document.querySelector('.demo--special-ed dt').innerHTML = addPie(data.specialEd);
	
	let satString = ""; // This string will hold the html as it's written for SAT scores
	let parccString = ""; // This string will hold the html as it's written for PARCC scores

	if(data.sat){
	
		// Now, move on to the score charts
	
	
		// This array of the keys will let us iterate over the tests
		const tests = Object.keys(data.sat);
		tests.forEach(test => {
			// For each test, grab/calc the various stats needed
			const 	testData = data['sat'][test],
					min = testData.min,
					max = testData.max,
					median = testData.median,
					school = testData.school,
					medianPlacement = testData.median / testData.max * 100,
					schoolPlacement = testData.school / testData.max * 100;
	
			// Add the element to the holder string
			satString += `
				<li class='score'>
					<span class='score__label'>${window.testLabels[test]}</span>
					<div class='score__chart'>
						<div class='test test--min' style='left: 0'>
							<span class='test__dot'></span>
							<span class='test__score'>${min}</span>
						</div>
						<div class='test test--med' style='left: ${medianPlacement}%'>
							<span class='test__dot'></span>
							<span class='test__score'>${median}</span>
						</div>
						<div class='test test--max' style='left: 100%'>
							<span class='test__dot'></span>
							<span class='test__score'>${max}</span>
						</div>
						<div class='test test--school' style='left: ${schoolPlacement}%'>
							<span class='test__dot'></span>
							<span class='test__score'>${school}</span>
						</div>
					</div>
				</li>`;
		});

	
	} else{
		console.log('No SAT scores');
		satString = "<p class='note'>No SAT scores</p>"
	}

	if (data.parcc){
		console.log('PARCC scores');
		// parccString = "<h3>Parcc scores</h3>";
		const 	testTypes = ['overall', 'ela', 'math'],
				parccLevels = Object.keys(data.parcc);
		
		parccLevels.forEach(level => {
			if (level){
				parccString += `<h4 class='school_scores-sublabel'>${level}</h4>`;	

				if (data['parcc'][level]){
					// If there are scores for this grade level, then display them
					parccString += `<ul class='school__scores school__scores--parcc'>`;	
	
					testTypes.forEach(type => {
						const tempScores = data['parcc'][level][type];
						console.log(tempScores);
							parccString += `
								<li class='score'>
									<span class='score__label'>${type}</span>
									<div class='score__chart score__chart--parcc'>
										<div class='parcc parcc--dnm' style='width:${tempScores.DNM}%'><span>${tempScores.DNM}%</span></div>
										<div class='parcc parcc--pm' style='width:${tempScores.PM}%'><span>${tempScores.PM}%</span></div>
										<div class='parcc parcc--a' style='width:${tempScores.A}%'><span>${tempScores.A}%</span></div>
										<div class='parcc parcc--m' style='width:${tempScores.M}%'><span>${tempScores.M}%</span></div>
										<div class='parcc parcc--e' style='width:${tempScores.E}%'><span>${tempScores.E}%</span></div>
									</div>
								</li>`;
					});
					parccString += `</ul>`;	
				} else {
					// If there are no scores for this grade level, then don't display them.
					parccString += "<p class='note'>No test scores</p>"
				}
			}
		})

		/*
			output subheader
			output ul of overall/ela/math
			<ul class='school__scores school__scores--parcc'>
				<li class='score'>
					<span class='score__label'>Overall</span>
					<div class='score__chart score__chart--parcc'>
						<div class='parcc parcc--dnm' style='width:20%'><span>20%</span></div>
						<div class='parcc parcc--pm' style='width:20%'><span>20%</span></div>
						<div class='parcc parcc--a' style='width:20%'><span>20%</span></div>
						<div class='parcc parcc--m' style='width:20%'><span>20%</span></div>
						<div class='parcc parcc--e' style='width:20%'><span>20%</span></div>
					</div>
				</li>
			</ul>
	</div>
		*/
	} else{
		console.log('No PARCC scores');
		parccString = "<p class='note'>No PARCC scores</p>";
	}

	// Insert our parsed SAT chart string into the profile
	document.querySelector('#school-scores').innerHTML = satString;

	// Insert our parsed PARCC chart string into the profile
	document.querySelector('#parcc-scores').innerHTML = parccString;


	// Display (unhide) the profile
	document.querySelector('.school').classList.add('school--active');
}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}