import 'awesomplete';
// var request = require( 'request');
// import * as schoolList from './school_names_and_districts.js'
import {csv} from 'd3-request';



window.addEventListener('DOMContentLoaded', function(e){
	
	const 	form = document.querySelector('#school-search'),
			searchBar = form.querySelector('.school-search__text'),
			submitButton = form.querySelector('.school-search__btn');

	csv(`http://${window.ROOT_URL}/data/school_names_and_districts.csv`, function(err, data){
		if (err) throw err;
		console.log(data.length)

		new Awesomplete(searchBar, {
			list: data,
			minChars: 2,
			maxItems: 10
		});

	});



	form.addEventListener('submit', function(e){
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









