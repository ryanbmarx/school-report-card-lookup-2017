const 	fs = require('fs'),
		d3 = require('d3'),
		minify = require('html-minifier').minify;

fs.readFile('./data/sat-scores.csv', 'utf-8', (err, data) => {
	const schools = d3.csvParse(data);
	

	let schoolsTableBody = "";

	schools.forEach(school => {
		schoolsTableBody += `<tr class='school'>`; // Open the row
		schoolsTableBody += `<td class='school__name'>${school.schl_name}<span class='school__district'>${school.dist_name}</span></td>`; 

		schoolsTableBody += `<td class="align-right" data-sort="${school.school_rank_composite}">${school.gr11_schl_ttl_scale_score_sat_2017_composite} (<span class='school__rank'>${school.school_rank_composite}</span>)</td>`; 
		schoolsTableBody += `<td class="align-right" data-sort="${school.school_rank_math}">${school.gr11_schl_avg_scale_score_in_math_sat_2017_math} (<span class='school__rank'>${school.school_rank_math}</span>)</td>`; 
		schoolsTableBody += `<td class="align-right" data-sort="${school.school_rank_ela}">${school.gr11_schl_avg_scale_score_in_ela_sat_2017_ela} (<span class='school__rank'>${school.school_rank_ela}</span>)</td>`; 
		
		schoolsTableBody += `<td class="school__dist-comp" data-sort="${school.gr11_dist_ttl_scale_score_sat_2017_composite}">${school.gr11_dist_ttl_scale_score_sat_2017_composite}</td>`; 
		schoolsTableBody += `<td class="" data-sort="${school.gr11_dist_avg_scale_score_in_math_sat_2017_math}">${school.gr11_dist_avg_scale_score_in_math_sat_2017_math}</td>`; 
		schoolsTableBody += `<td class="" data-sort="${school.gr11_dist_avg_scale_score_in_ela_sat_2017_ela}">${school.gr11_dist_avg_scale_score_in_ela_sat_2017_ela}</td>`; 

		schoolsTableBody += `</tr>`; // close the row
	})
	
	// Now that we have parsed our data, output a minifed HTML file
	schoolsTableBody = minify(schoolsTableBody, {
		collapseWhitespace:true,
		collapseInlineTagWhitespace:true
	});
	
	// Write the string to a seperate file
	fs.writeFile(`./_table.html`, schoolsTableBody, err => {
		if (err) throw err;
	});
});



/*

school
dist
school
	(rank) comp
	(rank) math
	(rank) ela

dist
	(rank) comp
	(rank) math
	(rank) ela


*/