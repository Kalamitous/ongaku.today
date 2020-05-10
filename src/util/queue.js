export const getNextVideo = (loopPlaylist, queue) => {
    return loopPlaylist && queue.curIndex === queue.ids.length - 1 ? queue.ids[0] : queue.ids[Math.min(queue.ids.length - 1, queue.curIndex + 1)]
}

export const getPrevVideo = (loopPlaylist, queue) => {
    return loopPlaylist && queue.curIndex === 0 ? queue.ids[queue.ids.length - 1] : queue.ids[Math.max(0, queue.curIndex - 1)]
}
