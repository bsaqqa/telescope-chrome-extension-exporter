// this is the code which will be injected into a given page...

var oldURL = "";
var currentURL = window.location.href;
var alertsElemnts;
(function() {
	checkURLchange();

	alertsElemnts = document.createElement('div');
	alertsElemnts.className = "position-fixed ";
	alertsElemnts.style = "left:.8rem; bottom:.8rem;"
	document.body.appendChild(alertsElemnts);
})();

function checkURLchange(currentURL){
    if(currentURL != oldURL){
        oldURL = currentURL;
		checkRequestDetails();
		checkRequestsIndexPage();
    }

    oldURL = window.location.href;
    setTimeout(function() {
        checkURLchange(window.location.href);
    }, 1000);
}

function checkRequestsIndexPage(){
	if(
		new RegExp(/^\/telescope\/requests/).test(window.location.pathname)	&&
		!(window.location.pathname.length == 19 ||
				 window.location.pathname.length == 20)
	){
		document.querySelector('#exportStatisctics')?.remove();
		return ;
	}
	addExportButton();
}

function checkRequestDetails(){
	if(!new RegExp(/^\/telescope\/requests\/\w/).test(window.location.pathname)){
		document.querySelector('#copyStatisctics')?.remove();
		return ;
	}
	addButton();
}

function addExportButton(){
	if(!document.querySelector('#exportStatisctics')){
		let header = document.querySelector("#telescope > div > div.d-flex.align-items-center.py-4.header")
		var button = document.createElement('button');
		

		button.id = "exportStatisctics";
		button.textContent = 'Export Statisctics';
		button.className = "btn btn-outline-primary ml-3 mr-0";

		button.onclick = function(){
			// getStatisticsLine();
			exportTable();
			createAlert('Statistics exported successfully');
		}
		header.appendChild(button);
	}
}



function addButton(){
	if(!document.querySelector('#copyStatisctics')){
		let header = document.querySelector("#telescope > div > div.d-flex.align-items-center.py-4.header")
		var button = document.createElement('button');


		button.id = "copyStatisctics";
		button.textContent = 'Copy Statisctics';
		button.className = "btn btn-outline-primary ml-3 mr-0";

		button.onclick = function(){
			getStatisticsLine();
			createAlert('Statistics copied successfully');
		}
		header.appendChild(button);

	}
}

function getStatistics(){
	return new Promise(function(resolve, reject){

		let duration = document.querySelector("#telescope > div > div.row.mt-4 > div.col-10 > div > div:nth-child(1) > div.table-responsive > table > tbody > tr:nth-child(8) > td:nth-child(2)").innerText.replace(' ms', '');
		let path = document.querySelector("#telescope > div > div.row.mt-4 > div.col-10 > div > div:nth-child(1) > div.table-responsive > table > tbody > tr:nth-child(6) > td:nth-child(2)").innerText;

		[].slice.call(document.querySelectorAll("a"))
		.filter(a => a.textContent.match("Response"))[0].click()
		let queriesCount =
			[].slice.call(document.querySelectorAll("a"))
			.filter(a => a.textContent.match("Queries"))[1]?.innerText?.replace('Queries (','')?.replace(')','')??'';


		setTimeout(() => {
			// let resposneTarget = document.querySelector("#telescope > div > div.row.mt-4 > div.col-10 > div > div:nth-child(3) > div:nth-child(1) > div > div > div > div > div:nth-child(7) > span.vjs-key").innerText.replace(':','').replaceAll('"','').trim();
			let requestType = document.querySelector("#telescope > div > div.row.mt-4 > div.col-10 > div > div:nth-child(1) > div.table-responsive > table > tbody > tr:nth-child(3) > td:nth-child(2)")?.innerText?.trim();
			resolve( {duration, path, queriesCount, requestType});
		}, 100);		
	});
}

function getStatisticsLine(){
	getStatistics().then(statistics =>{
		//${statistics.path}\\t
		//${statistics.path}\\t${statistics.requestType}\\t
		let result = decodeURIComponent(
				JSON.parse(`"${statistics.path}\\t${statistics.requestType}\\t${statistics.duration}\\t${statistics.queriesCount}"`)
			);
		console.log(result)
		copy(result, 'text');
		
		return result;
	})
}

function copy(str, mimeType) {
	document.oncopy = function(event) {
		event.clipboardData.setData(mimeType, str);
		event.preventDefault();
	};
	try{            
		var successful = document.execCommand('copy', false, null);
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Copying text command was ' + msg);
		if (!successful){
			navigator.clipboard.writeText(str).then(
				function() {
					console.log('successful copy')
				}, 
				function() {
					console.log('unsuccessful')
				}
			);
		}
	}catch(ex){console.log('Wow! Clipboard Exeption.\n'+ex)}
}


function hideAlert(alert){
	alert.classList.toggle('show')
	setTimeout(() => {
		alert.classList.toggle('d-none')
		alert.textContent = "";
	}, 200);
}

function createAlert(text ="Success"){
	let alert = document.createElement('div');
	alert.innerText = text;	
	alert.className = "btn btn-primary d-block px-3 py-2 ml-2 mb-2 fade ";

	alertsElemnts.appendChild(alert);
	setTimeout(() => {
		alert.classList.toggle('show');

		alert.onclick = function(e){
			hideAlert(alert);
		}
	
		setTimeout(() => {
			hideAlert(alert);
		}, 3000);

	}, 100);

}


function exportTable(){
	var table = document.querySelector("#indexScreen");
	TableToExcel.convert(table, {
		name: "Reqeusts.xlsx",
		sheet: {
			name: "Telescope Requests"
		}
	});
}


chrome.runtime.onMessage.addListener(function(request) {
    if(request.action === 'executeLoadAll') {
		loadAll();
    }
});

function loadAll(){
	var numberOfMissing = 0;
	var loaderInterval = setInterval(function(){
		if(document.querySelector('.dontanimate a')){
			document.querySelector('.dontanimate a').click()
			numberOfMissing = 0;
		}else{
			if(numberOfMissing > 5){
				clearInterval(loaderInterval);
			}
			numberOfMissing++;
		}
		window.scrollTo(0,document.body.scrollHeight);
	}, 1000);
}