import 'awesomplete';
// var request = require( 'request');
// import * as schoolList from './school_names_and_districts.js'
// import {csv} from 'd3-request';

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

		console.log('submit', this, searchBar.value);
		// if (schoolID != "") formatSchoolProfile(data);
		
		const tempData = {    
		    name:"This is the name of the school" + getRandomInt(850,1600),
		    district: "This is the district" + getRandomInt(850,1600),
		    specialEd: getRandomInt(0,100),
		    freeLunch: getRandomInt(0,100),
		    englishLearner: getRandomInt(0,100),
		    nonWhite: getRandomInt(0,100),
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
		    }
		}
		formatSchoolProfile(tempData);

	});

	window.addEventListener('awesomplete-selectcomplete', e => {
		// When the user makes an autocompleted selection, trigger the search by faking a submit button click.
		submitButton.click();
	})

})

function addPie(num){
	console.log(`<div class='pie pie--${Math.round(num)}></div>${Math.round(num)}%`)
	return `<div class='pie pie--${Math.round(num)}'></div>${Math.round(num)}%`;
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
	

	// Now, move on to the score charts

	let charts = ""; // This string will hold the html as it's written

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
		charts += `
			<li class='score'>
				<span class='score__label'>${window.testLabels[test]}</span>
				<div class='score__chart'>
					<div class='sat sat--min' style='left: 0'>
						<span class='sat__dot'></span>
						<span class='sat__score'>${min}</span>
					</div>
					<div class='sat sat--med' style='left: ${medianPlacement}%'>
						<span class='sat__dot'></span>
						<span class='sat__score'>${median}</span>
					</div>
					<div class='sat sat--max' style='left: 100%'>
						<span class='sat__dot'></span>
						<span class='sat__score'>${max}</span>
					</div>
					<div class='sat sat--school' style='left: ${schoolPlacement}%'>
						<span class='sat__dot'></span>
						<span class='sat__score'>${school}</span>
					</div>
				</div>
			</li>`;
	});

	// Insert our parsed chart string into the profile
	document.querySelector('#school-scores').innerHTML = charts;

	// Display (unhide) the profile
	document.querySelector('.school').classList.add('school--active');

}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}