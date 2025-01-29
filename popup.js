document.addEventListener('DOMContentLoaded', function() {
    let inputField = document.getElementById('genderName');
    let saveButton = document.getElementById('save');

    // Load the stored gender name when the popup opens
    chrome.storage.sync.get("genderName", function(data) {
        if (data.genderName) {
            inputField.value = data.genderName;
        }
    });

    // Save the new gender name and refresh LinkedIn pages
    saveButton.addEventListener('click', function() {
        let genderName = inputField.value.trim();

        // Save to Chrome storage
        chrome.storage.sync.set({ genderName: genderName }, function() {
            console.log("Gender name saved:", genderName);

            // Send message to all LinkedIn tabs to update immediately
            chrome.tabs.query({ url: "https://www.linkedin.com/*" }, function(tabs) {
                tabs.forEach(tab => {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ["content.js"]
                    });
                });
            });

            // Close the popup after saving
            window.close();
        });
    });
});
