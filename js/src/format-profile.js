import {format} from 'd3-format';
import {scaleLinear} from 'd3-scale';

function addPie(num, addClass=""){
	// Takes a number (the % of a pie chart), and returns the appropriate HTML to make a pie chart.
	return `<div class='pie pie--${Math.round(num)} ${addClass}'></div><span>${format('.0f')(num)}%</span>`;
}

module.exports = function formatSchoolProfile(data){

	/******************************

	This function takes a specifically-formatted data object from the transformData() function and turns it 
	into a profile. 

	*******************************/

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
					medianPlacement = median ? satScale(median) : null, // If we have a media ...
					schoolPlacement = satScale(school);
			let label = window.testLabels[test];

			// Add the element to the holder string. One at a time, IF we have the stat, 
			// then add it to the holder string.
			
			// First, open the score list item.
			satString += `
				<li class='score'>
					<span class='score__label'>${label}</span>
					<div class='score__chart'>`;

			// Then, if the min is legit (i.e. a number greater than 0), add it.
			// We're just checking for 
			if (min >= 0) {
				satString += `						
					<div class='test test--min' style='left: 0'>
						<span class='test__dot'></span>
						<span class='test__score'>${min}</span>
					</div>`;
			}	

			// If the data is missing a median, it will be <false>.
			if (median) {
				satString += `<div class='test test--med' style='left: ${medianPlacement}%'>
					<span class='test__dot'></span>
					<span class='test__score'>${median}</span>
				</div>`;
			}

			// Same deal for the max. If it is present in the data, add it to the chart.
			if (max >= 0) {
				satString += `<div class='test test--max' style='left: 100%'>
					<span class='test__dot'></span>
					<span class='test__score'>${max}</span>
				</div>`;
			}

			// Add the school dot if it is legit. Here, we just test if it's > 0
			
			if (school >= 0){
				satString += `<div class='test test--school' style='left: ${schoolPlacement}%'>
					<span class='test__dot'></span>
					<span class='test__score'>${school}</span></div>`;
			}
			
			// Now close the list item. Move on to the next score.
			satString += `</div></li>`;
		});
	
	} else{
		// If there are not scores, kick out a note to the reader.
		satString = `<p class='note'>${window.noScores}</p>`;
	}

	if (data.parcc){

		// If there is no parcc data, this json value should be false.

		// ---------- 
		// START WITH THE OVERALL STUFF
		// ----------
		const parccOverall = data.parcc.overall;

		// Label the overall parcc scores
		parccSchoolProficencyString = `<h4 class='school__scores-sublabel'>${window.overallParccLabel}<span>${window.overallParccSubLabel}</span></h4>`;
		
		// Open the score ul.
		parccSchoolProficencyString += `<ul class='school__scores school__scores--parcc'>`
		
		// For each parcc version (overall, ela and math), we're only going to get a % proficient
		// stat. So, we will create a two-bar chart which == 100%; The `div.parcc` bars are chosen
		// for their colors. It's a bit of a violation of the semantic meaning behind the classes, 
		// but this made more sense than creating a THIRD type of chart for this lookup.

		Object.keys(parccOverall).forEach(level => {
			parccSchoolProficencyString += `<li class='score'><span class='score__label'>${window.testLabels[level]}</span><div class='score__chart score__chart--parcc'>`;
			parccSchoolProficencyString += `<div class='parcc parcc--pm' style='width:${100 - parccOverall[level]}%'><span>${format('.1f')(100 - parccOverall[level])}%</span></div>`;								
			parccSchoolProficencyString += `<div class='parcc parcc--m' style='width:${parccOverall[level]}%'><span>${format('.1f')(parccOverall[level])}%</span></div>`;
			parccSchoolProficencyString += `</div></li>`;
		})

		// ---------- 
		// NOW WITH THE GRADE LEVEL STUFF
		// ----------

		const 	testTypes = ['ela', 'math'], // These correspond to keys in key->value paits in the data
				parccLevels = Object.keys(data.parcc.grades); // Slice off all the grade level stuff for easy access


		parccLevels.forEach(level => {
			// This loop will cycle through each grade level in the data (should be 3-8),
			// outputting a proficiency chart for each test type in each grade. If a school
			// has no data for a certain grade-level, the value should be false in the data. 
			// The assumption that if there is data for a grade level, it has data for each 
			// test type. This will break if that is not the case.
			
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
								parccString += `<div class='parcc parcc--${result}' style='width:${tempScores[result.toUpperCase()]}%'><span>${format('.1f')(tempScores[result.toUpperCase()])}%</span></div>`								
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