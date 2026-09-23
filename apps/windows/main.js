const {app, BrowserWindow} = require('electron');
const path = require('path');
function createWindow(){
  const win = new BrowserWindow({width:1280,height:820,minWidth:900,minHeight:650,backgroundColor:'#05070b',webPreferences:{contextIsolation:true,sandbox:true}});
  win.loadFile(path.join(__dirname,'../../index.html'));
}
app.whenReady().then(()=>{createWindow(); app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
