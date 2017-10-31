import 'awesomplete';
import translateData from './transform-data.js';
import formatSchoolProfile from './format-profile.js';
import {scaleLinear} from 'd3-scale';

window.addEventListener('DOMContentLoaded', function(e){
	
	const 	form = document.querySelector('#school-search'),
			searchBar = form.querySelector('.school-search__text'),
			submitButton = form.querySelector('.school-search__btn');

		// This is the autocomplete tool. It needs the `list` attribute
		// to be filled with autocomplete options. We'll do that with AJAX.
		
		const auto = new Awesomplete(searchBar, {
			minChars: 2,
			maxItems: 20,
			// autoFirst: true
		});

		searchBar.addEventListener('keypress', function(e){
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