var fs = require('fs');
const SAVE_FILE = './blips.json';
/* Commands */
function blipCreator(player)
{    
    player.call('be:blipCreator');
}
mp.events.addCommand("blipcreator", blipCreator);
mp.events.addCommand("blipc", blipCreator);
function delBlips(player)
{
    getBlips((blips, stringBlips) =>
    {
        player.call('be:showEditor', [stringBlips+""]);
    });
    player.outputChatBox("!{#ff9a16}[ BlipCreator ]!{#FFF} Opening blip menu edit, !{#00FF00}please wait...");
}
mp.events.addCommand("blipdelete", delBlips);
mp.events.addCommand("blipd", delBlips);

/* Editor */
mp.events.add("delBlip", (player, id) =>
{
    getBlips((blips) =>
    {
        let idInArray = blips.findIndex(b => b.blipid === id);
        if(idInArray > -1)
        {
            blips.splice(idInArray, 1);
            mp.blips.at(id).destroy();
        }
        saveBlips(blips);
    });
});

/* Creator */
mp.events.add("blipCreate", (player, data) =>
{
    try{
        let blip = JSON.parse(data);
        let options = {};
        let pos = player.position;
        if(typeof blip.name === 'undefined') 
            options.name = '';
        else
            options.name = blip.name;
        if(blip.scale != 1) options.scale = blip.scale;        
        if(blip.alpha != 255) options.alpha = blip.alpha;
        if(blip.drawDistance > 0) options.drawDistance = blip.drawDistance;        
        if(blip.dimension != 0) options.dimension = blip.dimension;

        options.shortRange = blip.shortRange;
        options.color = blip.color;
        let blipMp = mp.blips.new(blip.sprint, pos, options);        
        getBlips((blips)=>
        {
            blips.push({
                blipid: blipMp.id,
                sprite: blip.sprint,
                position: {x: pos.x, y: pos.y, z: pos.z},
                options: options
            });
            saveBlips(blips);
        });       

    }
    catch(e)
    {
        console.log("[ Blip Creator ] Json parse error " + e);
    }
});

function getBlips(cb)
{
    fs.exists(SAVE_FILE,(exists) =>
    {
        if (exists)
        {
            fs.readFile(SAVE_FILE, (err, data) =>
            {
                if(err){
                    console.log("Error on read" + err)
                    return;
                }
                try{
                    data = data.toString();
                    let obj = JSON.parse(data);
                    cb(obj, data);
                }
                catch(e)
                { console.log("(readFile) Json parse fail" + e);}
            });
        }
        else
        {            
            fs.appendFile(SAVE_FILE,'[]', (err)=>
            {
                if(err){
                    console.log("Fail on create file" + err);
                    return;
                };
                cb([]);
            });
        }        
    });
}
function saveBlips(blips)
{
    fs.writeFile(SAVE_FILE, JSON.stringify(blips), function (err) {
        if (err) 
        {
            console.log("Fail on save blips");
        }        
    });
}
function loadBlips()
{
    getBlips((blips)=>
    {
        for(let i in blips)
        {
            let pos = blips[i].position;
            let blipMP = mp.blips.new(blips[i].sprite, new mp.Vector3(pos.x, pos.y, pos.z), blips[i].options);
            blips[i].blipid = blipMP.id;
        }       
        saveBlips(blips);
        if(blips.length > 0)
            console.log("[ BlipCreator ] " + blips.length + " blips loaded");
    });
}

/* LOAD BLIPS ON SCRIPT START */
loadBlips();