// Ensure that removedWordsLog and observer are only declared once
if (!window.removedWordsLog) {
    window.removedWordsLog = {}; // Store removed words and counts
}

// Function to modify text
function cleanText(node, genderName) {
    if (node.nodeType === 3) { // Only process text nodes
        let originalText = node.nodeValue;
        let updatedText = originalText;

        // Define words to remove and replace
        const removalPatterns = [
            { regex: /:in/g, word: ":in" },
            { regex: /\/-in/g, word: "/-in" },
            { regex: /\/-frau/g, word: "/-frau" },
            { regex: /\*in/gi, word: "*in" },
            { regex: /\*r/gi, word: "*r" },
            { regex: /\(m\/w\/d\)/gi, word: "(m/w/d)" },
            { regex: /\(M\/W\/D\)/g, word: "(M/W/D)" },
            { regex: /\(m\/w\/div\)/gi, word: "(m/w/div)" },
            { regex: /\(M\/W\/DIV\)/g, word: "(M/W/DIV)" },
            { regex: /\(m\/w\/x\)/gi, word: "(m/w/x)" },
            { regex: /\(M\/W\/X\)/g, word: "(M/W/X)" },
            { regex: /\(f\/m\/d\)/gi, word: "(f/m/d)" },
            { regex: /\(F\/M\/D\)/g, word: "(F/M/D)" },
            { regex: /\(f\/m\/x\)/gi, word: "(f/m/x)" },
            { regex: /\(F\/M\/X\)/g, word: "(F/M/X)" },
            { regex: /\(all gender\)/gi, word: "(all gender)" }, // ✅ New!
            { regex: /\*innen/gi, word: "*innen" }
        ];

        // Check and replace each pattern
        removalPatterns.forEach(pattern => {
            let matches = originalText.match(pattern.regex);
            if (matches) {
                let count = matches.length;
                updatedText = updatedText.replace(pattern.regex, genderName);

                // Log removed words count
                if (!window.removedWordsLog[pattern.word]) {
                    window.removedWordsLog[pattern.word] = 0;
                }
                window.removedWordsLog[pattern.word] += count;
            }
        });

        // If text was modified, update and log changes
        if (originalText !== updatedText) {
            node.nodeValue = updatedText;
            console.log("Replaced words with:", genderName, window.removedWordsLog);
        }
    }
}

// Function to clean all elements, including headings
function cleanAllText(genderName) {
    document.querySelectorAll('*:not(script):not(style)').forEach(element => {
        element.childNodes.forEach(node => cleanText(node, genderName));
    });
}

// Load gender name from storage and apply changes
chrome.storage.sync.get("genderName", function(data) {
    let genderName = data.genderName || "";
    cleanAllText(genderName);
});

// Listen for storage changes and update dynamically
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.genderName) {
        cleanAllText(changes.genderName.newValue);
    }
});

// Check if observer already exists to prevent duplicates
if (!window.observer) {
    window.observer = new MutationObserver(mutations => {
        chrome.storage.sync.get("genderName", function(data) {
            let genderName = data.genderName || "";
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Only process elements
                        cleanAllText(genderName);
                    }
                });
            });
        });
    });

    window.observer.observe(document.body, { childList: true, subtree: true });
}
