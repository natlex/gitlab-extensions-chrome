(function() {
    let commentsPanelDirection;

    const urlPatternInput = document.getElementById("urlPattern");    
    const commentsPanelExpandedInput = document.getElementById("comments-expanded-by-default");    
    const commentsPanelDirectionInfo = {
        vert: {
            sides: ["top", "bottom"],
            top: document.getElementById("comments-vert-top"),
            bottom: document.getElementById("comments-vert-bottom")
        },
        horiz: {
            sides: ["left", "right"],
            left: document.getElementById("comments-horiz-left"),
            right: document.getElementById("comments-horiz-right")
        }
    };
    
    function validateDirection(data) {
        data = data || {};
        const verticalValid = commentsPanelDirectionInfo.vert.sides.reduce((res, curr) => res + (data[curr] ? 1 : 0), 0);
        const horizontalValid = commentsPanelDirectionInfo.horiz.sides.reduce((res, curr) => res + (data[curr] ? 1 : 0), 0);
        if (verticalValid !== 1 || horizontalValid !== 1) {
            data = { top: true, left: true };
        }
        return data;
    }

    function setCommentsPanelDirection(block, side) {
        commentsPanelDirectionInfo[block].sides.forEach(s => {
            commentsPanelDirection[s] = (s === side);
            commentsPanelDirectionInfo[block][s].classList.add(commentsPanelDirection[s] ? "btn-primary" : "btn-secondary");
            commentsPanelDirectionInfo[block][s].classList.remove(commentsPanelDirection[s] ? "btn-secondary" : "btn-primary");
        });
    }

    function loadOptions() {
        chrome.storage.sync.get(["urlPattern", "commentsPanelDirection", "commentsPanelExpanded"], function(data) {
            const urlPattern = data && data.urlPattern || "https://gitlab.*";
            urlPatternInput.value = urlPattern;

            const commentsPanelExpanded = data && data.commentsPanelExpanded || false;
            commentsPanelExpandedInput.checked = commentsPanelExpanded;

            commentsPanelDirection = validateDirection(data && data.commentsPanelDirection);
            setCommentsPanelDirection("vert", commentsPanelDirection.top ? "top" : "bottom");
            setCommentsPanelDirection("horiz", commentsPanelDirection.left ? "left" : "right");
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

        const commentsPanelExpanded = commentsPanelExpandedInput.checked;
    
        chrome.storage.sync.set({
            urlPattern,
            commentsPanelExpanded,
            commentsPanelDirection
        }, function() {
            window.close();
        });
    }

    function resetCommentsPanelPosition() {
        chrome.storage.sync.set({
            commentsPanelPosition: null
        });
    }

    document.getElementById("save").addEventListener("click", saveOptions);
    document.getElementById("reset-comments-position").addEventListener("click", resetCommentsPanelPosition);

    Object.keys(commentsPanelDirectionInfo).forEach(block => {
        commentsPanelDirectionInfo[block].sides.forEach(side => {
            commentsPanelDirectionInfo[block][side].addEventListener("click", function() { setCommentsPanelDirection(block, side) });
        });
    });
})();