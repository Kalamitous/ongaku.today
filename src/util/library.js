export const get = (state, id) => {
    return state.objects[id]
}

export const getLoaded = (state, id) => {
    const item = get(state, id)
    if (!item) return false
    // if a child isn't cached then we know the folder hasn't been loaded
    if (item.folders) {
        return !(item.folders.length > 0 && !state.objects[item.folders[0]]) &&
        !(item.playlists.length > 0 && !state.objects[item.playlists[0]])
    }
    return true
}

export const getName = (state, id) => {
    const item = get(state, id)
    let name = item.name
    if (!name) {
        if (!item.parent) {
            name = 'Home'
        } else if (isFolder(state, id)) {
            name = 'New Folder'
        } else {
            name = 'New Playlist'
        }
    }
    return name
}

export const getAllVideos = async (state, id, loadPlaylist) => {
    let videos = []
    const recursiveAdd = parentId => {
        if (get(state, parentId).videos) {
            videos = videos.concat(get(state, parentId).videos)
        }
        return loadPlaylist(parentId).then(() => {
            if (isFolder(state, parentId)) {
                const folderPromises = get(state, parentId).folders.map((childId) => 
                    recursiveAdd(childId)
                )
                const playlistPromises = get(state, parentId).playlists.map((childId) => 
                    recursiveAdd(childId)
                )
                return Promise.all(folderPromises.concat(playlistPromises))
            }
        })
    }
    await recursiveAdd(id)
    return videos
}

export const getTypeFromID = (state, id) => {
    if (isFolder(state, id)) {
        return 'folders'
    }
    return 'playlists'
}

export const isFolder = (state, id) => Boolean(get(state, id) && get(state, id).folders)
