// Receive the message from the background script.
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'openPopover') {
    const { data } = message;

    // Get the selected text range and its bounding rectangle
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Calculate the popover position relative to the selected text
    const popover = document.createElement('div');

    let popoverContent = `<h2>${data.word}</h2>`;
    // create badge for part of speech
    popoverContent += `<p style="margin: 10px 0;"><span style="background-color: #d2dded; padding: 5px; border-radius: 5px;">${data.partOfSpeech.join(', ')}</span></p>`;
    
    data.meanings.forEach((meaning, idx) => {
      popoverContent += `<div style="margin: 20px 0;">`;
      popoverContent += `<h3>Definition ${idx + 1}</strong></h3>`;
      popoverContent += `<p>${meaning.definition}</p>`;

      popoverContent += `<p>Example:</p>`;

      if (meaning.examples.length === 0) {
        popoverContent += `<p><i>No examples found.</i></p>`;
      } else {
        popoverContent += `<ul>`;
        meaning.examples.forEach((example) => {
          popoverContent += `<li>${example}</li>`;
        });
        popoverContent += `</ul>`;
      }

      if (meaning.synonyms.length > 0) {
        popoverContent += `<p>Synonyms:</p>`;
        popoverContent += `<ul>`;
        meaning.synonyms.forEach((synonym) => {
          popoverContent += `<li>${synonym}</li>`;
        });
        popoverContent += `</ul>`;
      }
      popoverContent += `</div>`;
    });

    popoverContent += '<h3>Word forms</h3>';

    // Showing word forms as a table: data.wordForms is a key-value object
    popoverContent += '<table style="width: 100%; border-collapse: collapse;">';
    popoverContent += '<thead>';
    popoverContent += '<tr>';
    popoverContent += '<th style="border: 1px solid gray; padding: 5px;">Form</th>';
    popoverContent += '<th style="border: 1px solid gray; padding: 5px;">Word</th>';
    popoverContent += '</tr>';
    popoverContent += '</thead>';
    popoverContent += '<tbody>';
    Object.keys(data.wordForms).forEach((form) => {
      popoverContent += '<tr>';
      popoverContent += `<td style="border: 1px solid gray; padding: 5px;">${form}</td>`;

      // data.wordForms[form] has two possibilities: string or key-value object.
      // If it's a string, it means that the word form is the same as the original word.
      // If it's a key-value object, it means we have to loop again with Object.entries()
      // to get the word forms.
      if (typeof data.wordForms[form] === 'string') {
        popoverContent += `<td style="border: 1px solid gray; padding: 5px;">${data.wordForms[form]}</td>`;
      } else {
        popoverContent += '<td style="border: 1px solid gray; padding: 5px;">';
        popoverContent += '<table style="width: 100%; border-collapse: collapse;">';
        popoverContent += '<thead>';
        popoverContent += '<tr>';
        popoverContent += '<th style="border: 1px solid gray; padding: 5px;">Form</th>';
        popoverContent += '<th style="border: 1px solid gray; padding: 5px;">Word</th>';

        popoverContent += '</tr>';
        popoverContent += '</thead>';
        popoverContent += '<tbody>';
        Object.entries(data.wordForms[form]).forEach(([key, value]) => {
          popoverContent += '<tr>';
          popoverContent += `<td style="border: 1px solid gray; padding: 5px;">${key}</td>`;
          popoverContent += `<td style="border: 1px solid gray; padding: 5px;">${value}</td>`;
          popoverContent += '</tr>';
        });
        popoverContent += '</tbody>';
        popoverContent += '</table>';
        popoverContent += '</td>';
      }

      popoverContent += '</tr>';
    });
    popoverContent += '</tbody>';
    popoverContent += '</table>';
    
    // Inject popover content to the popover element
    popover.innerHTML = popoverContent;

    popover.style.position = 'absolute';
    popover.style.top = `${rect.top + window.scrollY}px`;
    popover.style.left = `${rect.left + window.scrollX}px`;
    popover.style.backgroundColor = 'white';
    popover.style.padding = '8px';
    popover.style.border = '1px solid gray';

    // Make the popover z-index higher than other elements in the page
    popover.style.zIndex = '9999';

    // Function to close the popover
    const closePopover = () => {
      document.removeEventListener('click', closePopover);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.removeChild(popover);
    };

    // Function to handle keydown events
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closePopover();
      }
    };

    // Append the popover to the document body
    document.body.appendChild(popover);

    // Add event listeners to close the popover
    document.addEventListener('click', closePopover);
    document.addEventListener('keydown', handleKeyDown);
  }

  if (message.action === 'showError') {
    const { error } = message;

    // Show an alert with the error message and set the title to: Sõnastik - Error
    if (typeof error === 'string') {
      alert(error);
    } else {
      alert('The word definition could not be found. Please try another word.');
    }
  }
});
