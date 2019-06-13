function openQRCamera(node) {
  var reader = new FileReader();
  reader.onload = function() {
    node.value = "";
    qrcode.callback = function(res) {
      if(res instanceof Error) {
        alert("QR コード画像が見つかりません。QR コードを含めた画像を指定してください。");
      } else {
        insertQrScanResult(res);
        document.getElementById("qr-scan-result").innerHTML = res
        alert("QR コードのスキャンが完了しました")
      }
    };
    qrcode.decode(reader.result);
  };
  reader.readAsDataURL(node.files[0]);
}

document.addEventListener('DOMContentLoaded', function() {
  initializeDB()
  showQrScanResult()
})

const showQrScanResult = function() {
  let dbRequest = indexedDB.open(defaultDbName);
  let tableName = defaultTableName

  dbRequest.onsuccess = function(event) {
    let db = event.target.result;
    let trans = db.transaction(tableName, 'readwrite');
    let store = trans.objectStore(tableName);

    let ul = document.getElementById('qr-scan-result-list')
    ul.innerHTML = ''

    store.openCursor().onsuccess = function (event) {
      let cursor = event.target.result;
      if (cursor) {
        console.log("result:" + cursor.key + " Text: " + cursor.value.scan_text);
        let li = document.createElement('li')
        li.textContent = cursor.key
        ul.appendChild(li)
        cursor.continue();
      }
    };
  }

  dbRequest.onerror = function(event){
    console.log('DBの接続に失敗しました。');
  }
}

const insertQrScanResult = function(scanData) {
  let dbRequest = indexedDB.open(defaultDbName);
  let tableName = defaultTableName
  let key = defaultKey
  let version;

  dbRequest.onupgradeneeded = function(event){
    let db = event.target.result;
    if(tableName){
      db.createObjectStore(tableName, {keyPath : key})
    }
    console.log('it is not needed.');
  }

  dbRequest.onsuccess = function(event){
    let db = event.target.result;
    let trans = db.transaction(tableName, 'readwrite');
    let store = trans.objectStore(tableName);
    let data = {scan_text: scanData}
    let putRequest = store.put(data);

    db.close();
    console.log('スキャンデータ追加完了');
  }

  dbRequest.onerror = function(event){
    console.log('DBの接続に失敗しました。');
  }
}

const defaultDbName = 'qrPackDb'

const initializeDB = () => {
  createDB()
  updateDB()
}

const createDB = function(dbName = defaultDbName){
  let dbRequest = indexedDB.open(dbName);

  dbRequest.onupgradeneeded = function(event){
    let db = event.target.result;
    console.log('DB 作成完了 DB名 : ' + dbName);
  }

  dbRequest.onsuccess = function(event){
    console.log('DB接続完了 DB名 : ' + dbName)
    let db = event.target.result;
    db.close();
  }

  dbRequest.onerror = function(event){
    console.log('DBの接続に失敗しました。');
  }
}

const defaultDbVer = 2
const defaultTableName = 'qr_pack_results'
const defaultKey = 'scan_text'

const updateDB = function(
    dbName = defaultDbName,
    dbVer = defaultDbVer,
    tableName = defaultTableName,
    key = defaultKey
  )
{
  let dbRequest = indexedDB.open(dbName, dbVer);
  let version;

  dbRequest.onupgradeneeded = function(event){
    let db = event.target.result;
    if(tableName){
      db.createObjectStore(tableName, {keyPath : key})
      console.log('DBにテーブルを追加しました。テーブル名 : ' + tableName + ' / keyPath : ' + key);
    }
  }

  dbRequest.onsuccess = function(event){
    let db = event.target.result;
    db.close();
    alert('スキャン準備が完了しました。')
  }

  dbRequest.onerror = function(event){
    alert('スキャン準備に失敗しました。');
  }
}

const insertDB = function(dbName = defaultDbName, tableName = defaultTableName, key){
  let dbRequest = indexedDB.open(dbName);
  let version;

  dbRequest.onupgradeneeded = function(event){
    let db = event.target.result;
    if(tableName){
      db.createObjectStore(tableName, {keyPath : key})
      console.log('DBにテーブルを追加しました。テーブル名 : ' + tableName);
    }
    console.log('it is not needed.');
  }

  dbRequest.onsuccess = function(event){
    let db = event.target.result;
    let trans = db.transaction(tableName, 'readwrite');
    let store = trans.objectStore(tableName);
    let data = {scan_text: 'aaabbb'}
    let putRequest = store.put(data);

    db.close();
  }

  dbRequest.onerror = function(event){
      console.log('DBの接続に失敗しました。');
  }
}

const clearDB = function(dbName = defaultDbName, tableName = defaultTableName){
  let confirmClearDB = window.confirm('本当にデータを削除しますか？')
  if(!confirmClearDB) { return }

  let dbRequest = indexedDB.open(dbName);

  dbRequest.onsuccess = function(event) {
    let db = event.target.result;
    let trans = db.transaction(tableName, "readwrite");

    trans.oncomplete = function(event) {
      let ul = document.getElementById('qr-scan-result-list')
      ul.innerHTML = ''
      alert('データ削除処理完了')
    }

    trans.onerror = function(event) {
      alert('データ削除処理失敗')
    }

    let objectStore = trans.objectStore(tableName)
    let objectStoreRequest = objectStore.clear()

    objectStoreRequest.onsuccess = function(event) {
      console.log('データ削除成功')
    }
  }
}

const deleteDB = function(dbName = defaultDbName){
  let confirmResult = window.confirm('本当に初期化しますか？データが全て削除されます。')
  if(!confirmResult) { return }
  let deleteRequest = indexedDB.deleteDatabase(dbName);

  deleteRequest.onsuccess = function(event){
    let ul = document.getElementById('qr-scan-result-list')
    ul.innerHTML = ''
    alert('データ削除完了')
  }

  deleteRequest.onerror = function(){
    alert('データ削除失敗')
  }
}
