import { getActiveTabURL } from "./utils.js";
// adding a new bookmark row to the popup
const addNewBookmark = (bookmarksElement,bookmark) => {
    const bookmarkTitleElement = document.createElement('div')
    const newBookmarkElement = document.createElement('div')

    const controlElement = document.createElement("div")

    bookmarkTitleElement.textContent = bookmark.desc
    bookmarkTitleElement.className = "bookmark-title"
    
    controlElement.className = "bookmark-controls"

    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time)

    setBookmarkAttributes("play",onPlay,controlElement)
    setBookmarkAttributes("delete",onDelete,controlElement)

    newBookmarkElement.appendChild(bookmarkTitleElement)
    newBookmarkElement.appendChild(controlElement)
    bookmarksElement.appendChild(newBookmarkElement)
};

const viewBookmarks = (currentVideoBookmarks=[]) => {

    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = ''
    if(currentVideoBookmarks.length > 0){
        for(let i=0;i<currentVideoBookmarks.length; i++){
            const bookmark = currentVideoBookmarks[i];
            addNewBookmark(bookmarksElement,bookmark)
        }
    }else{
        bookmarksElement.innerHTML = '<i class="row"> No bookmarks to show</i>'
    }
};

const onPlay = async(e) => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp")
    const activeTab = await getActiveTabURL()

    chrome.tabs.sendMessage(activeTab.id,{
        type : "PLAY",
        value : bookmarkTime 
    })
};

const onDelete = async e => {
    const activeTab = await getActiveTabURL()
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp")
    const bookmarkElementtoDel = document.getElementById("bookmark-"+ bookmarkTime)
    bookmarkElementtoDel.parentNode.removeChild(bookmarkElementtoDel) 
    chrome.tabs.sendMessage(activeTab.id,{
        type : "DELETE",
        value : bookmarkTime,
        videoId : null
    }).then(reload)
};

const setBookmarkAttributes =  (src,eventListener,controlParentElement) => {
    const controlElement = document.createElement("img")
    controlElement.src = "assets/" + src + ".png";
    controlElement.tile = src;
    controlElement.addEventListener("click",eventListener)
    controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async() => {
    const activeTab = await getActiveTabURL()
    const queryParameters = activeTab.url.split("?")[1]
    const urlParameters = new URLSearchParams(queryParameters)

    const currentVideo = urlParameters.get("v")

    if(activeTab.url.includes('youtube.com/watch') && currentVideo){
        chrome.storage.sync.get([currentVideo], (data)=>{
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : []

            viewBookmarks(currentVideoBookmarks)
        })
    }else{
        const container = document.getElementsByClassName('container')[0]
        container.innerHTML = '<div class = "title">This is not a youtube video page.</div>'
    }
});
const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);
  
    return date.toISOString().substring(11, 11+8);
  };
const reload = async ()=>{
    const activeTab = await getActiveTabURL()
    const queryParameters = activeTab.url.split("?")[1]
    const urlParameters = new URLSearchParams(queryParameters)

    const currentVideo = urlParameters.get("v")

    if(activeTab.url.includes('youtube.com/watch') && currentVideo){
        chrome.storage.sync.get([currentVideo], (data)=>{
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : []

            viewBookmarks(currentVideoBookmarks)
        })
    }else{
        const container = document.getElementsByClassName('container')[0]
        container.innerHTML = '<div class = "title">This is not a youtube video page.</div>'
    }
}
