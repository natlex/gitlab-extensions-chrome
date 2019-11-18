(function() {
    function initComments() {
        let commentsPanelInLoad = false;
        let lockClick = false;

        function getAllUserNames() {
            return [...new Set([...document.querySelectorAll("a[data-username]")].filter(el => !!el.closest(".note-wrapper")).map(el => el.dataset.username))];
        }

        function createPrevNextButton(innerElementsFn, direction, buttonText) {
            let buttonElement = document.createElement("button");
            buttonElement.type = "button";
            buttonElement.innerHTML = buttonText;
            buttonElement.classList.add("btn", "btn-default");
            buttonElement.onclick = function() {
                let userElements = [...innerElementsFn()].filter(el => el.offsetParent !== null);
                if (direction < 0) userElements.reverse();
    
                const element = userElements.map(el => el.closest(".note-wrapper"))
                    .filter(el => !!el)
                    .find(el => {
                        let edge = 90;
                        if (!el.classList.contains("discussion-header")) edge += 45;
                        edge += 10 * direction;
                        return el.getBoundingClientRect().top * direction > edge * direction;
                    });
    
                if (element) {
                    element.scrollIntoView();
                    document.documentElement.scrollTop -= 90;
                    if (!element.classList.contains("discussion-header")) document.documentElement.scrollTop -= 45;
                }
            };
            return buttonElement;
        }
    
        function createShowHideButton(innerElementsFn, displayValue, buttonText) {
            let buttonElement = document.createElement("button");
            buttonElement.type = "button";
            buttonElement.innerHTML = buttonText;
            buttonElement.classList.add("btn", "btn-default");
            buttonElement.onclick = function() {
                innerElementsFn().forEach(el => {
                    const wrapper = el.closest("li.note-discussion");
                    if (wrapper) wrapper.style.display = displayValue;
                });
            };
            return buttonElement;
        }
    
        function createBlockLabel(blockName) {
            let labelElement = document.createElement("label");
            labelElement.classList.add("nex-block-name");
            labelElement.innerHTML = blockName;
            return labelElement;
        }
    
        function createNavigationBlock(blockName, innerElementsFn) {
            let rowElement = document.createElement("div");
            rowElement.classList.add("nex-panel-row");
            let buttonGroup = document.createElement("div");
            buttonGroup.classList.add("btn-group");
    
            rowElement.appendChild(createBlockLabel(blockName));
            rowElement.appendChild(buttonGroup);
            buttonGroup.appendChild(createShowHideButton(innerElementsFn, 'none', '&#8854;'));
            buttonGroup.appendChild(createShowHideButton(innerElementsFn, 'block', '&#8853;'));
            buttonGroup.appendChild(createPrevNextButton(innerElementsFn, -1, '&larr;'));
            buttonGroup.appendChild(createPrevNextButton(innerElementsFn, 1, '&rarr;'));
    
            return rowElement;
        }
    
        function createUserBlock(userName) {
            return createNavigationBlock(userName, () => document.querySelectorAll(`a[data-username='${userName}']`));
        }
    
        function createBlockSeparator() {
            let separatorElement = document.createElement("div");
            separatorElement.classList.add("nex-panel-row-separator");
            return separatorElement;
        }

        function showCommentsButton(panelElement) {
            panelElement.innerHTML = "";
            const commentsButton = document.createElement("i");
            commentsButton.classList.add("fa", "fa-comments", "fa-2x", "nx-i-btn");
            commentsButton.style.cursor = "pointer";
            commentsButton.onclick = function(e) {
                if (lockClick) {
                    lockClick = false;
                    return;
                }
                showCommentsNavigation(panelElement);
            }
            panelElement.appendChild(commentsButton);
        }

        function showCommentsNavigation(panelElement) {
            panelElement.innerHTML = "";
            panelElement.appendChild(createNavigationBlock("Resolved", () => {
                return [...document.querySelectorAll("div.js-discussion-headline")]
                    .filter(el => el.innerText.startsWith("Resolved"));
            }));
            panelElement.appendChild(createNavigationBlock("Unresolved", () => {
                return [...document.querySelectorAll("li.note-discussion")]
                    .filter(el => {
                        const headlineElement = el.querySelector("div.js-discussion-headline");
                        return !headlineElement || !headlineElement.innerText.startsWith("Resolved");
                    })
                    .map(el => el.querySelector("a.js-user-link"));
            }));
            panelElement.appendChild(createBlockSeparator());
            getAllUserNames().forEach(userName => panelElement.appendChild(createUserBlock(userName)));
        }
    
        function refreshPanelContent(panelElement) {
            if (getAllUserNames().length) {
                commentsPanelInLoad = false;
                showCommentsButton(panelElement);                
            } else if (!panelElement.hasChildNodes() || panelElement.firstChild.tagName === "I") {
                setTimeout(function() {
                    if (!commentsPanelInLoad) {
                        commentsPanelInLoad = true;
                        panelElement.innerHTML = `<i class="fa fa-spinner fa-2x fa-spin"></i>`;
                    }
                    refreshPanelContent(panelElement);
                }, 250);
            }
        }
    
        function enableElementDrag(element) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            element.onmousedown = dragMouseDown;
          
            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();

                pos3 = e.clientX;
                pos4 = e.clientY;
    
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            }
          
            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
    
                lockClick = true;
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
    
                element.style.top = (element.offsetTop - pos2) + "px";
                element.style.left = (element.offsetLeft - pos1) + "px";
                element.style.right = null;
                element.style.bottom = null;
                // element.style.top = null;
                // element.style.left = null;
                // element.style.right = window.screen.width - (element.offsetWidth + element.offsetLeft - pos1) + "px";
                // element.style.bottom = window.screen.height - (element.offsetHeight + element.offsetTop - pos2) + "px";
            }
          
            function closeDragElement(e) {
                e = e || window.event;
                e.preventDefault();

                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    
        function createPanel() {
            let panelElement = document.createElement("div");
            panelElement.classList.add("nex-panel");
            panelElement.style.right = "700px";
            panelElement.style.bottom = "10px";
            refreshPanelContent(panelElement);
            enableElementDrag(panelElement);
            return panelElement;
        }
    
        const contentElement = document.getElementsByClassName("content-wrapper");
        contentElement[0].appendChild(createPanel());
    }

    chrome.storage.sync.get("urlPattern", function(data) {
        let urlPattern = data && data.urlPattern || "https://gitlab.*";
        if (urlPattern[urlPattern.length - 1] !== "/") urlPattern += "/";
        urlPattern += "merge_requests\/.+";

        const url = window.location.href;
        if (url.match(urlPattern)) {
            initComments();
        }
    });
})();