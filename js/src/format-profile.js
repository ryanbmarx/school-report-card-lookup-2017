import {format} from 'd3-format';

function addPie(num, addClass=""){
	return `<div class='pie pie--${Math.round(num)} ${addClass}'></div><span>${format('.0f')(num)}%</span>`;
}

module.exports = function formatSchoolProfile(data){
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
			parccSchoolProficencyString += `<li class='score'><span class='score__label'>${window.testLabels[level]}</span><div class='score__chart score__chart--parcc'>`;
			parccSchoolProficencyString += `<div class='parcc parcc--pm' style='width:${100 - parccOverall[level]}%'><span>${format('.1f')(100 - parccOverall[level])}%</span></div>`;								
			parccSchoolProficencyString += `<div class='parcc parcc--m' style='width:${parccOverall[level]}%'><span>${format('.1f')(parccOverall[level])}%</span></div>`;
			parccSchoolProficencyString += `</div></li>`;
		})

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