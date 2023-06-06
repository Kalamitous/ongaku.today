import { Video } from './data';

class QueueDataSingleton {
    private _videos: Video[];

    constructor() {
        this._videos = [
            new Video('Vyo2m2CbdUs'),
            new Video('Vyo2m2CbdUa'),
            new Video('Vyo2m2CbdUb'),
            new Video('Vyo2m2CbdUc'),
            new Video('Vyo2m2CbdUd'),
            new Video('Vyo2m2CbdUe'),
            new Video('Vyo2m2CbdUf'),
            new Video('Vyo2m2CbdUg'),
            new Video('Vyo2m2CbdUh'),
            new Video('Vyo2m2CbdUi'),
            new Video('Vyo2m2CbdUj'),
            new Video('Vyo2m2CbdUk'),
            new Video('Vyo2m2CbdUl'),
        ];
    }

    public get videos(): Video[] {
        return this._videos;
    }
}

const QueueData = new QueueDataSingleton();
export default QueueData;