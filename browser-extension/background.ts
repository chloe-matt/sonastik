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

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchWordData") {
    fetchWordData(message.query)
      .then(data => sendResponse(data))
      .catch(error => sendResponse({ error: error.message }))
    
    // Return true to indicate you'll respond asynchronously
    return true
  }
})

async function fetchWordData(query) {
  const API_BASE_URL = "https://www.sonastik.ee/api"

  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`)
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error in background script:", error)
    throw error
  }
}
