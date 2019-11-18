(function() {
    const urlPatternInput = document.getElementById("urlPattern");

    function loadOptions() {
        chrome.storage.sync.get("urlPattern", function(data) {
            const urlPattern = data && data.urlPattern || "https://gitlab.*";
            urlPatternInput.value = urlPattern;
        });
    }
    loadOptions();
    
    function saveOptions() {
        urlPatternInput.classList.remove("is-invalid");

        const urlPattern = urlPatternInput.value;
        if (!urlPattern) {
            urlPatternInput.classList.add("is-invalid");
            return;
        }
    
        chrome.storage.sync.set({
            urlPattern
        });
    }
    document.getElementById("save").addEventListener("click", saveOptions);
})();