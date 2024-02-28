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

    // Send a message to the content script to open the popover
    chrome.tabs.sendMessage(tab.id, {
      action: "openPopover",
      data: { requestedWord: selectedText }
    })
  }
})
