/*:
 * @author Lazislacker
 * @target MZ
 * @plugindesc Class Change System with 2 different implementations.
 * @help
 * This plugin adds the ability for a character to learn multiple classes and 
 * switch between them. There are currenty 3 modes: Shared EXP and
 * Individual Class EXP
 * --------------
 * |Version: 1.1.1|
 * --------------
 * 
 * ---------------
 * |Documentation|
 * ---------------
 * ->Parameters<-
 * *Add Entry To Menu -> If enabled, a Class Change entry will be added to the 
 *  menu. If this is disabled, another plugin will have to add an entry to the 
 *  menu that sends the symbol "classchange" to the handler.
 * 
 * *Menu Option Text -> The text that will be displayed in the menu if
 *  "Add Entry To Menu" is enabled.
 * 
 * *Level System Type -> The Type of level system to use. Currently two are 
 *  supported:
 *      *Shared EXP -> The actor has one set of experience and when
 *       switching classes this experience amount will be used to 
 *       calculate their level in the new class.  
 *      *Class EXP -> The actor has an experience amount for each
 *       class. When they change class their experience in that 
 *       specific class will be used to determine their stats and 
 *       level.
 * 
 * *Preserve Percentages for HP/MP -> This will look at the percentage of HP/MaxHP
 *  MP/MaxMP of a character before switching classes and ensure that the new class
 *  has the HP/MP set to the same percentage of their MaxHP/MaxMP
 * 
 * *Maintain Level + Percentage -> In Shared EXP mode, this will modify the actor's
 *  total EXP to maintain the same level and percent to next level when changing
 *  classes. This does not actually affect the growth rate of the class, so a class
 *  with a faster growth rate will result in the actor leveling up faster and then
 *  if the actor switches back to a class with a slower growth rate, they will keep
 *  the same level and percent to next.
 * 
 * ->Add A Class To An Actor<-
 * There are two methods to add a class to an actor: notetags or plugin 
 * commands.
 * 
 * =>Notetags<=
 * To add classes that you want an actor to have from the start of the game use 
 * the following two notetags within the actor's note field:
 * *<LaziGiveClass: [classID]> -> This notetag will add the class to the actor 
 *  at the start of a new game.
 * *<LaziGiveClassDisable: [classID] -> This notetag will add the class to the 
 *  actor at the start of a new game in a disabled state. It will appear in
 *  the actor's class list but be unselectable. The Modify Actor Classes plugin 
 *  command can be used to enable this class at a different time.
 * 
 * =>Plugin Commands<=
 * Classes can also be added to an actor during playtime through the use of a 
 * plugin command.
 * The "Modify Actor Classes" plugin command allows for classes to be 
 * added/enabled, disabled, or removed.
 * The following fields are required for the command:
 * *Type Of Action -> The type of action to perform. There are three possible 
 *                    choices:
 *      *Add        -> Adds the class to the actor's class list or enables the 
 *                     class if the actor already has it but it is disabled.
 *      *Disable    -> Disables the class in the actor's class list making it 
 *                     impossible for them to switch to this class. TODO: Force
 *                     switch if active class
 *      *Remove     -> Removes the class from the actor's class list. WARNING: 
 *                     This is a permanent removal, if the class is later added 
 *                     back it will have the level reset to 1 and the exp reset 
 *                     to 0.
 * *Actor -> The ID of the actor who's class list should be modified (The ID in
 * the Database).
 * *Class -> The ID of the class to be modified (The ID in the database)
 * 
 * ->Enable/Disable Menu Option<-
 * If the plugin is managing the Change Class menu option, it can be enabled or 
 * disabled through a plugin command.
 * 
 * =>Plugin Commands<=
 * The "Enable/Disable Menu Option" plugin command is used to enable or disable 
 * access to the Change Classes menu option. This command has one parameter:
 * *State -> If set to enable, access to the menu option will be allowed. If set 
 * to disable, access to the menu option will not be allowed. If set to remove, 
 * the menu option will not appear in the menu at all.
 * 
 * 
 * ->Show Class Change Menu Without Selecting From Menu Bar<-
 * If you want a game where the player can only switch classes at set locations
 * (say a shrine or training hall), do not enable the menu option and use
 * the following plugin command on the event you wish to open the class change
 * screen. The screen will open with showing the first character in the party
 * and the other characters can be selected using the arrow buttons at the top
 * of the screen.
 * 
 * =>Plugin Commands<=
 * Use the "ShowClassChangeScene" plugin command to show the class change scene.
 * This plugin command takes no arguments and will allow the player to change the
 * classes of any party members they have. Pressing the cancel button will close
 * the scene and return to normal gameplay.
 * 
 * @param menuOption
 * @text Add Entry To Menu
 * @desc Should a "ClassChange" entry be added to the menu? WARNING: If this is disabled, another plugin will need to add a call to the "classchange" handler 
 * in order for functionality to be enabled.
 * @type boolean
 * @default true
 * 
 * @param menuText
 * @text Menu Option Text
 * @desc The text to display in the menu for this option
 * @default Class Change
 * @type string
 * 
 * @param levelSystem
 * @text Level System Type
 * @desc The type of level system to use.
 * @type select
 * @option Shared EXP
 * @value singleLevel
 * @option Class EXP
 * @value individualLevel
 * @default singleLevel
 * 
 * @param usePercentages
 * @text Preserve Percentages for HP/MP
 * @desc Should HP/MP percentages match after a class change
 * @type boolean
 * @on Enable
 * @off Disable
 * @default off
 * 
 * @param SharedEXPSettings
 * @text Shared EXP Mode Settings
 * 
 * @param sharedModeMaintainLevel
 * @parent SharedEXPSettings
 * @text Maintain Level + Percentage
 * @desc When enabled the current level and percentage to next will be maintained when changing classes
 * @on Enable
 * @off Disable
 * @type boolean
 * @default off
 * 
 * @command ModifyClasses
 * @text Modify Actor Classes
 * @desc Command used to modify the classes that are assigned to an actor. Can be used to add or remove a class from the character.
 * WARNING: Once a class is removed, the level and exp for that class will also be lost. TODO: Modify this behavior to simply disable the class instead of removing it.
 * 
 * @arg type
 * @text Type Of Action
 * @type select
 * @option Add
 * @option Disable
 * @option Remove
 * @default Add
 * @desc Whether the class should be added or removed.
 * 
 * @arg actorId
 * @text Actor
 * @type number
 * @default -1
 * @desc The ID of the actor we are modifying
 * 
 * @arg classId
 * @text Class
 * @type number
 * @default -1
 * @desc The ID of the class we want to add/remove.
 * 
 * @command ModifyMenuAccess
 * @text Enable/Disable Menu Option
 * @desc Command used to either allow or remove access to the Class Change menu option. WARNING: Only use this function if you have this plugin generating the menu
 * option. If another plugin is generating the option, use that plugin to disable access.
 * 
 * @arg state
 * @text State
 * @type select
 * @option Enabled
 * @value enable
 * @option Disabled
 * @value disable
 * @option Removed
 * @value remove
 * @default enable
 * 
 * 
 * @command ShowClassChangeScene
 * @text Show Class Change Scene
 * @desc Command used to display the class change scene without using the status menu.
 * 
 */

//------------------------------//
//      Boilerplate/General     //
//------------------------------//
var Imported = Imported || {};

//Safeguard to prevent accidentally including both and causing chaos
if (!Imported.Lazi_ClassChange) {

    Imported.Lazi_ClassChangeBasic = true;

    var Lazi = Lazi || {};
    Lazi.ClassChangeBasic = Lazi.ClassChangeBasic || {};
    Lazi.Utils = Lazi.Utils || {};
    Lazi.ClassChangeBasic.version = "1.1.1";
    Lazi.Utils.Debug = false;

    //------------------------------//
    //      Helper Objects          //
    //------------------------------//
    class Lazi_ClassChange_ClassObject {
        constructor(classID, classExp = 0, enabled = true) {
            this.classID = classID;
            this.classExp = classExp;
            this.enabled = enabled;
        }
    }

    Lazi.Utils.GetByClassID = function (classList, classID) {
        for (_class of classList) {
            if (_class.classID == classID) {
                return _class;
            }
        }
    }

    Lazi.Utils.DebugLog = function (message) {
        if (Lazi.Utils.Debug) {
            console.log(`Lazi_ClassChangeBasic: ${message}`);
        }
    }

    Lazi.ClassChangeBasic.initialize = function () {
        Lazi.Utils.DebugLog("Initializing...")
        this.initializePluginCommands();
        this.initializeParameters();
    }

    Lazi.ClassChangeBasic.initializePluginCommands = function () {
        Lazi.Utils.DebugLog("Initializing Plugin Commands");
        PluginManager.registerCommand("Lazi_ClassChangeBasic", "ModifyClasses", this.addActorClass);
        PluginManager.registerCommand("Lazi_ClassChangeBasic", "ModifyMenuAccess", this.ModifyMenuAccess);
        PluginManager.registerCommand("Lazi_ClassChangeBasic", "ShowClassChangeScene", this.showClassChangeScene);
    }

    Lazi.ClassChangeBasic.initializeParameters = function () {
        Lazi.Utils.DebugLog("Initializing Parameters");
        const params = PluginManager.parameters("Lazi_ClassChangeBasic");
        this.params = {};
        this.params.createMenuOption = params.menuOption;
        this.params.menuOptionText = params.menuText;
        this.params.levelSystemType = params.levelSystem;
        this.params.usePercentages = params.usePercentages;
        this.params.sharedModeMaintainLevel = params.sharedModeMaintainLevel;
        this.functionParams = {};
        this.functionParams.MenuAccess = "enable";
    }

    Lazi.ClassChangeBasic.getParam = function (paramName) {
        if (this.params) {
            return this.params[paramName];
        }
        //We don't have params yet, initialize them.
        this.initialize();
        return this.params[paramName];
    }

    Lazi.ClassChangeBasic.showClassChangeScene = function (args) {
        SceneManager.push(Lazi_Scene_ClassChange);
    }

    Lazi.ClassChangeBasic.addActorClass = function (args) {
        if (args.actorId == -1 || !args.classId == -1) {
            Lazi.Utils.DebugLog("ERROR!:Cannot have an actor or class with an ID of -1");
            return;
        }
        let currentClasses = $gameActors._data[args.actorId].LaziClassChange_classes;
        if (args.type == "Add") {
            for (currentClass of currentClasses) {
                if (currentClass.classID == args.classId) {
                    if (currentClass.enabled) {
                        Lazi.Utils.DebugLog("ERROR!: Class already in Actor's class list and enabled");
                        return;
                    }
                    currentClass.enabled = true;
                    return;
                }
            }
            currentClasses.push(new Lazi_ClassChange_ClassObject(parseInt(args.classId), 0));
        }
        if (args.type == "Disable") {
            for (currentClass of currentClasses) {
                if (currentClass.classID == args.classId) {
                    if (currentClass.enabled) {
                        Lazi.Utils.DebugLog("ERROR!: Class is already disabled!");
                        return;
                    }
                    currentClass.enabled = false;
                    return;
                }
            }
        }
        if (args.type == "Remove") {
            //Uh oh, we are currently that class. We should bump ourselves to something else.
            let actor = $gameActors_.data[args.actorId]
            if (actor._classId == args.classId) {
                //Uh oh. We only have one class and it's this class, do nothing.
                if (actor.LaziClassChange_classes.length == 1 && actor.LaziClassChange_classes[0].classID == actor._classId) {
                    return;
                }
                if (actor.LaziClassChange_classes[0].classID != actor._classId) {
                    let newClass = actor.LaziClassChange_classes[0];
                    Lazi.ClassChangeBasic.performClassSwap(actor, newClass.classID, newClass.classExp);
                } else if (actor.LaziClassChange_classes.length == 1) {
                    return
                }
                //Otherwise just use the second in the list. 
                else {
                    let newClass = actor.LaziClassChange_classes[1];
                    Lazi.ClassChangeBasic.performClassSwap(actor, newClass.classID, newClass.classExp);
                }
            }
            $gameActors._data[args.actorId].LaziClassChange_classes = currentClasses.filter((item) => {
                return item.classID != args.classId;
            })
        }
    }

    Lazi.ClassChangeBasic.ModifyMenuAccess = function (args) {
        this.functionParams.MenuAccess = args.state;
    }

    Lazi.ClassChangeBasic.shouldShowLevels = function () {
        return !(this.getParam("levelSystemType") == "singleLevel");
    }

    Lazi.ClassChangeBasic.isSharedMaintainLevel = function () {
        return (Lazi.ClassChangeBasic.getParam("sharedModeMaintainLevel") == "true") && (Lazi.ClassChangeBasic.getParam("levelSystemType") == "singleLevel")
    }

    Lazi.ClassChangeBasic.shouldUsePercentages = function () {
        //Uses string despite being a boolean type.
        return Lazi.ClassChangeBasic.getParam("usePercentages") == "true";
    }

    Lazi.ClassChangeBasic.ClassLevelByExp = function (classId, expAmount) {
        const c = $dataClasses[classId];
        if (!c) {
            return -1;
        }
        if (expAmount == 0 || !expAmount) {
            return 1;
        }
        const basis = c.expParams[0];
        const extra = c.expParams[1];
        const acc_a = c.expParams[2];
        const acc_b = c.expParams[3];
        let level = 1;
        while (true) {
            let levelExp = Math.round(
                (basis * Math.pow(level - 1, 0.9 + acc_a / 250) * level * (level + 1)) /
                (6 + Math.pow(level, 2) / 50 / acc_b) +
                (level - 1) * extra
            );
            if (expAmount - levelExp < 0) //We've passed our level
            {
                return (level - 1) //Since we're 1 level ahead, return the level before.
            }
            level += 1;
            /* 
                    //Debug infinite loop failsafe
                    if (level > 99)
                        break;*/
        }
    }

    Lazi.ClassChangeBasic.ExpByClassLevel = function (classId, level) {
        const c = $dataClasses[classId];
        if (!c) {
            return -1;
        }
        const basis = c.expParams[0];
        const extra = c.expParams[1];
        const acc_a = c.expParams[2];
        const acc_b = c.expParams[3];
        return Math.round(
            (basis * Math.pow(level - 1, 0.9 + acc_a / 250) * level * (level + 1)) /
            (6 + Math.pow(level, 2) / 50 / acc_b) +
            (level - 1) * extra);
    }

    Lazi.ClassChangeBasic.performClassSwap = function (actor, newClassID, newClassExp) {
        //Gotta stay proportional
        if (Lazi.ClassChangeBasic.shouldUsePercentages()) {
            var HPpercent = (actor.hp) / (actor.paramBase(0)) //0 = MHP
            var MPpercent = (actor.mp) / (actor.paramBase(1)) //1 = MMP
        }
        //We need to swap out the exp with the correct amount.
        if (Lazi.ClassChangeBasic.shouldShowLevels()) {

            actor._classId = newClassID;
            actor._level = Lazi.ClassChangeBasic.ClassLevelByExp(newClassID, newClassExp);
            actor._exp[newClassID] = newClassExp;
            actor.initSkills();
            actor.refresh();
        }

        //Keeping exp, can just use default class change function. Woo!
        else {
            actor.changeClass(newClassID, true);
        }

        //Use our already calculated percentages to change HP now that we've changed classes/levels
        if (Lazi.ClassChangeBasic.shouldUsePercentages()) {
            actor.setHp(Math.round(actor.paramBase(0) * HPpercent));
            actor.setMp(Math.round(actor.paramBase(1) * MPpercent));
        }
    }


    Lazi.ClassChangeBasic.initialize();

    //------------------------------//
    //        Game Actor            //
    //------------------------------//

    ///Newly Added Functions///
    Game_Actor.prototype.Lazi_GenerateClassList = function (actorId) {
        const actor = $dataActors[actorId]
        const note = actor.note;
        let classList = [];
        classList.push(new Lazi_ClassChange_ClassObject(actor.classId, Lazi.ClassChangeBasic.ExpByClassLevel(actor.classId, actor.initialLevel)))
        let matches = note.matchAll(/<\s*Lazi\s?Give\s?Class:\s*(.+)\s*>/ig)
        if (matches) {
            for (match of matches) {
                let subMatches = match[0].matchAll(/(\d+),?/g)
                for (subMatch of subMatches) {
                    //We already have it, don't add it.
                    let alreadyAdded = classList.filter((entry) => {return (entry.classID == parseInt(subMatch[1]))}).length != 0
                    if ((parseInt(subMatch[1]) == actor._classId) || alreadyAdded) {
                        continue;
                    }

                    classList.push(new Lazi_ClassChange_ClassObject(parseInt(subMatch[1]), 0));
                }
            }
        }
        let DisableMatches = note.matchAll(/<\s*Lazi\s?Give\s?Class\s?Disable:\s*(.+)\s*>/ig)
        if (DisableMatches) {
            for (match of DisableMatches) {
                let subMatches = match[0].matchAll(/(\d+),?/g)
                for (subMatch of subMatches) {
                    //We already have it, don't add it.
                    let alreadyAdded = classList.filter((entry) => {return (entry.classID == parseInt(subMatch[1]))}).length != 0
                    if ((parseInt(subMatch[1]) == actor._classId) || alreadyAdded) {
                        continue;
                    }
                    classList.push(new Lazi_ClassChange_ClassObject(parseInt(subMatch[1]), 0, false));
                }
            }
        }
        return classList;
    }

    ///Overwritten Functions///
    Lazi.ClassChangeBasic.GameActor_initMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function () {
        Lazi.ClassChangeBasic.GameActor_initMembers.apply(this, arguments);
        this.LaziClassChange_classes = [];
    }

    Lazi.ClassChangeBasic.GameActor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function (actorId) {
        //We need to generate a list using their notetag
        if (this.LaziClassChange_classes == undefined || this.LaziClassChange_classes.length == 0) {
            Lazi.Utils.DebugLog(`Generating class list for actor with ID ${actorId}`)
            this.LaziClassChange_classes = this.Lazi_GenerateClassList(actorId);
        }
        Lazi.ClassChangeBasic.GameActor_setup.apply(this, arguments);
    }

    Lazi.ClassChangeBasic.GameActor_changeExp = Game_Actor.prototype.changeExp;
    Game_Actor.prototype.changeExp = function (exp, show) {
        Lazi.ClassChangeBasic.GameActor_changeExp.apply(this, arguments);
        Lazi.Utils.GetByClassID(this.LaziClassChange_classes, this._classId).classExp = this._exp[this._classId];
    }

    Lazi.ClassChangeBasic.GameActor_changeClass = Game_Actor.prototype.changeClass;
    Game_Actor.prototype.changeClass = function (classId, keepExp) {

        let _class = Lazi.Utils.GetByClassID(this.LaziClassChange_classes, classId);
        if (!_class) {
            //We don't have it but they clearly want to add it for this character, let's add a new entry to list
            this.LaziClassChange_classes.push(new Lazi_ClassChange_ClassObject(classId, 0, true));
            _class = Lazi.Utils.GetByClassID(this.LaziClassChange_classes, classId);
        } else if (Lazi.ClassChangeBasic.isSharedMaintainLevel()) {
            var currentLvl = this._level;
            var currentEXP = this._exp[this._classId];
            var EXPForCurrent = Lazi.ClassChangeBasic.ExpByClassLevel(this._classId, currentLvl);
            var EXPForNext = Lazi.ClassChangeBasic.ExpByClassLevel(this._classId, currentLvl + 1);
            var percentToNext = (currentEXP - EXPForCurrent) / (EXPForNext - EXPForCurrent);
        }
        Lazi.ClassChangeBasic.GameActor_changeClass.apply(this, arguments);
        if (!keepExp) {
            this._exp[_class.classID] = _class.classExp;
            this._level = Lazi.Utils.ClassLevelByExp(_class.classExp);
        } else if (Lazi.ClassChangeBasic.isSharedMaintainLevel()) {
            let EXPForNewNext = Lazi.ClassChangeBasic.ExpByClassLevel(this._classId, currentLvl + 1);
            let EXPForNewCurrent = Lazi.ClassChangeBasic.ExpByClassLevel(this._classId, currentLvl);
            this._level = currentLvl;
            this._exp[this._classId] = Math.round(EXPForNewCurrent + ((EXPForNewNext - EXPForNewCurrent) * percentToNext));
        }
        this.refresh();
        this.initSkills();
    }

    //------------------------------//
    //     Window MenuCommand       //
    //------------------------------//
    Lazi.ClassChangeBasic.WindowMenuCommand_addMainCommands = Window_MenuCommand.prototype.addMainCommands;
    Window_MenuCommand.prototype.addMainCommands = function () {
        Lazi.ClassChangeBasic.WindowMenuCommand_addMainCommands.apply(this, arguments);
        if (Lazi.ClassChangeBasic.getParam("createMenuOption")) {
            if (Lazi.ClassChangeBasic.functionParams.MenuAccess == "enable") {
                this.addCommand(Lazi.ClassChangeBasic.getParam("menuOptionText"), "classchange", this.areMainCommandsEnabled());
            } else if (Lazi.ClassChangeBasic.functionParams.MenuAccess == "disable") {
                this.addCommand(Lazi.ClassChangeBasic.getParam("menuOptionText"), "classchange", false);
            } else {
                //Don't add it, the option must set to remove.
            }
        }
    }


    //------------------------------//
    //        Scene Menu            //
    //------------------------------//
    Lazi.ClassChangeBasic.SceneMenu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function () {
        Lazi.ClassChangeBasic.SceneMenu_createCommandWindow.apply(this, arguments);
        this._commandWindow.setHandler("classchange", this.commandPersonal.bind(this));
    }

    Lazi.ClassChangeBasic.SceneMenu_onPersonalOk = Scene_Menu.prototype.onPersonalOk;
    Scene_Menu.prototype.onPersonalOk = function () {
        if (this._commandWindow.currentSymbol() != "classchange") {
            Lazi.ClassChangeBasic.SceneMenu_onPersonalOk.apply(this, arguments);
            return;
        }

        SceneManager.push(Lazi_Scene_ClassChange);
    }

    //------------------------------//
    //    Scene ClassChange         //
    //------------------------------//
    function Lazi_Scene_ClassChange() {
        this.initialize(...arguments);
    }

    Lazi_Scene_ClassChange.prototype.initialize = function () {

    }

    Lazi_Scene_ClassChange.prototype = Object.create(Scene_ItemBase.prototype);
    Lazi_Scene_ClassChange.prototype.constructor = Lazi_Scene_ClassChange;

    Lazi_Scene_ClassChange.prototype.initialize = function () {
        Scene_ItemBase.prototype.initialize.call(this);
    };

    Lazi_Scene_ClassChange.prototype.create = function () {
        Scene_ItemBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createStatusWindow();
        this.createItemWindow();
        this.createActorWindow();
        this._itemWindow.activate();
        this._itemWindow.selectLast();
    };

    Lazi_Scene_ClassChange.prototype.start = function () {
        Scene_ItemBase.prototype.start.call(this);
        this.refreshActor();
    };

    Lazi_Scene_ClassChange.prototype.createStatusWindow = function () {
        const rect = this.statusWindowRect();
        this._statusWindow = new Window_SkillStatus(rect); //Want same info, just piggyback
        this.addWindow(this._statusWindow);
    };

    Lazi_Scene_ClassChange.prototype.statusWindowRect = function () {
        const ww = Graphics.boxWidth
        const wh = this.calcWindowHeight(3, true);
        const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
        const wy = this.mainAreaTop();
        return new Rectangle(wx, wy, ww, wh);
    };


    Lazi_Scene_ClassChange.prototype.createItemWindow = function () {
        const rect = this.itemWindowRect();
        this._itemWindow = new Window_ClassList(rect);
        this._itemWindow.setHelpWindow(this._helpWindow);
        this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
        this._itemWindow.setHandler("cancel", this.popScene.bind(this));
        this._itemWindow.setHandler("pagedown", this.nextActor.bind(this));
        this._itemWindow.setHandler("pageup", this.previousActor.bind(this));
        this.addWindow(this._itemWindow);
    };

    Lazi_Scene_ClassChange.prototype.itemWindowRect = function () {
        const wx = 0;
        const wy = this._statusWindow.y + this._statusWindow.height;
        const ww = Graphics.boxWidth;
        const wh = this.mainAreaHeight() - this._statusWindow.height;
        return new Rectangle(wx, wy, ww, wh);
    };

    Lazi_Scene_ClassChange.prototype.needsPageButtons = function () {
        return true;
    };

    Lazi_Scene_ClassChange.prototype.arePageButtonsEnabled = function () {
        return !this.isActorWindowActive();
    };

    Lazi_Scene_ClassChange.prototype.refreshActor = function () {
        const actor = this.actor();
        this._statusWindow.setActor(actor);
        this._itemWindow.setActor(actor);
    };

    Lazi_Scene_ClassChange.prototype.user = function () {
        return this.actor();
    };

    Lazi_Scene_ClassChange.prototype.playSeForItem = function () {
        SoundManager.playUseSkill();
    };

    Lazi_Scene_ClassChange.prototype.useItem = function () {
        this.playSeForItem();
        this._statusWindow.refresh();
        this._itemWindow.refresh();
        this.checkCommonEvent();
        this.checkGameover();
        this._actorWindow.refresh();
        this._itemWindow.activate();
    };

    Lazi_Scene_ClassChange.prototype.performClassSwap = function (item) {
        const actor = this.actor();
        Lazi.ClassChangeBasic.performClassSwap(actor, item.classID, item.classExp);
        this.useItem();
    }

    Lazi_Scene_ClassChange.prototype.onActorChange = function () {
        Scene_MenuBase.prototype.onActorChange.call(this);
        this.refreshActor();
    };

    Lazi_Scene_ClassChange.prototype.onItemOk = function () {
        this.performClassSwap(this.item());
    };

    //------------------------------//
    //    Window ClassList          //
    //------------------------------//
    function Window_ClassList() {
        this.initialize(...arguments);
    }

    Window_ClassList.prototype = Object.create(Window_Selectable.prototype);
    Window_ClassList.prototype.constructor = Window_ClassList;

    Window_ClassList.prototype.initialize = function (rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this._actor = null;
        this._data = [];
    };

    Window_ClassList.prototype.setActor = function (actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this.refresh();
            this.scrollTo(0, 0);
        }
    };

    Window_ClassList.prototype.maxCols = function () {
        return 2;
    };

    Window_ClassList.prototype.colSpacing = function () {
        return 16;
    };

    Window_ClassList.prototype.maxItems = function () {
        return this._data ? this._data.length : 1;
    };

    Window_ClassList.prototype.item = function () {
        return this.itemAt(this.index());
    };

    Window_ClassList.prototype.itemAt = function (index) {
        return this._data && index >= 0 ? this._data[index] : null;
    };

    Window_ClassList.prototype.isCurrentItemEnabled = function () {
        if (this.index() == -1) {
            return;
        }
        return this.isEnabled(this._data[this.index()]);
    };

    Window_ClassList.prototype.includes = function (item) {
        return item;
    };

    Window_ClassList.prototype.isEnabled = function (item) {
        return this._actor && item.enabled && this._actor._classId != item.classID;
    };

    Window_ClassList.prototype.makeItemList = function () {
        if (this._actor) {
            let classesThatExist = this._actor.LaziClassChange_classes.filter((_class)=>{
                if ($dataClasses[_class.classID])
                    return true;
                return false;
            })
            this._data = classesThatExist;
        } else {
            this._data = [];
        }
    };

    Window_ClassList.prototype.selectLast = function () {
        this.smoothSelect(0);
    };

    Window_ClassList.prototype.drawItem = function (index) {
        const _class = this.itemAt(index);
        if (_class && $dataClasses[_class.classID]) {
            const className = $dataClasses[_class.classID].name;
            const levelWidth = this.levelWidth();
            const rect = this.itemLineRect(index);
            this.changePaintOpacity(this.isEnabled(_class));
            this.drawItemName({
                name: className,
                iconIndex: undefined
            }, rect.x, rect.y, rect.width - levelWidth);
            if (Lazi.ClassChangeBasic.shouldShowLevels())
                this.drawclassLevel(_class, rect.x, rect.y, rect.width);
            this.changePaintOpacity(1);
        }
    };

    Window_ClassList.prototype.levelWidth = function () {
        if (Lazi.ClassChangeBasic.shouldShowLevels()) {
            return this.textWidth("Lvl. 000");
        } else {
            return 0;
        }
    };

    Window_ClassList.prototype.drawclassLevel = function (_class, x, y, width) {
        this.drawText("Lvl. " + Lazi.ClassChangeBasic.ClassLevelByExp(_class.classID, _class.classExp), x, y, width, "right");
    };

    Window_ClassList.prototype.updateHelp = function () {
        if (this._actor)
            this.setHelpWindowItem({
                description: `Select the new class for ${this._actor.name()}.`
            });
        else
            this.setHelpWindowItem({
                description: ``
            });
    };

    Window_ClassList.prototype.refresh = function () {
        this.makeItemList();
        Window_Selectable.prototype.refresh.call(this);
    };
}