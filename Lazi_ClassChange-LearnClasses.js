/*:
 * @author Lazislacker
 * @target MZ
 * @plugindesc REQUIRES a Lazi_ClassChange plugin! Adds the ability to learn classes based on levels in other classes
 * @help
 * REQUIRES a Lazi_ClassChange plugin!
 * This plugin sdds the ability to learn classes 
 * based on levels in other classes
 * --------------
 * |Version: 1.0|
 * --------------
 * 
 * ---------------
 * |Documentation|
 * ---------------
 * This plugin allows notetags to be placed on an Actor that will allow the actor to learn classes
 * when they reach a certain level in another class or a combination of other classes.
 * THere are four notetags that are used for this in the various Class Change modes.
 * 
 * >==Shared EXP Mode<==
 * <LaziLearnableClass:[level]>
 * 
 * >==Individual EXP Mode<==
 * (The ... represents a series being possible)
 * <LaziLearnableClassAND:|[classId],[level]|...> -> All of the classes must be at the specified level
 * <LaziLearnableClassOR:|[classId],[level]|...> -> At least one of the classes must be at the level
 * 
 * >==Actor Mode<==
 * (The ... represents a series being possible)
 * <LaziLearnableClassAND:|[classId],[level]|...> -> All of the classes must be at the specified level
 * <LaziLearnableClassOR:|[classId],[level]|...> -> At least one of the classes must be at the level
 * <LaziLearnableClassBase:[level]>
 */

//------------------------------//
//      Boilerplate/General     //
//------------------------------//
var Imported = Imported || {};

//If we don't have a class change plugin imported we can't do much.
if (Imported.Lazi_ClassChange || Imported.Lazi_ClassChangeBasic) {

    Imported.Lazi_CC_LearnClasses = true;

    var Lazi = Lazi || {};
    Lazi.Lazi_CC_LearnClasses = Lazi.Lazi_CC_LearnClasses || {};
    Lazi.Utils = Lazi.Utils || {};
    Lazi.Lazi_CC_LearnClasses.version = "1.0.0";
    Lazi.Utils.Debug = false;
    if (Imported.Lazi_ClassChangeBasic) {
        Lazi.Lazi_CC_LearnClasses.VersionUsed = "CCBasic";
    } else {
        Lazi.Lazi_CC_LearnClasses.VersionUsed = "CC";
    }


    //------------------------------//
    //      Helper Objects          //
    //------------------------------//
    class Lazi_ClassChange_ClassObjectLearnCondition {
        constructor(requirements, classID, comparison = "or") {

            //If they didn't give us an OR or AND, just use OR
            if (comparison.toLowerCase() != "or" && comparison.toLowerCase() != "and") {
                this.comparison = "or"
            } else {
                this.comparison = comparison;
            }
            this.ID = classID;
            this.requirements = requirements
        }
    }

    class Lazi_ClassChange_ClassObjectLearnConditionRequirement {
        constructor(classID, classLevel) {
            this.ID = classID;
            this.level = classLevel;
        }
    }

    Lazi.Lazi_CC_LearnClasses.shouldShowLevels = function () {
        return (Lazi.Lazi_CC_LearnClasses.VersionUsed == "CC") ? Lazi.ClassChange.shouldShowLevels() : Lazi.ClassChangeBasic.shouldShowLevels();
    }

    Lazi.Lazi_CC_LearnClasses.isActorLevelMode = function () {
        return (Lazi.Lazi_CC_LearnClasses.VersionUsed == "CC") ? Lazi.ClassChange.isActorLevelMode() : false;
    }

    Lazi.Lazi_CC_LearnClasses.ClassLevelByExp = function (classId, expAmount) {
        return (Lazi.Lazi_CC_LearnClasses.VersionUsed == "CC") ? Lazi.ClassChange.ClassLevelByExp(classId, expAmount) : Lazi.ClassChangeBasic.ClassLevelByExp(classId, expAmount);
    }

    Lazi.Lazi_CC_LearnClasses.addActorClass = function (args) {
        return (Lazi.Lazi_CC_LearnClasses.VersionUsed == "CC") ? Lazi.ClassChange.addActorClass(args) : Lazi.ClassChangeBasic.addActorClass(args);
    }

    Lazi.Lazi_CC_LearnClasses.generateLearnableClassList = function () {
        let classes = $dataClasses;
        this.LearnableClasses = [];
        for (let i = 1; i < classes.length; ++i) {
            //Check to see if we have learn conditions
            let _class = classes[i];
            let note = _class.note;

            //If we're in invidual level mode we expect to see *AND/*OR tags.
            if (this.shouldShowLevels()) {
                //AND
                let matches = note.matchAll(/<\s*Lazi\s?Learnable\s?ClassAND[:]?\s*(.+)\s*>/ig)
                if (matches) {
                    for (match of matches) {

                        //Grab our requirements and create a condition object
                        let andpairs = match[1];
                        let newLearnCondition = new Lazi_ClassChange_ClassObjectLearnCondition([], _class.id, "AND");

                        //Get each of our requirements and create a requirement object for it
                        let pairs = andpairs.matchAll(/\|\s*(\d+)\s*,\s*(\d+)\s*\|/ig)
                        for (pair of pairs) {
                            let newReq = new Lazi_ClassChange_ClassObjectLearnConditionRequirement(pair[1], pair[2]);
                            newLearnCondition.requirements.push(newReq);
                        }

                        //Add it to the list of learnables
                        this.LearnableClasses.push(newLearnCondition);
                    }
                }

                //OR
                matches = note.matchAll(/<\s*Lazi\s?Learnable\s?ClassOR[:]?\s*(.+)\s*>/ig)
                if (matches) {
                    for (match of matches) {

                        //Grab our requirements and create a condition object
                        let andpairs = match[1];
                        let newLearnCondition = new Lazi_ClassChange_ClassObjectLearnCondition([], _class.id, "OR");

                        //Get each of our requirements and create a requirement object for it
                        let pairs = andpairs.matchAll(/\|\s*(\d+)\s*,\s*(\d+)\s*\|/ig)
                        for (pair of pairs) {
                            let newReq = new Lazi_ClassChange_ClassObjectLearnConditionRequirement(pair[1], pair[2]);
                            newLearnCondition.requirements.push(newReq);
                        }

                        //Add it to the list of learnables
                        this.LearnableClasses.push(newLearnCondition);
                    }
                }
            }
            //If we're in shared level mode we expect to see LaziLearnableClass tags.
            else {
                matches = note.matchAll(/<\s*Lazi\s?Learnable\s?Class[:]?\s*(\d+)\s*>/ig)
                if (matches) {
                    for (match of matches) {
                        let level = match[1];
                        let newLearnCondition = new Lazi_ClassChange_ClassObjectLearnCondition(parseInt(level), _class.id);

                        //Add it to the list of learnables
                        this.LearnableClasses.push(newLearnCondition);
                    }
                }
            }
            if (this.isActorLevelMode()) {
                matches = note.matchAll(/<\s*Lazi\s?Learnable\s?ClassBase[:]?\s*(\d+)\s*>/ig)
                if (matches) {
                    for (match of matches) {
                        let level = match[1];
                        let newLearnCondition = new Lazi_ClassChange_ClassObjectLearnCondition(parseInt(level), _class.id, "BASE");

                        //Add it to the list of learnables
                        this.LearnableClasses.push(newLearnCondition);
                    }
                }
            }
        }
    }

    Lazi.Lazi_CC_LearnClasses.checkForNewClasses = function (actor) {
        for (learnable of this.LearnableClasses) {
            if (this.shouldShowLevels()) {
                if (learnable.comparison.toLowerCase() == "base") {
                    if (actor.Lazi_GetACTORMODELevel() >= learnable.requirement) {
                        this.addActorClass({
                            actorId: actor._actorId,
                            classId: learnable.ID,
                            type: "Add"
                        })
                    }
                    let reqsSatisfied = [];
                    for (requirement of learnable.requirements) {

                        //If they don't have any EXP in it or don't have it, don't bother checking
                        if (actor._exp[requirement.ID] == 0 || !actor._exp[requirement.ID]) {
                            reqsSatisfied.push(false);
                            continue;
                        }
                        if (this.ClassLevelByExp(requirement.ID, actor._exp[requirement.ID]) >= requirement.level) {
                            reqsSatisfied.push(true);
                        } else {
                            reqsSatisfied.push(false);
                        }
                    }

                    console.log(reqsSatisfied);
                    //AND
                    let canLearn = true;
                    if (learnable.comparison.toLowerCase() == "and") {
                        for (satisfied of reqsSatisfied) {
                            if (!satisfied) {
                                canLearn = false;
                                break;
                            }
                        }
                    }
                    //OR
                    else {
                        canLearn = false;
                        for (satisfied of reqsSatisfied) {
                            //If we have at least one true, no reason to continue
                            if (satisfied) {
                                canLearn = true;
                                break;
                            }
                        }
                    }
                    if (canLearn) {
                        //Reuse our Plugin Command to add it
                        this.addActorClass({
                            actorId: actor._actorId,
                            classId: learnable.ID,
                            type: "Add"
                        })
                    }
                } else {
                    //All EXP should be the same so just use the current class'
                    if (this.ClassLevelByExp(actor._classId, actor._exp[actor._classId]) >= learnable.requirements) {
                        this.addActorClass({
                            actorId: actor._actorId,
                            classId: learnable.ID,
                            type: "Add"
                        });
                    }
                }
            }
        }
    }

    //------------------------------//
    //        Scene Boot            //
    //------------------------------//
    Lazi.Lazi_CC_LearnClasses.SceneBoot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
    Scene_Boot.prototype.onDatabaseLoaded = function () {
        Lazi.Lazi_CC_LearnClasses.SceneBoot_onDatabaseLoaded.apply(this, arguments);
        Lazi.Lazi_CC_LearnClasses.generateLearnableClassList()
    }


    //------------------------------//
    //        Game Actor            //
    //------------------------------//
    Lazi.Lazi_CC_LearnClasses.GameActor_levelUp = Game_Actor.prototype.levelUp;
    Game_Actor.prototype.levelUp = function () {
        Lazi.Lazi_CC_LearnClasses.GameActor_levelUp.apply(this, arguments);
        Lazi.Lazi_CC_LearnClasses.checkForNewClasses(this);
    }
}