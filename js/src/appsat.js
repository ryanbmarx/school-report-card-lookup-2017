var $ = require('jquery');
const dt = require( 'datatables.net' )( window, $ );
const dr = require('datatables.net-responsive')( window, $ );


// import {format} from 'd3-format';


window.addEventListener('DOMContentLoaded', function(e){
	console.log('loaded');
	const schoolSatScores = $('#sat-scores').DataTable({
		"ordering": true,
	    "responsive": {
	        details: {
	            type: 'column',
	            target: 'tr'
	        }
	    },
		"searching": true,
		"paging":true,
		"lengthMenu": [ 
			[25, 50, -1], 
			[25, 50, "All"] 
		],
        "order": [[ 1, "asc" ]],
        "columnDefs": [ {
			"targets": 0,
			"orderable": false
		},{
			"targets": [1,2,3],
			"type": "num"
		} ]
	});
});