// Create the context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "explainWord",
    title: 'Explain "%s"',
    contexts: ["selection"] // Show the context menu item when text is selected
  })
})

// Add an event listener for when the menu item is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explainWord") {
    // Perform the action you want when the menu item is clicked
    const selectedText = info.selectionText

    // Get the word explanation from the API
    getWordExplanation({ word: selectedText, tab })
      .then((data) => {
        console.log(data)
        // Send a message to the content script to open the popover
        chrome.tabs.sendMessage(tab.id, { action: "openPopover", data })
      })
      .catch((error) => {
        // Send a message to the content script to show an error message
        chrome.tabs.sendMessage(tab.id, { action: "showError", error })
      })
  }
})

function getWordExplanation({ word, tab }) {
  // Make a GET request to the API
  return fetch(`https://api.sonapi.ee/v2/${word}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`The definition for "${word}" could not be found.`)
      }
      return response.json()
    })
    .then((data) => {
      return data
    })
    .catch((error) => {
      // Send a message to the content script to show an error message
      chrome.tabs.sendMessage(tab.id, { action: "showError", error })
    })
}
