import { get, writable, type Writable } from 'svelte/store';

type Item = Folder | Playlist;

class BaseItem {
    public readonly id: string;

    private _parentId: string;
    private _nameStore: Writable<string>;

    constructor(name: string, parentId: string, id?: string) {
        this.id = id ? id : this.generateId();

        this._parentId = parentId;
        this._nameStore = writable(name);
    }

    public get parentId(): string {
        return this._parentId;
    }

    public set parentId(id: string) {
        this.parentId = id;
    }

    public get nameStore(): Writable<string> {
        return this._nameStore;
    }

    public set name(name: string) {
        this._nameStore.update(() => name);
    }

    private generateId() : string {
        let d = new Date().getTime();
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

        return uuid;
    }
}

export class Folder extends BaseItem {
    public readonly folderIdsStore: Writable<string[]>;
    public readonly playlistIdsStore: Writable<string[]>;

    constructor(name: string, parentId: string, id?: string) {
        super(name, parentId, id);

        this.folderIdsStore = writable([]);
        this.playlistIdsStore = writable([]);
    }

    public addFolderId(id: string) {
        if (get(this.folderIdsStore).includes(id)) return;

        this.folderIdsStore.update(current => [...current, id]);
    }

    public addPlaylistId(id: string) {
        if (get(this.playlistIdsStore).includes(id)) return;

        this.playlistIdsStore.update(current => [...current, id]);
    }
}

export class Playlist extends BaseItem {
    public readonly videoIdsStore: Writable<string[]>;

    constructor(name: string, parentId: string) {
        super(name, parentId);

        this.videoIdsStore = writable([]);
    }

    public addVideoId(id: string) {
        if (get(this.videoIdsStore).includes(id)) return;

        this.videoIdsStore.update(current => [...current, id]);
    }
}

export class Video {
    private _idStore: Writable<string>;
    private _title: string;

    constructor(id: string) {
        this._idStore = writable(id);
        this._title = 'Video title';
    }

    public get idStore(): Writable<string> {
        return this._idStore;
    }

    public get id(): string {
        return get(this._idStore);
    }

    public set id(id: string) {
        this._idStore.update(() => id);
    }

    public get title(): string {
        return this._title;
    }

    public set title(title: string) {
        this._title = title;
    }
}

class LibraryDataSingleton {
    private _items: Map<string, Item>;
    private _videos: Map<string, Video>;
    private root: Folder;
    private curIdStore: Writable<string>;

    constructor(rootName: string, rootId: string) {
        this.root = new Folder(rootName, rootId, rootId);
        this.curIdStore = writable(rootId);

        this._items = new Map([[rootId, this.root]]);
        this._videos = new Map([]);
    }

    public get items(): Map<string, Item> {
        return this._items;
    }

    public getCurItemIdStore(): Writable<string> {
        return this.curIdStore;
    }

    public setCurItemId(id: string) {
        this.curIdStore.update(() => id);
    }

    public getItemPath(id: string): Item[] {
        if (id == this.root.id) return [this.root];
        
        let item = this.getItemFromId(id);
        const path = [item];
        do {
            item = this.getItemFromId(item.parentId);
            path.unshift(item);
        } while (item !== this.root)

        return path;
    }

    public getItemFromId(id: string): Item {
        const item = this._items.get(id);
        if (!item) throw new Error(`Invalid id: ${id}`);

        return item;
    }

    public getItemsFromIds(ids: string[]): Item[] {
        return ids.map(id => this.getItemFromId(id));
    }

    public getVideoFromId(id: string): Video {
        const video = this._videos.get(id);
        if (!video) throw new Error(`Invalid id: ${id}`);

        return video;
    }

    public getVideosFromIds(ids: string[]): Video[] {
        return ids.map(id => this.getVideoFromId(id));
    }

    public createFolder(name?: string, parentId?: string) {
        name = name ? name : 'New Folder';
        parentId = parentId ? parentId : get(this.curIdStore);

        const parent = this.getItemFromId(parentId);
        if (!parent || !(parent instanceof Folder)) return;

        const item = new Folder(name, parentId);
        this._items.set(item.id, item);

        (parent as Folder).addFolderId(item.id);
    }

    public createPlaylist(name?: string, parentId?: string) {
        name = name ? name : 'New Playlist';
        parentId = parentId ? parentId : get(this.curIdStore);

        const parent = this.getItemFromId(parentId);
        if (!parent || !(parent instanceof Folder)) return;

        const item = new Playlist(name, parentId);
        this._items.set(item.id, item);

        (parent as Folder).addPlaylistId(item.id);
    }

    public addVideo(id: string, parentId?: string) {
        parentId = parentId ? parentId : get(this.curIdStore);

        const parent = this.getItemFromId(parentId);
        if (!parent || !(parent instanceof Playlist)) return;

        const video = new Video(id);
        this._videos.set(video.id, video);

        (parent as Playlist).addVideoId(video.id);
    }
}

const LibraryData = new LibraryDataSingleton('Library', '0');
export default LibraryData;