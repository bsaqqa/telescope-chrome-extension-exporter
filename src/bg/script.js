window.onload = function () {
    document.getElementById("loadAll").addEventListener("click", function(){
        chrome.tabs.query({ active: true, currentWindow: true}, function(activeTabs) {
            chrome.tabs.sendMessage(activeTabs[0].id, { action: 'executeLoadAll' });
        });
    });
    
}