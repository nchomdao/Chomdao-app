// ================================================
// Chomdao — Google Apps Script Backend
// ================================================
// วิธีใช้:
// 1. สร้าง Google Sheet ใหม่ ตั้งชื่อ "Chomdao Database"
// 2. เปิด Extensions > Apps Script
// 3. ลบโค้ดเดิม แล้ววางโค้ดนี้ทั้งหมด
// 4. กด Save (Ctrl+S)
// 5. กด Deploy > New deployment
//    - Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 6. กด Deploy > Copy URL ที่ได้
// 7. เอา URL ไปใส่ในแอป
// ================================================

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  const params = e.parameter || {};
  let postData = {};
  try {
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    }
  } catch(err) {}

  const act = params.action || postData.action || '';
  let result;

  try {
    switch(act) {
      case 'getAll':         result = { rooms: getRooms(), bills: getBills(), meters: getMeters(), buildings: getBuildings() }; break;
      case 'getRooms':       result = getRooms(); break;
      case 'saveRoom':       result = saveRoom(postData); break;
      case 'deleteRoom':     result = deleteRoom(postData); break;
      case 'getBills':       result = getBills(); break;
      case 'saveBill':       result = saveBill(postData); break;
      case 'getMeters':      result = getMeters(); break;
      case 'saveMeter':      result = saveMeter(postData); break;
      case 'saveAllMeters':  result = saveAllMeters(postData); break;
      case 'saveBulk':       result = saveBulk(postData); break;
      case 'getBuildings':   result = getBuildings(); break;
      case 'saveBuilding':   result = saveBuilding(postData); break;
      case 'cleanup':        result = cleanup(); break;
      default: result = { error: 'Unknown action: ' + act };
    }
  } catch(err) {
    result = { error: err.message, stack: err.stack };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// ห้องพัก (Rooms)
// ========================================
function getRooms() {
  const sheet = getOrCreate('ห้องพัก', ['id','price','type','tenant','phone','moveIn','status']);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).map(r => ({
    id: String(r[0]), price: Number(r[1]), type: r[2] || '',
    tenant: r[3] || '', phone: r[4] || '',
    moveIn: r[5] || '', status: r[6] || ''
  }));
}

function saveRoom(d) {
  const room = d.room || d;
  const sheet = getOrCreate('ห้องพัก', ['id','price','type','tenant','phone','moveIn','status']);
  const data = sheet.getDataRange().getValues();
  const row = [String(room.id), Number(room.price), room.type||'', room.tenant||'', room.phone||'', room.moveIn||'', room.status||''];

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(room.id)) {
      sheet.getRange(i+1, 1, 1, 7).setValues([row]);
      return { success: true, action: 'updated' };
    }
  }
  sheet.appendRow(row);
  return { success: true, action: 'added' };
}

function deleteRoom(d) {
  const roomId = String(d.roomId || d.id);
  const sheet = getOrCreate('ห้องพัก', ['id','price','type','tenant','phone','moveIn','status']);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === roomId) {
      sheet.deleteRow(i+1);
      return { success: true };
    }
  }
  return { error: 'ไม่พบห้อง ' + roomId };
}

// ========================================
// ค่าใช้จ่าย (Bills)
// ========================================
function getBills() {
  const sheet = getOrCreate('ค่าใช้จ่าย', ['room','month','tenant','rent','water','elec','extras','status']);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).map(r => {
    let extras = [];
    try { extras = JSON.parse(r[6] || '[]'); } catch(e) {}
    return {
      room: String(r[0]), month: r[1], tenant: r[2],
      rent: Number(r[3]), water: Number(r[4]), elec: Number(r[5]),
      extras: extras, status: r[7] || 'รอชำระ'
    };
  });
}

function saveBill(d) {
  const bill = d.bill || d;
  const sheet = getOrCreate('ค่าใช้จ่าย', ['room','month','tenant','rent','water','elec','extras','status']);
  const data = sheet.getDataRange().getValues();
  const extrasStr = JSON.stringify(bill.extras || []);
  const row = [String(bill.room), bill.month, bill.tenant||'',
               Number(bill.rent||0), Number(bill.water||0), Number(bill.elec||0),
               extrasStr, bill.status||'รอชำระ'];

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(bill.room) && data[i][1] === bill.month) {
      sheet.getRange(i+1, 1, 1, 8).setValues([row]);
      return { success: true, action: 'updated' };
    }
  }
  sheet.appendRow(row);
  return { success: true, action: 'added' };
}

// ========================================
// มิเตอร์ (Meters)
// ========================================
function getMeters() {
  const sheet = getOrCreate('มิเตอร์', ['key','prev','curr']);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return {};
  const meters = {};
  data.slice(1).forEach(r => {
    meters[String(r[0])] = { prev: Number(r[1]), curr: Number(r[2]) };
  });
  return meters;
}

function saveMeter(d) {
  const sheet = getOrCreate('มิเตอร์', ['key','prev','curr']);
  const data = sheet.getDataRange().getValues();
  const key = String(d.key);
  const row = [key, Number(d.prev||0), Number(d.curr||0)];

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === key) {
      sheet.getRange(i+1, 1, 1, 3).setValues([row]);
      return { success: true, action: 'updated' };
    }
  }
  sheet.appendRow(row);
  return { success: true, action: 'added' };
}

function saveAllMeters(d) {
  const meterObj = d.meters || {};
  let count = 0;
  Object.keys(meterObj).forEach(key => {
    saveMeter({ key: key, prev: meterObj[key].prev, curr: meterObj[key].curr });
    count++;
  });
  return { success: true, count: count };
}

// ========================================
// หอพัก (Buildings)
// ========================================
function getBuildings() {
  const sheet = getOrCreate('หอพัก', ['key','name','prefix','color']);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).map(r => ({
    key: r[0], name: r[1], prefix: r[2], color: r[3]
  }));
}

function saveBuilding(d) {
  const bld = d.building || d;
  const sheet = getOrCreate('หอพัก', ['key','name','prefix','color']);
  const data = sheet.getDataRange().getValues();
  const row = [bld.key, bld.name, bld.prefix, bld.color||'#3b82f6'];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === bld.key) {
      sheet.getRange(i+1, 1, 1, 4).setValues([row]);
      return { success: true, action: 'updated' };
    }
  }
  sheet.appendRow(row);
  return { success: true, action: 'added' };
}

// ========================================
// Bulk Save (บันทึกทั้งหมดในครั้งเดียว)
// ========================================
function saveBulk(d) {
  let result = { rooms: 0, bills: 0, meters: 0, buildings: 0 };

  // Save buildings
  if (d.buildings && d.buildings.length) {
    d.buildings.forEach(b => saveBuilding({ building: b }));
    result.buildings = d.buildings.length;
  }

  // Save rooms
  if (d.rooms && d.rooms.length) {
    d.rooms.forEach(r => saveRoom({ room: r }));
    result.rooms = d.rooms.length;
  }

  // Save bills
  if (d.bills && d.bills.length) {
    d.bills.forEach(b => saveBill({ bill: b }));
    result.bills = d.bills.length;
  }

  // Save meters
  if (d.meters) {
    const mResult = saveAllMeters({ meters: d.meters });
    result.meters = mResult.count;
  }

  return { success: true, saved: result };
}

// ========================================
// Cleanup — ลบข้อมูลเก่ากว่า 12 เดือน
// ========================================
function cleanup() {
  const now = new Date();
  const beYear = now.getFullYear() + 543;
  const curMonth = now.getMonth() + 1;

  // คำนวณเดือนขั้นต่ำ (12 เดือนก่อน)
  let minMonth = curMonth - 11;
  let minYear = beYear;
  while (minMonth <= 0) { minMonth += 12; minYear--; }
  const minKey = minYear + '-' + String(minMonth).padStart(2, '0');

  let deleted = { bills: 0, meters: 0 };

  // ลบบิลเก่า
  const billSheet = getOrCreate('ค่าใช้จ่าย', ['room','month','tenant','rent','water','elec','extras','status']);
  let billData = billSheet.getDataRange().getValues();
  for (let i = billData.length - 1; i >= 1; i--) {
    if (billData[i][1] < minKey) {
      billSheet.deleteRow(i + 1);
      deleted.bills++;
    }
  }

  // ลบมิเตอร์เก่า
  const meterSheet = getOrCreate('มิเตอร์', ['key','prev','curr']);
  let meterData = meterSheet.getDataRange().getValues();
  for (let i = meterData.length - 1; i >= 1; i--) {
    const key = String(meterData[i][0]);
    // key format: P101_2569-04_elec → extract month part
    const parts = key.split('_');
    if (parts.length >= 2 && parts[1] < minKey) {
      meterSheet.deleteRow(i + 1);
      deleted.meters++;
    }
  }

  return { success: true, deleted: deleted, minMonth: minKey };
}

// ========================================
// Auto Cleanup Trigger
// ตั้งใน Apps Script: Triggers > Add Trigger
// Function: autoCleanup
// Event: Time-driven > Month timer > 1st of month
// ========================================
function autoCleanup() {
  const result = cleanup();
  Logger.log('Auto cleanup: ' + JSON.stringify(result));
}

// ========================================
// Helper
// ========================================
function getOrCreate(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}
