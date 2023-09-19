/*
* This is intended to be a client-side JS link tracker
* that uses google analytics to handle all the backend.
*
* There are two main problems to solve:
*  1. How to send the data to GA => Custom Events
*  2. What to do if GA fails => Have Timeouts in Place
*
* Google analytics can fail if a browser plug-in blocks analytics requests.
* These requests will be forwarded after 1 second.
*/

const config = {
	gaID: 'G-3G5Q8LFQ4V',
	queryParam: "l",       // The query parameter with forward URL: `me.com/link/?l=url
	timeout: 1000,         // Timeout until redirect, used if GA is blocked by browser (default 1s)
};

function get404Link() {
	return `artale.io`;
}

function getQueryParam(param, opt_url) {
	const url = opt_url || window.location;

	// https://www.sitepoint.com/get-url-parameters-with-javascript/
	const queryString = url.search;
	const urlParams = new URLSearchParams(queryString);
    return urlParams.get(config.queryParam);
}

function getForwardUrl(url) {
	return getQueryParam(config.queryParam) || get404Link();
}

function wrapInHttpIfNeeded(url) {
	if (url.indexOf("http://") != 0 && url.indexOf("https://") != 0) {
        url = "http://" + url;
    }
    return url;
}

function forwardUrl(url) {
	// https://stackoverflow.com/questions/200337/whats-the-best-way-to-automatically-redirect-someone-to-another-webpage
	// Forward to correct location.
	// Use replace to avoid redirects when a user clicks "back" in their browser
	window.location.replace(wrapInHttpIfNeeded(url));
}

// https://developers.google.com/analytics/devguides/collection/analyticsjs/sending-hits#knowing_when_the_hit_has_been_sent
function createFunctionWithTimeout(callback) {
	// Default timeout 1 second.
	var called = false;
	function fn() {
		if (!called) {
			called = true;
			callback();
		}
	}
	setTimeout(fn, config.timeout);
	return fn;
}

// https://developers.google.com/analytics/devguides/collection/analyticsjs/events
// https://developers.google.com/analytics/devguides/migration/ua/analyticsjs-to-gtagjs?hl=fr
function handleLinkClicks(event) {
	const url = getForwardUrl();
	gtag('config', config.gaID, {
	  'custom_map': {'metric<Index>': 'metric_name'}
	});
	gtag('event', 'link', {
		'url': url,
		"transport_type":"beacon",
		'non_interaction': true,
		'event_callback': createFunctionWithTimeout(function(){
			forwardUrl(url);
		})
	});
}
