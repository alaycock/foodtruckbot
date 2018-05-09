// https://gist.github.com/mobz/cf8d3a98722e0fbe10b2dbb2046efe4e
function getTimeZone( tz_str, date ) {

	const utc_c = {
		timeZone: "UTC",
		hour12: false,
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric"
	};


	const loc_c = {
		timeZone: tz_str,
		hour12: false,
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric"
	};

	const locale = 'en-US';

	const utc_f = new Intl.DateTimeFormat(locale, utc_c );
	const loc_f = new Intl.DateTimeFormat(locale, loc_c );

	// console.log( utc_f.resolvedOptions())
	// console.log( loc_f.resolvedOptions())

	let d = new Date( date );

	const us_re = /(\d+).(\d+).(\d+),?\s+(\d+).(\d+).(\d+)/;

	function parseDate( date_str ) {
		try {
			return Array.prototype.slice.call(us_re.exec( date_str ), 1).map( function(n) {
				return parseInt(n, 10)
			});
		} catch(e) {
			console.log("expected a US (m/d/y) date: ", + date_str );
			return null;
		}
	}

	function diffMinutes( d1, d2 ) {
		let day = d1[1] - d2[1];
		let hour = d1[3] - d2[3];
		let minute = d1[4] - d2[4];

		// console.log( d1, d2 );

		if( day < -20 ) {
			day = 1;
		}

		return ((( day * 24 ) + hour ) * 60	) + minute;
	}

	return diffMinutes(
		parseDate( utc_f.format( d )),
		parseDate( loc_f.format( d )) );

}

module.exports = getTimeZone;