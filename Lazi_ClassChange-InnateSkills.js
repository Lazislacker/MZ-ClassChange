/*:
 * @author Lazislacker
 * @target MZ
 * @plugindesc REQUIRES a Lazi_ClassChange plugin! Adds the ability to learn classes based on a variety of criteria
 * @help
 * REQUIRES a Lazi_ClassChange plugin!
 * This plugin sdds the ability to learn classes 
 * based on levels in other classes
 * --------------
 * |Version: 1.0.0|
 * --------------
 * 
 * ---------------
 * |Documentation|
 * ---------------
 * This plugin allows notetags to be placed on Actor's that will grant them skills when certain requirements are met.
 * These skills can be used by the Actor regardless of what their current class is set too.
 * The following notetags are used to add innate skills to an actor:
 *  *<LaziInnateSkill:[skillID],[level]> -> This will add the skill to the actor when they reach the required level in
 *   any class. This includes the Base class in Actor Mode.
 *  *<LaziInnateSkillBASE:[skillID],[level]> -> This will add the skill to the actor when they reach the required level
 *   in their base class. This tag is only active in Actor Mode and will do nothing in any other mode.
 *  *<LaziInnateSkill:[skillID]ReqSkills:[skillID],...?> -> This will add the skill to the actor when they know all
 *   skills in the ReqSkills list at the same time.
 *  *<LaziInnateSkill:[skillID]ReqANDClass:|[classID],[classLevel]|...> -> This will add the skill to the actor
 *   when they reach the required level for all the classes in the list.
 *  *<LaziInnateSkill:[skillID]ReqORClass:|[classID],[classLevel]|...> -> This will add the skill to the actor
 *   when they reach the required level for at least one of the classes in the list.
 * 
 * Examples:
 *  *<LaziInnateSkill:1,10>
 *  *<LaziInnateSkillBASE:1,15>
 *  *<LaziInnateSkill:1ReqSkills:3,4,5>
 *  *<LaziInnateSkill:1ReqANDClass:|2,10||3,5||4,15|>
 *  *<LaziInnateSkill:1ReqORClass:|2,15||3,10|>
 */

//------------------------------//
//      Boilerplate/General     //
//------------------------------//
var Imported = Imported || {};

//If we don't have a class change plugin imported we can't do much.
if (Imported.Lazi_ClassChange || Imported.Lazi_ClassChangeBasic) {

    Imported.Lazi_CC_InnateSkills = true;

    var Lazi = Lazi || {};
    Lazi.Lazi_CC_InnateSkills = Lazi.Lazi_CC_InnateSkills || {};
    Lazi.Utils = Lazi.Utils || {};
    Lazi.Lazi_CC_InnateSkills.version = "1.0.0";
    Lazi.Utils.Debug = false;
    if (Imported.Lazi_ClassChangeBasic) {
        Lazi.Lazi_CC_InnateSkills.VersionUsed = "CCBasic";
    } else {
        Lazi.Lazi_CC_InnateSkills.VersionUsed = "CC";
    }


    //------------------------------//
    //      Helper Objects          //
    //------------------------------//
    class Lazi_ClassChange_InnateSkills {
        constructor(skillID, conditions) {
            this.ID = skillID;
            this.conditions = conditions;
        }
    }

    Lazi.Lazi_CC_InnateSkills.shouldShowLevels = function () {
        return (Lazi.Lazi_CC_InnateSkills.VersionUsed == "CC") ? Lazi.ClassChange.shouldShowLevels() : Lazi.ClassChangeBasic.shouldShowLevels();
    }

    Lazi.Lazi_CC_InnateSkills.isActorLevelMode = function () {
        return (Lazi.Lazi_CC_InnateSkills.VersionUsed == "CC") ? Lazi.ClassChange.isActorLevelMode() : false;
    }

    Lazi.Lazi_CC_InnateSkills.ClassLevelByExp = function (classId, expAmount) {
        return (Lazi.Lazi_CC_InnateSkills.VersionUsed == "CC") ? Lazi.ClassChange.ClassLevelByExp(classId, expAmount) : Lazi.ClassChangeBasic.ClassLevelByExp(classId, expAmount);
    }

    Lazi.Lazi_CC_InnateSkills.addActorClass = function (args) {
        return (Lazi.Lazi_CC_InnateSkills.VersionUsed == "CC") ? Lazi.ClassChange.addActorClass(args) : Lazi.ClassChangeBasic.addActorClass(args);
    }

    Lazi.Lazi_CC_InnateSkills.generateInnateSkills = function (actor, actorId) {
        let actorData = $dataActors[actorId];
        let note = actorData.note;
        actor.Lazi_UnlearnedInnateSkills = [];
        actor.Lazi_LearnedInnateSkills = [];

        //Start simple, learn @ reaching level x
        let matches = note.matchAll(/<\s*Lazi\s?Innate\s?Skill[:]?\s*(\d+),(\d+)\s*>/ig);
        if (matches) {
            for (match of matches) {
                let skillID = match[1];
                let levelReq = match[2];

                actor.Lazi_UnlearnedInnateSkills.push(new Lazi_ClassChange_InnateSkills(skillID, {
                    type: "Simple",
                    level: levelReq
                }));
            }
        }

        if (this.isActorLevelMode()) {

            //Base Level reaches X value
            let matches = note.matchAll(/<\s*Lazi\s?Innate\s?SkillBASE[:]?\s*(\d+)\s*,\s*(\d+)\s*>/ig);
            if (matches) {
                for (match of matches) {
                    let skillID = match[1];
                    let levelReq = match[2];

                    actor.Lazi_UnlearnedInnateSkills.push(new Lazi_ClassChange_InnateSkills(skillID, {
                        type: "Base",
                        level: levelReq
                    }));
                }
            }
        }

        //Skill requiring other skills
        matches = note.matchAll(/<\s*Lazi\s?Innate\s?Skill[:]?\s*(\d+)\s?ReqSkills:([\d,\s]+)\s?>/ig);
        if (matches) {
            for (match of matches) {
                let skillID = match[1];
                let skillIDList = match[2].replace(/\s/g, '').split(','); //Strip all the spaces so our split works better.
                actor.Lazi_UnlearnedInnateSkills.push(new Lazi_ClassChange_InnateSkills(skillID, {
                    type: "OtherSkills",
                    skillList: skillIDList
                }));
            }
        }

        //Skill requiring a level/class combo
        if (this.shouldShowLevels()) {
            //AND matches
            matches = note.matchAll(/<\s*Lazi\s?Innate\s?Skill[:]?\s*(\d+)\s?ReqANDClass:(.+)\s?>/ig);
            if (matches) {
                for (match of matches) {
                    let skillID = match[1];
                    let innerConditions = match[2].matchAll(/|\s*(\d+)\s*,\s*(\d+)\s*|/ig);
                    let classConditions = [];
                    for (pair of innerConditions) {
                        classConditions.push({
                            classID: pair[1],
                            level: pair[2]
                        });
                    }
                    actor.Lazi_UnlearnedInnateSkills.push(new Lazi_ClassChange_InnateSkills(skillID, {
                        type: "ANDClassLevel",
                        conditionList: classConditions
                    }));
                }
            }

            //OR matches
            matches = note.matchAll(/<\s*Lazi\s?Innate\s?Skill[:]?\s*(\d+)\s?ReqORClass:(.+)\s?>/ig);
            if (matches) {
                for (match of matches) {
                    let skillID = match[1];
                    let innerConditions = match[2].matchAll(/|\s*(\d+)\s*,\s*(\d+)\s*|/ig);
                    let classConditions = [];
                    for (pair of innerConditions) {
                        classConditions.push({
                            classID: pair[1],
                            level: pair[2]
                        });
                    }
                    actor.Lazi_UnlearnedInnateSkills.push(new Lazi_ClassChange_InnateSkills(skillID, {
                        type: "ORClassLevel",
                        conditionList: classConditions
                    }));
                }
            }
        }
    }

    //Called once on startup to see if the initial level grants any skills and once every time a class level or base level is gained.
    Lazi.Lazi_CC_InnateSkills.checkForNewLearnedSkills = function (actor) {
        let otherSkillBased = [];
        let skillsToLearn = [];
        console.log("-----------------------------");
        console.log(actor.Lazi_UnlearnedInnateSkills);
        for (unlearnedSkill of actor.Lazi_UnlearnedInnateSkills) {
            switch (unlearnedSkill.conditions.type) {
                case "Simple":
                    console.log(`Our level is ${this.ClassLevelByExp(actor._classId, actor._exp[actor._classId])} >= ${unlearnedSkill.conditions.level}`)
                    console.log(this.ClassLevelByExp(actor._classId, actor._exp[actor._classId]) >= unlearnedSkill.conditions.level)
                    console.log(unlearnedSkill.conditions.level)
                    console.log(this.ClassLevelByExp(actor._classId, actor._exp[actor._classId]))
                    //If our level in the current class is greater, we should learn it. 
                    if (this.ClassLevelByExp(actor._classId, actor._exp[actor._classId]) >= unlearnedSkill.conditions.level) {
                        skillsToLearn.push(unlearnedSkill);
                    }
                    continue;

                case "Base":
                    if (actor.Lazi_GetACTORMODELevel() >= unlearnedSkill.conditions.level) {
                        skillsToLearn.push(unlearnedSkill);
                    }
                    continue;

                    //We want to check these seperately after, might end up learning a skill after this.
                case "OtherSkills":
                    otherSkillBased.push(unlearnedSkill);
                    continue;
                case "ANDClassLevel":
                case "ORClassLevel":
                    if (!this.shouldShowLevels()) {
                        continue;
                    }
                    let reqsSatisfied = [];
                    for (condition of unlearnedSkill.conditions.classConditions) {
                        if (this.ClassLevelByExp(actor._exp[condition.classID]) >= condition.level) {
                            reqsSatisfied.push(true);
                        } else {
                            reqsSatisfied.push(false);
                        }
                    }
                    if (reqsSatisfied.length == 0) {
                        continue;
                    }
                    let learnSkill = true;
                    if (unlearnedSkill.conditions.type == "ORClassLevel") {
                        learnSkill = false;
                        for (req of reqsSatisfied) {
                            //If we have one success, we're good.
                            if (req) {
                                learnSkill = true;
                                break;
                            }
                        }
                    } else {
                        for (req of reqsSatisfied) {
                            if (!req) {
                                learnSkill = false;
                                break;
                            }
                        }
                    }
                    if (learnSkill) {
                        skillsToLearn.push(unlearnedSkill);
                    }
                    continue;
            }
        }
        for (unlearnedSkill of otherSkillBased) {
            let knownSkills = actor.skills();
            let success = true;
            for (otherSkill of unlearnedSkill.conditions.skillList) {
                let found = false;
                for (skill of knownSkills) {
                    if (skill.id == otherSkill) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    success = false;
                    break; //We failed at least one no reason to continue
                }
            }
            if (success) {
                skillsToLearn.push(unlearnedSkill);
            }
        }
        for (learnSkill of skillsToLearn){
            actor.Lazi_LearnInnateSkill(learnSkill);
        }
        console.log("-------------------------------");
    }
    //------------------------------//
    //        Scene Boot            //
    //------------------------------//
    Lazi.Lazi_CC_InnateSkills.SceneBoot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
    Scene_Boot.prototype.onDatabaseLoaded = function () {
        Lazi.Lazi_CC_InnateSkills.SceneBoot_onDatabaseLoaded.apply(this, arguments);
    }


    Lazi.Lazi_CC_InnateSkills.Window_StatusParams_setActor = Window_StatusParams.prototype.setActor
    Window_StatusParams.prototype.setActor = function(actor) {
        Lazi.Lazi_CC_InnateSkills.Window_StatusParams_setActor.apply(this, arguments);
        console.log(this);
        console.log(this._actor.param(1));
        console.log(this._actor.param(2));
        console.log(this._actor.param(3));
        console.log(this._actor.param);
    }

    //------------------------------//
    //        Game Actor            //
    //------------------------------//
    Game_Actor.prototype.Lazi_LearnInnateSkill = function (unlearnedSkill) {
        this.learnSkill(unlearnedSkill.ID);
        this.Lazi_NeedAddSkillType(unlearnedSkill);
        this.Lazi_LearnedInnateSkills.push(unlearnedSkill.ID);
        console.log(`Removing learned innate skill`)
        console.log(this.Lazi_UnlearnedInnateSkills);
        console.log(this.Lazi_UnlearnedInnateSkills.indexOf(unlearnedSkill));
        console.log("-------------------------------");
        this.Lazi_UnlearnedInnateSkills.splice(this.Lazi_UnlearnedInnateSkills.indexOf(unlearnedSkill), 1);
    }

    Game_Actor.prototype.Lazi_NeedAddSkillType = function (learnedSkill) {
        let skill = $dataSkills[learnedSkill.ID];
        //If they don't have that skill type we need to add it so they can use it.
        if (!this.skillTypes().includes(skill.stypeId)) {
            this.actor().traits.push({
                code: Game_BattlerBase.TRAIT_STYPE_ADD,
                dataId: skill.stypeId,
                value: 1
            })
        }
    }

    Lazi.Lazi_CC_InnateSkills.GameActor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function (actorId) {
        Lazi.Lazi_CC_InnateSkills.generateInnateSkills(this, actorId);
        Lazi.Lazi_CC_InnateSkills.GameActor_setup.apply(this, arguments);
    }

    Lazi.Lazi_CC_InnateSkills.GameActor_levelUp = Game_Actor.prototype.levelUp;
    Game_Actor.prototype.levelUp = function () {
        Lazi.Lazi_CC_InnateSkills.GameActor_levelUp.apply(this, arguments);
        Lazi.Lazi_CC_InnateSkills.checkForNewLearnedSkills(this);
        console.log(`Current actor skills`, this.skills())
    }

    Lazi.Lazi_CC_InnateSkills.GameActor_initSkills = Game_Actor.prototype.initSkills;
    Game_Actor.prototype.initSkills = function () {
        Lazi.Lazi_CC_InnateSkills.GameActor_initSkills.apply(this, arguments);
        if (!this.Lazi_LearnedInnateSkills) {
            return;
        }
        for (learnedSkill of this.Lazi_LearnedInnateSkills) {
            this.Lazi_NeedAddSkillType(learnedSkill);
            this.learnSkill(learnedSkill.ID);
        }
    }
}