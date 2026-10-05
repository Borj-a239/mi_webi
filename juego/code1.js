gdjs.menu_32sceneCode = {};
gdjs.menu_32sceneCode.localVariables = [];
gdjs.menu_32sceneCode.idToCallbackMap = new Map();
gdjs.menu_32sceneCode.GDlevel_9595oneObjects1= [];
gdjs.menu_32sceneCode.GDlevel_9595oneObjects2= [];
gdjs.menu_32sceneCode.GDGamenameObjects1= [];
gdjs.menu_32sceneCode.GDGamenameObjects2= [];
gdjs.menu_32sceneCode.GDBackgroundObjects1= [];
gdjs.menu_32sceneCode.GDBackgroundObjects2= [];


gdjs.menu_32sceneCode.mapOfGDgdjs_9546menu_959532sceneCode_9546GDlevel_95959595oneObjects1Objects = Hashtable.newFrom({"level_one": gdjs.menu_32sceneCode.GDlevel_9595oneObjects1});
gdjs.menu_32sceneCode.eventsList0 = function(runtimeScene) {

{

gdjs.copyArray(runtimeScene.getObjects("level_one"), gdjs.menu_32sceneCode.GDlevel_9595oneObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonPressed(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.menu_32sceneCode.GDlevel_9595oneObjects1.length;i<l;++i) {
    if ( gdjs.menu_32sceneCode.GDlevel_9595oneObjects1[i].getBehavior("Animation").getAnimationName() == "Unlocked" ) {
        isConditionTrue_0 = true;
        gdjs.menu_32sceneCode.GDlevel_9595oneObjects1[k] = gdjs.menu_32sceneCode.GDlevel_9595oneObjects1[i];
        ++k;
    }
}
gdjs.menu_32sceneCode.GDlevel_9595oneObjects1.length = k;
}
if (isConditionTrue_0) {
}

}


{

gdjs.copyArray(runtimeScene.getObjects("level_one"), gdjs.menu_32sceneCode.GDlevel_9595oneObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.menu_32sceneCode.mapOfGDgdjs_9546menu_959532sceneCode_9546GDlevel_95959595oneObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
{runtimeScene.getGame().getVariables().getFromIndex(0).setNumber(1);
}
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Untitled scene", false);
}
}

}


};

gdjs.menu_32sceneCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.menu_32sceneCode.GDlevel_9595oneObjects1.length = 0;
gdjs.menu_32sceneCode.GDlevel_9595oneObjects2.length = 0;
gdjs.menu_32sceneCode.GDGamenameObjects1.length = 0;
gdjs.menu_32sceneCode.GDGamenameObjects2.length = 0;
gdjs.menu_32sceneCode.GDBackgroundObjects1.length = 0;
gdjs.menu_32sceneCode.GDBackgroundObjects2.length = 0;

gdjs.menu_32sceneCode.eventsList0(runtimeScene);
gdjs.menu_32sceneCode.GDlevel_9595oneObjects1.length = 0;
gdjs.menu_32sceneCode.GDlevel_9595oneObjects2.length = 0;
gdjs.menu_32sceneCode.GDGamenameObjects1.length = 0;
gdjs.menu_32sceneCode.GDGamenameObjects2.length = 0;
gdjs.menu_32sceneCode.GDBackgroundObjects1.length = 0;
gdjs.menu_32sceneCode.GDBackgroundObjects2.length = 0;


return;

}

gdjs['menu_32sceneCode'] = gdjs.menu_32sceneCode;
