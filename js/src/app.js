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
			const 	ajaxBaseUrl = "http://ec2-52-14-19-228.us-east-2.compute.amazonaws.com/schools/api/search/",
					searchQuery = searchBar.value,
					queryUrl = `${ajaxBaseUrl}?format=json&autocomplete=${searchQuery}`;

			// let newList = [];

			// Init the request for school fetching.
			const ajax = new XMLHttpRequest();
			ajax.open("GET", queryUrl, true);
			ajax.onload = function(){
				// This is the response, parsed into JSON
				const schoolsList = JSON.parse(ajax.responseText);
				console.log(schoolsList, queryUrl);

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
		// if (schoolID != "") lookup.displayScores(schoolID);
const tempData = {    
    name:"XXXX",
    district: "XXXX",
    specialEd: 0,
    freeLunch: 0,
    englishLearner: 0,
    nonWhite: 0,
    act: {
    	overall: {
            min: 850,
            max: 1600,
            median: 950,
            school: 1500
        },
        math: {
            min: 800,
            max: 1400,
            median: 1100,
            school: 1350
        },
        ela: {
            min: 700,
            max: 1200,
            median: 1000,
            school: 800
        }
    }
}
		formatSchoolProfile(tempData);

	});

	window.addEventListener('awesomplete-selectcomplete', e => {
		// When the user makes an autocompleted selection, trigger the search.
		submitButton.click();
	})

})



function formatSchoolProfile(data){
	console.log(data);
	
	document.querySelector('.school__name').innerHTML = data.name;
	document.querySelector('.school__district').innerHTML = data.district;
	
	document.querySelector('.demo--lunch dt').innerHTML = data.freeLunch + "%";
	document.querySelector('.demo--ell dt').innerHTML = data.englishLearner + "%";
	document.querySelector('.demo--non-white dt').innerHTML = data.nonWhite + "%";
	document.querySelector('.demo--special-ed dt').innerHTML = data.specialEd + "%";
	

	let charts = "";

	const tests = Object.keys(data.act);

	tests.forEach(test => {
		const 	testData = data['act'][test],
				min = testData.min,
				max = testData.max,
				median = testData.median,
				school = testData.school,
				medianPlacement = testData.median / testData.max * 100,
				schoolPlacement = testData.school / testData.max * 100;

		charts += `
			<li class='score'>
				<span class='score__label'>Overall composite</span>
				<div class='score__chart'>
					<div class='act act--min' style='left: 0'>
						<span class='act__dot'></span>
						<span class='act__score'>${min}</span>
					</div>
					<div class='act act--med' style='left: ${medianPlacement}%'>
						<span class='act__dot'></span>
						<span class='act__score'>${median}</span>
					</div>
					<div class='act act--max' style='left: 100%'>
						<span class='act__dot'></span>
						<span class='act__score'>${max}</span>
					</div>
					<div class='act act--school' style='left: ${schoolPlacement}%'>
						<span class='act__dot'></span>
						<span class='act__score'>${school}</span>
					</div>
				</div>
			</li>`;
	})
	document.querySelector('#school-scores').innerHTML = charts;
	document.querySelector('.school').classList.add('school--active');

}







