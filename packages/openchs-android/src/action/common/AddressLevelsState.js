import _ from 'lodash';

class AddressLevelsState {
    constructor(levels = []) {
        const unsortedLevels = Object.entries(_.uniqBy(levels, l => l.uuid)
            .reduce((acc, {uuid, name, level, type, locationMappings, isSelected = false}) => {
                acc[type] = _.defaultTo(acc[type], []).concat([{
                    uuid,
                    name,
                    level,
                    type,
                    locationMappings,
                    isSelected
                }]);
                return acc;
            }, {}));
        this.levels = unsortedLevels.map(([levelType, levels]) => {
            const other = _.find(levels, (level) => _.startsWith(level.name, "Other"));
            if(!_.isNil(other)) {
                const levelsExcludingOther = _.filter(levels, (level) => level.name !== other.name);
                const sortedLevels = _.sortBy(levelsExcludingOther, "name");
                const levelsEndingWithOther = _.concat(sortedLevels, other);
                return [levelType, levelsEndingWithOther];
            } else {
                return [levelType, _.sortBy(levels, "name")];
            }

        });
    }

    static canBeUsed(level) {
        return level.isSelected || _.isEmpty(level.locationMappings);
    }

    _asList(levelMap = new Map(this.levels)) {
        return _.flatten([...levelMap.values()]);
    }


    get selectedAddresses() {
        return this._asList().filter(l => l.isSelected);
    }

    isSelected(uuid) {
        return this.selectedAddresses.some(sa => sa.uuid === uuid);
    }

    get lowestSelectedAddresses() {
        if (_.isEmpty(this.selectedAddresses)) return [];
        const minLevel = _.minBy(this.selectedAddresses, l => l.level).level;
        return this.selectedAddresses.filter(l => l.level === minLevel);
    }

    addLevel(type, selectedLevel, newLevels = []) {
        let levelMap = new Map(this.levels);
        const levels = levelMap.get(type);
        levelMap.set(type, levels.map(l => ({
            ...l,
            isSelected: l.uuid === selectedLevel.uuid ? !l.isSelected : l.isSelected
        })));
        return new AddressLevelsState(this._asList(levelMap)).addOrRemoveLevels(selectedLevel.uuid, newLevels).removeUnwantedLevels();
    }

    selectLevel(type, selectedLevel, newLevels = []) {
        const allCurrentLevels = this._asList();
        allCurrentLevels.filter(it => it.level === selectedLevel.level).forEach(l => {
            l.isSelected = l.uuid === selectedLevel.uuid ? !l.isSelected : false
        });
        const toRemove = allCurrentLevels.filter(l => l.level < selectedLevel.level);
        return new AddressLevelsState(allCurrentLevels).addLevels(newLevels)
            .removeLevels(toRemove)
            .removeUnwantedLevels();
    }

    addLevels(levels) {
        return new AddressLevelsState(this._asList().concat(levels));
    }

    removeLevels(levels) {
        return new AddressLevelsState(_.differenceBy(this._asList(), levels, (a) => a.uuid));
    }

    removeUnwantedLevels() {
        const levels = this._asList();
        const getParent = mapping => _.find(levels, it => it.uuid === mapping.parent.uuid);
        return new AddressLevelsState(levels.filter(l => {
            return AddressLevelsState.canBeUsed(l) || _(l.locationMappings).map(getParent).reject(_.isNil)
                .some(AddressLevelsState.canBeUsed);
        }));
    }

    addOrRemoveLevels(selectedLevelUUID, levels) {
        return this.isSelected(selectedLevelUUID) ?
            this.addLevels(levels) :
            this.removeLevels(levels);
    }

    defaultTo(state) {
        return _.isEmpty(this.selectedAddresses) ? state : this;
    }
}

export default AddressLevelsState;