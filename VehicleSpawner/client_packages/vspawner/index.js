const NativeUI = require("nativeui");
const Menu = NativeUI.Menu;
const UIMenuItem = NativeUI.UIMenuItem;
const Point = NativeUI.Point;

const vehicles = require("vspawner/vehicleHashes");
const categoryTitles = ["Compacts", "Sedans", "SUVs", "Coupes", "Muscle", "Sports Classics", "Sports", "Super", "Motorcycles", "Off-Road", "Industrial", "Utility", "Vans", "Cycles", "Boats", "Helicopters", "Planes", "Service", "Emergency", "Military", "Commercial", "Trains"];

// messes with chat because pressing T while using onscreen keyboard activates chat input
function getUserInput(maxLength) {
    mp.gui.chat.show(false);

    mp.game.gameplay.displayOnscreenKeyboard(1, "FMMC_KEY_TIP8", "", "", "", "", "", maxLength);
    while (mp.game.gameplay.updateOnscreenKeyboard() == 0) mp.game.wait(0);

    mp.gui.chat.show(true);
    return mp.game.gameplay.getOnscreenKeyboardResult();
}

// main menu
let mainMenu = new Menu("Vehicle Spawner", "", new Point(950, 300));
mainMenu.Visible = false;

mainMenu.ItemSelect.on((item, index) => {
    if (index === categoryTitles.length) {
        let model = getUserInput(32);

        if (model.length > 0) {
            if (!mp.game.streaming.isModelAVehicle(mp.game.joaat(model))) {
                mp.gui.chat.push("Entered model was not a vehicle model.");
                return;
            }

            mp.events.callRemote("vspawner_Spawn", model);
        }
    } else {
        mainMenu.Visible = false;
        curCategory = index;
        categoryMenus[index].Visible = true;
        transition = true;
    }
});

let categoryMenus = [];
let curCategory = -1;
let transition = false;

// categories
for (let i = 0; i < categoryTitles.length; i++) {
    mainMenu.AddItem(new UIMenuItem(categoryTitles[i], ""));

    let categoryMenu = new Menu(categoryTitles[i], "", new Point(950, 300));
    categoryMenu.Visible = false;

    categoryMenu.ItemSelect.on((item, index) => {
        if (!transition) mp.events.callRemote("vspawner_Spawn", item.Text);
        transition = false;
    });

    categoryMenu.MenuClose.on(() => {
        curCategory = -1;
        mainMenu.Visible = true;
    });

    categoryMenus.push(categoryMenu);
}

// vehicles
for (let name of vehicles) {
    let vehicleHash = mp.game.joaat(name);
    let vehicleName = mp.game.ui.getLabelText(mp.game.vehicle.getDisplayNameFromVehicleModel(vehicleHash));
    let vehicleItem = new UIMenuItem(name, "");
    vehicleItem.SetRightLabel(vehicleName == "NULL" ? "" : vehicleName);
    categoryMenus[ mp.game.vehicle.getVehicleClassFromName(vehicleHash) ].AddItem(vehicleItem);
}

// spawn by model
mainMenu.AddItem(new UIMenuItem("Spawn by Model", "Write a vehicle model name to spawn it."));

// f4 key - toggle menu visibility
mp.keys.bind(0x73, false, () => {
    if (curCategory > -1) {
        categoryMenus[curCategory].Visible = !categoryMenus[curCategory].Visible;
    } else {
        mainMenu.Visible = !mainMenu.Visible;
    }
});