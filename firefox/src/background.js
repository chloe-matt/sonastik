// Create the context menu item
browser.contextMenus.create({
  id: 'explainWord',
  title: 'Explain "%s"',
  contexts: ['selection'] // Show the context menu item when text is selected
});

// Add an event listener for when the menu item is clicked
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'explainWord') {
    // Perform the action you want when the menu item is clicked
    const selectedText = info.selectionText;

    // Get the word explanation from the API
    getWordExplanation(selectedText).then((data) => {
      // Send a message to the content script to open the popover
      browser.tabs.sendMessage(tab.id, { action: 'openPopover', data });
    }).catch((error) => {
      // Send a message to the content script to show an error message
      browser.tabs.sendMessage(tab.id, { action: 'showError', error });
    });
  }
});

function getWordExplanation(word) {
  // Make a GET request to the API
  return fetch(`https://api.sonapi.ee/v1/${word}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`The definition for "${word}" could not be found.`);
      }
      return response.json();
    })
    .then((data) => {
      return data;
    });
}

