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
				// When we get a response, parse the reponses into this format:
				// [{label:foo, value:bar}]
				// Then feed it into the list, so awesomeplete uses the new schools as the options.

				// var list = JSON.parse(ajax.responseText).map(function(i) { 
				// 	return i; 
				// });
				// auto.list = list;
				console.log(ajax.responseText);
			}
			ajax.send();


		});



	form.addEventListener('submit', function(e){
		// Folks shouldn't have a chance to hit submit, but if they do ....
		e.preventDefault();
		const schoolID = searchBar.value;

		console.log('submit', this, searchBar.value);
		// if (schoolID != "") lookup.displayScores(schoolID);

	});

	window.addEventListener('awesomplete-selectcomplete', e => {
		// When the user makes an autocompleted selection, trigger the search.
		submitButton.click();
	})

})









