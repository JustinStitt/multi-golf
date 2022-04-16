import * as level_01 from './level_01_2x2';
import * as level_02 from './level_02_2x2';


const loadLevels = () => {
    let levels = [];
    levels.push(level_01.setupLevel());
    levels.push(level_02.setupLevel());

    return levels;
}

export default loadLevels;