// Receive the message from the background script.
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "openPopover") {
    const { data } = message;

    // Get the selected text range and its bounding rectangle
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Calculate the popover position relative to the selected text
    const popover = document.createElement("div");

    let popoverContent = `<h2 style="color: #000000;">${data.word}</h2>`;
    // create badge for part of speech
    popoverContent += `<p style="margin: 10px 0;"><span style="background-color: #d2dded; padding: 5px; border-radius: 5px;">${data.partOfSpeech.join(
      ", "
    )}</span></p>`;

    data.meanings.forEach((meaning, idx) => {
      popoverContent += `<div style="margin: 20px 0;">`;
      popoverContent += `<h3 style="color: #000000;">Definition ${
        idx + 1
      }</strong></h3>`;
      popoverContent += `<p style="color: #000000;">${meaning.definition}</p>`;

      popoverContent += `<p style="margin-top: 20px; color: #000000;">Example:</p>`;

      if (meaning.examples.length === 0) {
        popoverContent += `<p style="color: #000000;"><i>No examples found.</i></p>`;
      } else {
        popoverContent += `<ul style="color: #000000;">`;
        meaning.examples.forEach((example) => {
          popoverContent += `<li>${example}</li>`;
        });
        popoverContent += `</ul>`;
      }

      if (meaning.synonyms.length > 0) {
        popoverContent += `<p style="margin-top: 20px; color: #000000;">Synonyms:</p>`;
        popoverContent += `<ul style="color: #000000;">`;
        meaning.synonyms.forEach((synonym) => {
          popoverContent += `<li>${synonym}</li>`;
        });
        popoverContent += `</ul>`;
      }
      popoverContent += `</div>`;
    });

    popoverContent += '<h3 style="color: #000000;">Word forms</h3>';

    // Showing word forms as a table: data.wordForms is a key-value object
    popoverContent +=
      '<table style="width: 100%; border-collapse: collapse; color: #000000;">';
    popoverContent += "<thead>";
    popoverContent += "<tr>";
    popoverContent +=
      '<th style="border: 1px solid gray; padding: 5px;">Form</th>';
    popoverContent +=
      '<th style="border: 1px solid gray; padding: 5px;">Word</th>';
    popoverContent += "</tr>";
    popoverContent += "</thead>";
    popoverContent += "<tbody>";
    Object.keys(data.wordForms).forEach((form) => {
      popoverContent += "<tr>";
      popoverContent += `<td style="border: 1px solid gray; padding: 5px;">${form}</td>`;

      // data.wordForms[form] has two possibilities: string or key-value object.
      // If it's a string, it means that the word form is the same as the original word.
      // If it's a key-value object, it means we have to loop again with Object.entries()
      // to get the word forms.
      if (typeof data.wordForms[form] === "string") {
        popoverContent += `<td style="border: 1px solid gray; padding: 5px;">${data.wordForms[form]}</td>`;
      } else {
        popoverContent += '<td style="border: 1px solid gray; padding: 5px;">';
        popoverContent +=
          '<table style="width: 100%; border-collapse: collapse;">';
        popoverContent += "<thead>";
        popoverContent += "<tr>";
        popoverContent +=
          '<th style="border: 1px solid gray; padding: 5px;">Form</th>';
        popoverContent +=
          '<th style="border: 1px solid gray; padding: 5px;">Word</th>';

        popoverContent += "</tr>";
        popoverContent += "</thead>";
        popoverContent += "<tbody>";
        Object.entries(data.wordForms[form]).forEach(([key, value]) => {
          popoverContent += "<tr>";
          popoverContent += `<td style="border: 1px solid gray; padding: 5px;">${key}</td>`;
          popoverContent += `<td style="border: 1px solid gray; padding: 5px;">${value}</td>`;
          popoverContent += "</tr>";
        });
        popoverContent += "</tbody>";
        popoverContent += "</table>";
        popoverContent += "</td>";
      }

      popoverContent += "</tr>";
    });
    popoverContent += "</tbody>";
    popoverContent += "</table>";

    // Using DOMParser to parse the HTML string to DOM nodes
    const parser = new DOMParser();
    const popoverContentDOM = parser.parseFromString(
      popoverContent,
      "text/html"
    );
    const tags = popoverContentDOM.getElementsByTagName("body");

    // Get the innerHTML of the body tag
    popover.innerHTML = "";
    for (const tag of tags) {
      popover.appendChild(tag);
    }

    popover.style.position = "absolute";
    // Make the popover position always the center of the screen relative
    const popoverWidth = popover.offsetWidth;
    const popoverHeight = popover.offsetHeight;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;
    const top = rect.top + scrollTop + rect.height / 2 - popoverHeight / 2;
    const left = rect.left + scrollLeft + rect.width / 2 - popoverWidth / 2;
    const maxTop = scrollTop + viewportHeight - popoverHeight;
    const maxLeft = scrollLeft + viewportWidth - popoverWidth;
    popover.style.top = `${Math.min(Math.max(top, scrollTop), maxTop)}px`;
    popover.style.left = `${Math.min(Math.max(left, scrollLeft), maxLeft)}px`;

    popover.style.backgroundColor = "white";
    popover.style.padding = "8px";
    popover.style.border = "1px solid gray";
    popover.style.zIndex = "9999";
    popover.style.width = "500px";

    // Make the popover height fix with scrollable content
    popover.style.maxHeight = "200px";
    popover.style.overflowY = "auto";

    // Make the popover div > body padding 0
    popover.childNodes[0].style.padding = "0";
    popover.childNodes[0].style.margin = "0";
    popover.childNodes[0].style.backgroundColor = "white";
    popover.childNodes[0].style.textAlign = "left";
    popover.childNodes[0].style.minWidth = "fit-content";

    // Make the popover div > ol and ul padding 0
    const lists = popover.querySelectorAll("ol, ul");
    for (const list of lists) {
      list.style.padding = "0";
      list.style.margin = "0px 0px 0px 20px";
      list.style.fontSize = "1rem";
      list.style.listStyleType = "bullet";
    }

    // Make all p fontweight normal
    const paragraphs = popover.querySelectorAll("p");
    for (const paragraph of paragraphs) {
      paragraph.style.fontWeight = "normal";
      paragraph.style.fontSize = "1rem";
    }

    // Make the table, thead, tbody width fit the content
    const tables = popover.querySelectorAll("table");
    for (const table of tables) {
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
    }

    // Make the table th, td padding 5px
    const tableCells = popover.querySelectorAll("th, td");
    for (const cell of tableCells) {
      cell.style.border = "1px solid gray";
      cell.style.padding = "5px";
    }

    // Make the table th, td text align left
    const tableCellsTextAlignLeft = popover.querySelectorAll("th, td");
    for (const cell of tableCellsTextAlignLeft) {
      cell.style.textAlign = "left";
    }

    // Make the table th, td font size 1rem
    const tableCellsFontSize = popover.querySelectorAll("th, td");
    for (const cell of tableCellsFontSize) {
      cell.style.fontSize = "1rem";
    }

    // Function to close the popover
    const closePopover = () => {
      document.removeEventListener("click", closePopover);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.removeChild(popover);
    };

    // Function to handle keydown events
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closePopover();
      }
    };

    // Append the popover to the document body
    document.body.appendChild(popover);

    // Add event listeners to close the popover
    document.addEventListener("click", closePopover);
    document.addEventListener("keydown", handleKeyDown);
  }

  if (message.action === "showError") {
    const { error } = message;

    // Show an alert with the error message and set the title to: Sõnastik - Error
    if (typeof error === "string") {
      alert(error);
    } else {
      alert("The word definition could not be found. Please try another word.");
    }
  }
});
